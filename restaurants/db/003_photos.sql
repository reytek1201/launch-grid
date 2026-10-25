-- Photo uploads for dishes: a public-read storage bucket that only admins can write to.

alter table trattoria_demo.menu_items
  add column photo_path text,   -- object path inside the bucket, e.g. dishes/burrata-ab12-1730000000.webp
  add column photo_alt text;    -- what the photo shows, for screen readers

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trattoria-demo', 'trattoria-demo', true, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Anyone may view a file by its public URL (public bucket). Only admins may add, replace or remove files.
create policy trattoria_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'trattoria-demo' and trattoria_demo.is_admin());
create policy trattoria_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'trattoria-demo' and trattoria_demo.is_admin())
  with check (bucket_id = 'trattoria-demo' and trattoria_demo.is_admin());
create policy trattoria_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'trattoria-demo' and trattoria_demo.is_admin());
