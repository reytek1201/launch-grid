-- Supabase advisor fixes (Oct 25): indexes on the section links, a faster admin_users rule,
-- and public_read narrowed to anon (the public site reads without a session; admins read through admin_all).

create index if not exists menu_items_section_id_idx on trattoria_demo.menu_items (section_id);
create index if not exists wines_section_id_idx on trattoria_demo.wines (section_id);

alter policy self_read on trattoria_demo.admin_users
  using (email = lower(coalesce(((select auth.jwt()) ->> 'email'), '')));

do $$
declare t text;
begin
  foreach t in array array['settings','menu_sections','menu_items','wine_sections','wines','hours_weekly','closures'] loop
    execute format('alter policy public_read on trattoria_demo.%I to anon', t);
  end loop;
end $$;
