-- ============================================================================
-- 0003_storage.sql
-- Supabase Storage buckets for images/files, with matching access policies.
-- Folders inside the single "media" bucket: products/, services/, projects/,
-- gallery/, quotes/  (quotes/ holds customer-uploaded drawings & references).
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Public can view anything in the public "media" bucket (product photos,
-- service images, project/gallery photos). Quote attachments are uploaded
-- here too but under quotes/ — treat that subfolder as write-only for the
-- public in the policies below.
create policy "media: public read"
  on storage.objects for select
  using (bucket_id = 'media');

-- Public can upload ONLY into quotes/ (attaching drawings/reference images
-- to a quote request they are submitting).
create policy "media: public upload to quotes folder"
  on storage.objects for insert
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'quotes'
  );

-- Admins can upload/update/delete anywhere in the bucket.
create policy "media: admin write"
  on storage.objects for insert
  with check (bucket_id = 'media' and public.is_admin());

create policy "media: admin update"
  on storage.objects for update
  using (bucket_id = 'media' and public.is_admin());

create policy "media: admin delete"
  on storage.objects for delete
  using (bucket_id = 'media' and public.is_admin());
