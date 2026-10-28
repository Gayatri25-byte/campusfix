-- Helper functions and server-side workflows. Anything that must be atomic or secret lives here, not in the browser.
create or replace function public.my_role() returns app_role language sql stable security definer set search_path = public as
$$ select role from profiles where id = auth.uid() and active $$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as
$$ select coalesce(public.my_role() = 'admin', false) $$;
create or replace function public.has_role(variadic roles app_role[]) returns boolean language sql stable security definer set search_path = public as
$$ select coalesce(public.my_role() = any(roles), false) $$;

-- New sign-ups are ALWAYS students. The role is never read from client-supplied metadata.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Only admins may change role/active; users may edit their own name and department.
create or replace function public.guard_profile_update() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.role is distinct from old.role or new.active is distinct from old.active or new.team is distinct from old.team) and not public.is_admin() then
    raise exception 'Only administrators can change roles or account status';
  end if;
  if new.id = auth.uid() and new.role is distinct from old.role then
    raise exception 'You cannot change your own role';
  end if;
  return new;
end $$;
create trigger profile_guard before update on profiles for each row execute function public.guard_profile_update();

create or replace function public.notify(uids uuid[], msg text, lnk text default 'dashboard') returns void language sql security definer set search_path = public as
$$ insert into notifications (user_id, text, link) select distinct u, msg, lnk from unnest(uids) u where u is not null $$;

-- Atomic registration with capacity + waitlist (row lock prevents overbooking).
create or replace function public.register_event(p_event bigint) returns text language plpgsql security definer set search_path = public as $$
declare ev events; taken int; st text;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  select * into ev from events where id = p_event for update;
  if not found or ev.status <> 'approved' then raise exception 'This event is not open for registration'; end if;
  if ev.starts_at < now() then raise exception 'This event has already started'; end if;
  select count(*) into taken from registrations where event_id = p_event and status = 'registered';
  st := case when taken < ev.capacity then 'registered' else 'waitlist' end;
  insert into registrations (event_id, user_id, status) values (p_event, auth.uid(), st);
  return st;
exception when unique_violation then raise exception 'You are already registered or waitlisted';
end $$;

create or replace function public.cancel_registration(p_event bigint) returns void language plpgsql security definer set search_path = public as $$
declare mine registrations; nxt registrations;
begin
  select * into mine from registrations where event_id = p_event and user_id = auth.uid() and status <> 'cancelled' for update;
  if not found then raise exception 'You are not registered for this event'; end if;
  update registrations set status = 'cancelled' where id = mine.id;
  if mine.status = 'registered' then
    select * into nxt from registrations where event_id = p_event and status = 'waitlist' order by created_at limit 1 for update;
    if found then
      update registrations set status = 'registered' where id = nxt.id;
      perform public.notify(array[nxt.user_id], 'A seat opened up and you are now registered.', 'events');
    end if;
  end if;
end $$;

create or replace function public.submit_claim(p_item bigint, p_evidence text) returns void language plpgsql security definer set search_path = public as $$
declare it items; pending int;
begin
  select * into it from items where id = p_item for update;
  if not found or it.type <> 'found' or it.status in ('returned','ready_for_pickup') then raise exception 'This item cannot be claimed'; end if;
  if it.poster_id = auth.uid() then raise exception 'You cannot claim an item you posted'; end if;
  insert into claims (item_id, claimant_id, evidence) values (p_item, auth.uid(), p_evidence);
  select count(*) into pending from claims where item_id = p_item and status = 'pending';
  update items set status = case when pending > 1 then 'disputed' else 'claim_pending' end where id = p_item;
  perform public.notify(array[it.poster_id], 'New claim on ' || it.item, 'lostfound');
exception when unique_violation then raise exception 'You already have a claim on this item';
end $$;

