-- Gallery uploads: photos the restaurant adds from the admin, shown on the public Gallery page.
-- Files live in the existing storage bucket (prefix gallery/); this table holds the order, caption and description.

create table trattoria_demo.gallery_photos (
  id text primary key,
  path text not null,                                  -- object path in the bucket, e.g. gallery/long-table-ab12-lz3k.webp
  alt text check (alt is null or char_length(alt) <= 300),       -- what the photo shows, for screen readers
  caption text check (caption is null or char_length(caption) <= 80), -- the handwritten line under it
  width int not null check (width between 1 and 4000),
  height int not null check (height between 1 and 4000),
  sort int not null default 0,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

alter table trattoria_demo.gallery_photos enable row level security;

create policy public_read on trattoria_demo.gallery_photos for select to anon using (not hidden);
create policy admin_all on trattoria_demo.gallery_photos for all to authenticated
  using (trattoria_demo.is_admin()) with check (trattoria_demo.is_admin());

grant select on trattoria_demo.gallery_photos to anon;
grant select, insert, update, delete on trattoria_demo.gallery_photos to authenticated;
