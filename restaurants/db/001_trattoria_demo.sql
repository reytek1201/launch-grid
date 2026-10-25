-- Trattoria Cinque Lune (demo): content and request inbox.
-- Lives in its own schema so it never touches the host project's `public` tables.
-- Moving to a client's own project later = pg_dump this schema, restore, change two env vars.

create schema if not exists trattoria_demo;

-- One row: the restaurant's basics and its reservation rules.
create table trattoria_demo.settings (
  id int primary key default 1 check (id = 1),
  name text not null, tagline text not null, blurb text not null,
  street text not null, city text not null, state text not null, zip text not null,
  phone text not null, email text not null, timezone text not null,
  max_party int not null, last_seating_mins int not null, lead_hours int not null, days_ahead int not null
);

create table trattoria_demo.menu_sections (
  id text primary key, title text not null, note text,
  sort int not null default 0, hidden boolean not null default false
);
create table trattoria_demo.menu_items (
  id text primary key,
  section_id text not null references trattoria_demo.menu_sections(id) on delete cascade,
  name text not null, description text,
  price_cents int check (price_cents is null or price_cents >= 0), -- null = market price
  tags text[] not null default '{}' check (tags <@ array['vegetarian','vegan','gluten-free','spicy']),
  sold_out boolean not null default false,           -- the "86" switch
  photo text, sort int not null default 0, hidden boolean not null default false
);

create table trattoria_demo.wine_sections (
  id text primary key, title text not null, note text,
  sort int not null default 0, hidden boolean not null default false
);
create table trattoria_demo.wines (
  id text primary key,
  section_id text not null references trattoria_demo.wine_sections(id) on delete cascade,
  name text not null, producer text not null, region text not null, grape text, vintage int,
  glass_cents int, bottle_cents int, notes text,
  pairs text[] not null default '{}', organic boolean not null default false,
  sold_out boolean not null default false, pick boolean not null default false,
  sort int not null default 0, hidden boolean not null default false
);

-- Hours: one row per open interval (a split day has two). A day with no rows is closed.
create table trattoria_demo.hours_weekly (
  day int not null check (day between 0 and 6), -- 0 = Sunday
  open_at time not null, close_at time not null, sort int not null default 0,
  primary key (day, open_at)
);
create table trattoria_demo.closures (
  date date primary key, label text not null
);

-- The inbox. Nobody reads or writes it from the browser; requests arrive through submit_request().
create table trattoria_demo.requests (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('reservation','event','contact')),
  summary text not null check (char_length(summary) between 1 and 200),
  fields jsonb not null check (pg_column_size(fields) < 8000),
  status text not null default 'new' check (status in ('new','seen','done')),
  created_at timestamptz not null default now()
);

-- Row-level security on everything.
alter table trattoria_demo.settings enable row level security;
alter table trattoria_demo.menu_sections enable row level security;
alter table trattoria_demo.menu_items enable row level security;
alter table trattoria_demo.wine_sections enable row level security;
alter table trattoria_demo.wines enable row level security;
alter table trattoria_demo.hours_weekly enable row level security;
alter table trattoria_demo.closures enable row level security;
alter table trattoria_demo.requests enable row level security; -- no policies: closed to the browser

-- The public site may read published content, and nothing else.
create policy public_read on trattoria_demo.settings for select to anon, authenticated using (true);
create policy public_read on trattoria_demo.menu_sections for select to anon, authenticated using (not hidden);
create policy public_read on trattoria_demo.menu_items for select to anon, authenticated using (not hidden);
create policy public_read on trattoria_demo.wine_sections for select to anon, authenticated using (not hidden);
create policy public_read on trattoria_demo.wines for select to anon, authenticated using (not hidden);
create policy public_read on trattoria_demo.hours_weekly for select to anon, authenticated using (true);
create policy public_read on trattoria_demo.closures for select to anon, authenticated using (true);

grant usage on schema trattoria_demo to anon, authenticated;
grant select on trattoria_demo.settings, trattoria_demo.menu_sections, trattoria_demo.menu_items,
  trattoria_demo.wine_sections, trattoria_demo.wines, trattoria_demo.hours_weekly, trattoria_demo.closures
  to anon, authenticated;

-- The only way in for a reservation, event or contact request.
create function trattoria_demo.submit_request(p_kind text, p_summary text, p_fields jsonb)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_kind not in ('reservation','event','contact') then raise exception 'bad kind'; end if;
  -- crude flood guard: at most 30 new requests per minute for the whole demo
  if (select count(*) from trattoria_demo.requests where created_at > now() - interval '1 minute') >= 30 then
    raise exception 'busy, try again shortly';
  end if;
  insert into trattoria_demo.requests (kind, summary, fields) values (p_kind, left(p_summary, 200), coalesce(p_fields, '{}'::jsonb));
end $$;
revoke all on function trattoria_demo.submit_request(text, text, jsonb) from public;
grant execute on function trattoria_demo.submit_request(text, text, jsonb) to anon, authenticated;
