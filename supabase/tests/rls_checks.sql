-- Manual RLS checks. Run in the Supabase SQL editor AFTER the migrations, with two test users created via Auth.
-- Replace the two UUIDs below with real user ids (student A and student B). NOT yet run by the author.
begin;
  set local role authenticated;
  select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-0000-0000-00000000000a', 'role', 'authenticated')::text, true);

  -- 1. A student must NOT be able to promote themselves.
  do $$ begin
    update profiles set role = 'admin' where id = '00000000-0000-0000-0000-00000000000a';
    raise exception 'FAIL: student promoted themselves';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end $$;

  -- 2. A student must NOT see other people's private Lost & Found details (expect 0 rows).
  do $$ declare n int; begin
    select count(*) into n from item_private p join items i on i.id = p.item_id where i.poster_id <> auth.uid();
    if n <> 0 then raise exception 'FAIL: private details visible (% rows)', n; end if;
  end $$;

  -- 3. A student must NOT see others' claims or pickup codes (expect 0).
  do $$ declare n int; begin
    select count(*) into n from claims where claimant_id <> auth.uid();
    select n + count(*) into n from claim_pickup where claimant_id <> auth.uid();
    if n <> 0 then raise exception 'FAIL: claims/codes visible'; end if;
  end $$;

  -- 4. A student must NOT be able to approve an event or change issue status directly.
  do $$ begin
    update events set status = 'approved';
    if found then raise exception 'FAIL: student approved events'; end if;
  end $$;
  do $$ begin
    perform public.set_issue_status((select id from issues limit 1), 'Resolved', null, null, 'fixed it all');
    raise exception 'FAIL: student resolved an issue';
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end $$;
rollback;
select 'RLS checks finished: no FAIL exceptions means they passed' as result;
