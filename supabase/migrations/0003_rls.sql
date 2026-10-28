-- Row Level Security. Every table is locked by default; policies below open exactly what each role needs.
alter table profiles enable row level security;
alter table issues enable row level security;
alter table issue_affected enable row level security;
alter table issue_events enable row level security;
alter table items enable row level security;
alter table item_private enable row level security;
alter table claims enable row level security;
alter table claim_pickup enable row level security;
alter table events enable row level security;
alter table registrations enable row level security;
alter table announcements enable row level security;
alter table academic_items enable row level security;
alter table schedule enable row level security;
alter table feedback enable row level security;
alter table feedback_votes enable row level security;
alter table notifications enable row level security;

-- Profiles: everyone signed in can see names/roles; you edit yourself; admins edit anyone (trigger guards role changes).
create policy profiles_read on profiles for select to authenticated using (true);
create policy profiles_update_self on profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin on profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Campus Care. Status changes go through set_issue_status(); direct UPDATE is admin-only.
create policy issues_read on issues for select to authenticated using (true);
create policy issues_insert on issues for insert to authenticated with check (reporter_id = auth.uid());
create policy issues_admin_update on issues for update to authenticated using (public.is_admin());
create policy affected_read on issue_affected for select to authenticated using (true);
create policy affected_add on issue_affected for insert to authenticated with check (user_id = auth.uid());
create policy issue_events_read on issue_events for select to authenticated using (true);

-- Lost & Found. Public list shows only non-private columns; private details/contacts/evidence are restricted.
create policy items_read on items for select to authenticated using (true);
create policy items_insert on items for insert to authenticated with check (poster_id = auth.uid());
create policy items_close_lost on items for update to authenticated using (poster_id = auth.uid() and type = 'lost') with check (type = 'lost');
create policy item_private_read on item_private for select to authenticated
  using (public.is_admin() or public.has_role('staff') or exists (select 1 from items i where i.id = item_id and i.poster_id = auth.uid()));
create policy item_private_insert on item_private for insert to authenticated
  with check (exists (select 1 from items i where i.id = item_id and i.poster_id = auth.uid()));
create policy claims_read on claims for select to authenticated
  using (claimant_id = auth.uid() or public.is_admin() or public.has_role('staff') or exists (select 1 from items i where i.id = item_id and i.poster_id = auth.uid()));
-- No INSERT/UPDATE policy on claims: claims are created and decided only by submit_claim()/review_claim().
create policy pickup_read_claimant on claim_pickup for select to authenticated using (claimant_id = auth.uid());

-- Events: only approved events are public; organizers see their own; admins see all.
create policy events_read on events for select to authenticated using (status = 'approved' or organizer_id = auth.uid() or public.is_admin());
create policy events_read_anon on events for select to anon using (status = 'approved');
create policy events_propose on events for insert to authenticated
  with check (organizer_id = auth.uid() and public.has_role('organizer','faculty','admin') and (status = 'pending' or public.is_admin()));
create policy events_admin_update on events for update to authenticated using (public.is_admin());
create policy regs_read on registrations for select to authenticated
  using (user_id = auth.uid() or public.is_admin() or exists (select 1 from events e where e.id = event_id and e.organizer_id = auth.uid()));
-- Registering/cancelling goes through the RPCs. Check-in is allowed for the event's organizer or an admin:
create policy regs_checkin on registrations for update to authenticated
  using (public.is_admin() or exists (select 1 from events e where e.id = event_id and e.organizer_id = auth.uid()));

create policy ann_read on announcements for select to authenticated using (audience = 'all' or audience::text = public.my_role()::text or public.is_admin());
create policy ann_post on announcements for insert to authenticated with check (author_id = auth.uid() and public.has_role('faculty','staff','admin') and (pinned = false or public.is_admin()));
create policy academic_read on academic_items for select to authenticated using (true);
create policy academic_post on academic_items for insert to authenticated with check (author_id = auth.uid() and public.has_role('faculty','admin'));
create policy schedule_read on schedule for select to authenticated using (student_id = auth.uid() or faculty_id = auth.uid() or public.is_admin());

create policy feedback_read on feedback for select to authenticated using (hidden = false or public.is_admin());
create policy feedback_insert on feedback for insert to authenticated with check (author_id = auth.uid());
create policy feedback_moderate on feedback for update to authenticated using (public.is_admin());
create policy votes_read on feedback_votes for select to authenticated using (true);
create policy votes_add on feedback_votes for insert to authenticated with check (user_id = auth.uid());
create policy votes_remove on feedback_votes for delete to authenticated using (user_id = auth.uid());

create policy notifications_own on notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_mark on notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Anonymous feedback authors: expose a view that hides author_id from non-admins.
create view feedback_public with (security_invoker = true) as
  select id, title, body, category, status, created_at, case when anonymous and not public.is_admin() then null else author_id end as author_id, anonymous from feedback;

-- Function privileges: the RPCs are for signed-in users only.
revoke all on function public.register_event(bigint), public.cancel_registration(bigint), public.submit_claim(bigint,text),
  public.review_claim(bigint,boolean), public.confirm_handover(bigint,text), public.set_issue_status(bigint,text,text,text,text) from public, anon;
grant execute on function public.register_event(bigint), public.cancel_registration(bigint), public.submit_claim(bigint,text),
  public.review_claim(bigint,boolean), public.confirm_handover(bigint,text), public.set_issue_status(bigint,text,text,text,text) to authenticated;
revoke all on function public.notify(uuid[],text,text) from public, anon, authenticated;
