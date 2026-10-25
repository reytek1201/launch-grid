-- LaunchGrid Studio's own site: the Start a project inbox.
-- Lives in the shared Reytek1201 project, in its own schema. Touches nothing else.
-- The table is closed to the browser; the only way in is submit_inquiry(), called by the site's server action.

create schema if not exists launchgrid_site;

create table launchgrid_site.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('band','restaurant','other')),
  name text not null,
  email text not null,
  business text not null,
  link text,
  need text not null,
  timing text,
  ref text,
  client text,
  status text not null default 'new' check (status in ('new','replied','proposal','won','lost','spam'))
);
create index inquiries_created_idx on launchgrid_site.inquiries (created_at desc);
create index inquiries_client_idx on launchgrid_site.inquiries (client, created_at desc);

alter table launchgrid_site.inquiries enable row level security;
-- No policies on purpose: anon and authenticated cannot read or write the table directly.
revoke all on launchgrid_site.inquiries from anon, authenticated;

create function launchgrid_site.submit_inquiry(
  p_kind text, p_name text, p_email text, p_business text, p_need text,
  p_link text default null, p_timing text default null, p_ref text default null, p_client text default null
) returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if p_kind not in ('band','restaurant','other') then raise exception 'bad kind'; end if;
  if coalesce(trim(p_name),'') = '' or coalesce(trim(p_business),'') = '' or length(trim(coalesce(p_need,''))) < 20 then
    raise exception 'missing fields';
  end if;
  if p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'bad email'; end if;
  -- the whole site: at most 20 new inquiries a minute
  if (select count(*) from launchgrid_site.inquiries where created_at > now() - interval '1 minute') >= 20 then
    raise exception 'busy, try again shortly';
  end if;
  if p_client is not null then
    -- one visitor: at most 5 in 10 minutes
    if (select count(*) from launchgrid_site.inquiries where client = p_client and created_at > now() - interval '10 minutes') >= 5 then
      raise exception 'too many requests';
    end if;
    -- the same message twice (a double tap) is stored once
    if exists (
      select 1 from launchgrid_site.inquiries
      where client = p_client and email = lower(trim(p_email)) and need = left(trim(p_need), 600)
        and created_at > now() - interval '10 minutes'
    ) then
      return false;
    end if;
  end if;
  insert into launchgrid_site.inquiries (kind, name, email, business, link, need, timing, ref, client)
  values (p_kind, left(trim(p_name), 120), lower(trim(p_email)), left(trim(p_business), 160),
          nullif(left(trim(coalesce(p_link,'')), 300), ''), left(trim(p_need), 600),
          nullif(left(trim(coalesce(p_timing,'')), 40), ''), nullif(left(trim(coalesce(p_ref,'')), 40), ''), left(p_client, 64));
  return true;
end $$;

revoke all on function launchgrid_site.submit_inquiry(text, text, text, text, text, text, text, text, text) from public;
grant usage on schema launchgrid_site to anon, authenticated;
grant execute on function launchgrid_site.submit_inquiry(text, text, text, text, text, text, text, text, text) to anon, authenticated;
