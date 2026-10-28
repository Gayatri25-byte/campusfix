-- Protected storage. Buckets are PRIVATE; files are served through short-lived signed URLs.
-- Convention: the first folder in the object path is the uploader's user id, e.g. "<uid>/photo.jpg".
insert into storage.buckets (id, name, public) values
  ('issue-photos', 'issue-photos', false),
  ('proof-photos', 'proof-photos', false)
on conflict (id) do nothing;

create policy "issue photos: owner uploads" on storage.objects for insert to authenticated
  with check (bucket_id = 'issue-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "issue photos: signed-in read" on storage.objects for select to authenticated using (bucket_id = 'issue-photos');
create policy "proof photos: staff upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'proof-photos' and (public.is_admin() or public.has_role('staff')));
create policy "proof photos: signed-in read" on storage.objects for select to authenticated using (bucket_id = 'proof-photos');
-- Lost & Found evidence is text-only in this version, so there is deliberately no evidence bucket.
