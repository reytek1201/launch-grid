-- Admin access for the demo restaurant: who may edit content and read the inbox.
-- Sign-in is Supabase Auth (email link); this table decides which signed-in emails are admins.

create table trattoria_demo.admin_users (email text primary key check (email = lower(email)));
alter table trattoria_demo.admin_users enable row level security;

create function trattoria_demo.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from trattoria_demo.admin_users
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
$$;
revoke all on function trattoria_demo.is_admin() from public, anon;
grant execute on function trattoria_demo.is_admin() to authenticated;

-- A signed-in user can see only their own admin row.
create policy self_read on trattoria_demo.admin_users for select to authenticated
  using (email = lower(coalesce(auth.jwt() ->> 'email', '')));
grant select on trattoria_demo.admin_users to authenticated;

-- Admins edit content (and see hidden items; the public_read policies still apply to everyone else).
do $$
declare t text;
begin
  foreach t in array array['settings','menu_sections','menu_items','wine_sections','wines','hours_weekly','closures'] loop
    execute format('create policy admin_all on trattoria_demo.%I for all to authenticated using (trattoria_demo.is_admin()) with check (trattoria_demo.is_admin())', t);
    execute format('grant insert, update, delete on trattoria_demo.%I to authenticated', t);
  end loop;
end $$;

-- Admins work the inbox.
create policy admin_all on trattoria_demo.requests for all to authenticated
  using (trattoria_demo.is_admin()) with check (trattoria_demo.is_admin());
grant select, update, delete on trattoria_demo.requests to authenticated;

insert into trattoria_demo.admin_users (email) values ('keymacro.dev@gmail.com');
