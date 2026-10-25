-- Spam and double-tap guards for the public request function.
-- submit_request now takes an optional anonymous visitor fingerprint (a salted hash made on the server, never an IP)
-- and returns true when a new request was stored, false when it was an identical repeat.
-- Callers that pass only the first three arguments keep working.

alter table trattoria_demo.requests add column client text;
create index requests_client_idx on trattoria_demo.requests (client, created_at desc);

drop function trattoria_demo.submit_request(text, text, jsonb);

create function trattoria_demo.submit_request(p_kind text, p_summary text, p_fields jsonb, p_client text default null)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if p_kind not in ('reservation','event','contact') then raise exception 'bad kind'; end if;
  -- the whole demo: at most 30 new requests a minute
  if (select count(*) from trattoria_demo.requests where created_at > now() - interval '1 minute') >= 30 then
    raise exception 'busy, try again shortly';
  end if;
  if p_client is not null then
    -- one visitor: at most 5 requests in 10 minutes
    if (select count(*) from trattoria_demo.requests where client = p_client and created_at > now() - interval '10 minutes') >= 5 then
      raise exception 'too many requests';
    end if;
    -- the same request twice in a row (a double tap) is stored once
    if exists (
      select 1 from trattoria_demo.requests
      where client = p_client and kind = p_kind and summary = left(p_summary, 200)
        and fields = coalesce(p_fields, '{}'::jsonb) and created_at > now() - interval '2 minutes'
    ) then
      return false;
    end if;
  end if;
  insert into trattoria_demo.requests (kind, summary, fields, client)
  values (p_kind, left(p_summary, 200), coalesce(p_fields, '{}'::jsonb), left(p_client, 64));
  return true;
end $$;

revoke all on function trattoria_demo.submit_request(text, text, jsonb, text) from public;
grant execute on function trattoria_demo.submit_request(text, text, jsonb, text) to anon, authenticated;
