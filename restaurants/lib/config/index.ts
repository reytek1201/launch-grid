import type { Closure, DayHours, MenuItem, MenuSection, Photo, SiteData, Wine, WineSection } from "@/lib/types";
import { trattoria } from "@/clients/demo/fixtures/trattoria";
import images from "@/clients/demo/images.json";

// One deploy per client: set NEXT_PUBLIC_CLIENT. Only "demo" exists so far.
export const CLIENT = process.env.NEXT_PUBLIC_CLIENT ?? "demo";

/*
 * Where the restaurant's content lives.
 * With SUPABASE_URL and SUPABASE_ANON_KEY set, menu, wines, hours, closures and settings come from the database
 * (schema `trattoria_demo` for the demo), re-read every minute and on demand (tag "site").
 * Without them, or if the database is unreachable, the typed fixtures are used, so the site never shows an error page.
 * Events and story copy stay in the fixtures for now.
 */
const URL_ = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_ANON_KEY;
const SCHEMA = process.env.SUPABASE_SCHEMA ?? "trattoria_demo";
export const SITE_TAG = "site";

async function rows<T>(table: string, query: string): Promise<T[]> {
  const res = await fetch(`${URL_}/rest/v1/${table}?${query}`, {
    headers: { apikey: KEY!, "Accept-Profile": SCHEMA },
    next: { revalidate: 60, tags: [SITE_TAG] },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`${table}: ${res.status}`);
  return res.json();
}

type Row = Record<string, unknown>;
const opt = <T,>(v: T | null | undefined) => (v === null || v === undefined ? undefined : v);
const hhmm = (t: string) => t.slice(0, 5);

async function fromDatabase(): Promise<SiteData> {
  const [settings, secs, items, wsecs, wines, hours, closures] = await Promise.all([
    rows<Row>("settings", "select=*&id=eq.1"),
    rows<Row>("menu_sections", "select=*&order=sort"),
    rows<Row>("menu_items", "select=*&order=sort"),
    rows<Row>("wine_sections", "select=*&order=sort"),
    rows<Row>("wines", "select=*&order=sort"),
    rows<Row>("hours_weekly", "select=*&order=day,sort"),
    rows<Row>("closures", "select=*&order=date"),
  ]);
  const s = settings[0];
  if (!s) throw new Error("no settings row");

  const menu: MenuSection[] = secs.map((sec) => ({
    id: sec.id as string,
    title: sec.title as string,
    note: opt(sec.note as string | null),
    items: items
      .filter((i) => i.section_id === sec.id)
      .map((i): MenuItem => ({
        id: i.id as string,
        name: i.name as string,
        description: opt(i.description as string | null),
        price: (i.price_cents as number | null) ?? null,
        tags: (i.tags as MenuItem["tags"]) ?? [],
        soldOut: i.sold_out ? true : undefined,
        photo: opt(i.photo as string | null),
      })),
  }));

  const cellar: WineSection[] = wsecs.map((sec) => ({
    id: sec.id as string,
    title: sec.title as string,
    note: opt(sec.note as string | null),
    wines: wines
      .filter((w) => w.section_id === sec.id)
      .map((w): Wine => ({
        id: w.id as string,
        name: w.name as string,
        producer: w.producer as string,
        region: w.region as string,
        grape: opt(w.grape as string | null),
        vintage: opt(w.vintage as number | null),
        glass: opt(w.glass_cents as number | null),
        bottle: opt(w.bottle_cents as number | null),
        notes: opt(w.notes as string | null),
        pairs: (w.pairs as string[]) ?? [],
        organic: w.organic ? true : undefined,
        soldOut: w.sold_out ? true : undefined,
        pick: w.pick ? true : undefined,
      })),
  }));

  const week: DayHours[] = ([0, 1, 2, 3, 4, 5, 6] as const).map((day) => ({
    day,
    intervals: hours.filter((h) => h.day === day).map((h) => ({ open: hhmm(h.open_at as string), close: hhmm(h.close_at as string) })),
  }));
  const closed: Closure[] = closures.map((c) => ({ date: c.date as string, label: c.label as string }));

  return {
    ...trattoria, // events, story, tier and isDemo stay as configured
    name: s.name as string,
    tagline: s.tagline as string,
    blurb: s.blurb as string,
    address: { street: s.street as string, city: s.city as string, state: s.state as string, zip: s.zip as string },
    phone: s.phone as string,
    email: s.email as string,
    timezone: s.timezone as string,
    reservations: {
      maxParty: s.max_party as number,
      lastSeatingMins: s.last_seating_mins as number,
      leadHours: s.lead_hours as number,
      daysAhead: s.days_ahead as number,
    },
    hours: week,
    closures: closed,
    menu,
    cellar,
  };
}

export async function getSiteData(): Promise<SiteData> {
  if (!URL_ || !KEY) return trattoria;
  try {
    return await fromDatabase();
  } catch (e) {
    console.error("site data: falling back to fixtures:", e instanceof Error ? e.message : e);
    return trattoria;
  }
}

export const photos = images as Record<string, Photo>;

export function getPhoto(key: string | undefined): Photo | undefined {
  return key ? photos[key.toLowerCase()] : undefined;
}