create or replace function public.review_claim(p_claim bigint, p_approve boolean) returns void language plpgsql security definer set search_path = public as $$
declare c claims; it items; left_n int;
begin
  select * into c from claims where id = p_claim for update;
  if not found or c.status <> 'pending' then raise exception 'Claim not found or already decided'; end if;
  select * into it from items where id = c.item_id for update;
  if not (public.is_admin() or public.has_role('staff') or it.poster_id = auth.uid()) then raise exception 'You cannot review this claim'; end if;
  if it.status = 'disputed' and not public.is_admin() then raise exception 'Competing claims must be settled by an administrator'; end if;
  if p_approve then
    update claims set status = 'approved', decided_by = auth.uid() where id = p_claim;
    update claims set status = 'rejected' where item_id = it.id and status = 'pending' and id <> p_claim;
    insert into claim_pickup (claim_id, claimant_id, code) values (p_claim, c.claimant_id, lpad((floor(random()*9000)+1000)::int::text, 4, '0'));
    update items set status = 'ready_for_pickup' where id = it.id;
    perform public.notify(array[c.claimant_id], 'Claim approved for ' || it.item || '. Your pickup code is in Lost & Found.', 'lostfound');
  else
    update claims set status = 'rejected', decided_by = auth.uid() where id = p_claim;
    select count(*) into left_n from claims where item_id = it.id and status = 'pending';
    update items set status = case when left_n > 1 then 'disputed' when left_n = 1 then 'claim_pending' else 'open' end where id = it.id;
    perform public.notify(array[c.claimant_id], 'Your claim on ' || it.item || ' was not approved.', 'lostfound');
  end if;
end $$;

create or replace function public.confirm_handover(p_claim bigint, p_code text) returns void language plpgsql security definer set search_path = public as $$
declare c claims; it items;
begin
  select * into c from claims where id = p_claim and status = 'approved' for update;
  if not found then raise exception 'No approved claim to hand over'; end if;
  select * into it from items where id = c.item_id;
  if not (public.is_admin() or public.has_role('staff') or it.poster_id = auth.uid()) then raise exception 'You cannot confirm handovers'; end if;
  if not exists (select 1 from claim_pickup where claim_id = p_claim and code = trim(p_code)) then raise exception 'That pickup code does not match'; end if;
  update claims set status = 'collected' where id = p_claim;
  update items set status = 'returned' where id = it.id;
  perform public.notify(array[c.claimant_id], 'Handover confirmed for ' || it.item, 'lostfound');
end $$;

-- Safety reports force High priority and alert admins.
create or replace function public.issue_defaults() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.safety then new.priority := 'High'; end if;
  new.status := 'Submitted'; new.assignee := null; new.proof_note := null; new.proof_photo_path := null; new.proof_at := null;
  return new;
end $$;
create trigger issues_defaults before insert on issues for each row execute function public.issue_defaults();
create or replace function public.issue_after_insert() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into issue_events (issue_id, status, note, actor_id) values (new.id, 'Submitted', case when new.safety then 'Report received and flagged as a safety concern' else 'Report received' end, new.reporter_id);
  perform public.notify((select array_agg(id) from profiles where role = 'admin' and active), (case when new.safety then 'SAFETY report: ' else 'New report: ' end) || new.title, 'care-desk');
  return new;
end $$;
create trigger issues_after_insert after insert on issues for each row execute function public.issue_after_insert();

create or replace function public.set_issue_status(p_issue bigint, p_status text, p_note text default null, p_assignee text default null, p_proof text default null) returns void language plpgsql security definer set search_path = public as $$
declare i issues;
begin
  select * into i from issues where id = p_issue for update;
  if not found then raise exception 'Issue not found'; end if;
  if p_status = 'Verified' or (p_status = 'In Progress' and i.status = 'Resolved') then
    if i.reporter_id <> auth.uid() then raise exception 'Only the person who reported this issue can verify it'; end if;
    if i.status <> 'Resolved' then raise exception 'This issue is not waiting for verification'; end if;
    update issues set status = p_status, proof_note = case when p_status = 'In Progress' then null else proof_note end where id = p_issue;
  else
    if not (public.is_admin() or public.has_role('staff')) then raise exception 'Not allowed'; end if;
    if p_status = 'Resolved' and coalesce(char_length(trim(p_proof)),0) < 5 then raise exception 'Describe what was fixed (5+ characters)'; end if;
    update issues set status = p_status, assignee = coalesce(p_assignee, assignee),
      proof_note = case when p_status = 'Resolved' then p_proof else proof_note end,
      proof_at = case when p_status = 'Resolved' then now() else proof_at end where id = p_issue;
  end if;
  insert into issue_events (issue_id, status, note, actor_id) values (p_issue, p_status, coalesce(p_note, 'Status changed to ' || p_status), auth.uid());
  perform public.notify(array[i.reporter_id], 'Your report "' || i.title || '" is now ' || p_status || '.', case when p_status = 'Resolved' then 'proof' else 'reports' end);
end $$;
