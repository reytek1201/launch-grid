// Reads and checks a client's intake.json, then turns it into database rows and the site's fallback content.
// Used by new-client.mjs. See clients/_template/intake.example.json for the shape.
const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const TAGS = ["vegetarian", "vegan", "gluten-free", "spicy"];
const EMAIL = /^[^@\s']+@[^@\s']+\.[^@\s']+$/;

export const slugify = (s) =>
  String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "item";

const cents = (v, where, errs, allowNull = false) => {
  if (v === null || v === undefined || v === "" || v === "MP") {
    if (!allowNull) errs.push(`${where}: price is missing`);
    return null;
  }
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 5000) {
    errs.push(`${where}: price "${v}" is not a number of dollars (use 14 or 14.5; leave out or "MP" for market price)`);
    return null;
  }
  return Math.round(n * 100);
};

/** Returns { data, errors }. data uses cents and ids; nothing is written. */
export function readIntake(raw) {
  const errs = [];
  const need = (k) => {
    if (typeof raw[k] !== "string" || !raw[k].trim()) errs.push(`"${k}" is required`);
    return String(raw[k] ?? "").trim();
  };
  const a = raw.address ?? {};
  const d = {
    name: need("name"),
    tagline: String(raw.tagline ?? "").trim() || "Edit this tagline in the admin.",
    blurb: String(raw.blurb ?? "").trim() || "Tell guests what makes this place worth the trip. Edit this in the admin.",
    motto: raw.motto ? String(raw.motto).trim() : undefined,
    phone: need("phone"),
    email: need("email"),
    timezone: String(raw.timezone ?? "America/New_York"),
    address: { street: String(a.street ?? "").trim(), city: String(a.city ?? "").trim(), state: String(a.state ?? "").trim(), zip: String(a.zip ?? "").trim() },
    admins: (Array.isArray(raw.admins) ? raw.admins : String(raw.admins ?? "").split(",")).map((e) => String(e).trim().toLowerCase()).filter(Boolean),
    reservations: { maxParty: 8, lastSeatingMins: 30, leadHours: 2, daysAhead: 60, ...(raw.reservations ?? {}) },
    links: {},
    hours: [],
    closures: [],
    menu: [],
    cellar: [],
  };
  for (const k of ["street", "city", "state", "zip"]) if (!d.address[k]) errs.push(`address.${k} is required`);
  if (d.email && !EMAIL.test(d.email)) errs.push(`email "${d.email}" is not valid`);
  if (d.admins.length === 0) errs.push('"admins" needs at least one email (who may sign in to the admin)');
  for (const e of d.admins) if (!EMAIL.test(e)) errs.push(`admin "${e}" is not a valid email`);
  for (const k of ["maxParty", "lastSeatingMins", "leadHours", "daysAhead"]) if (!Number.isInteger(d.reservations[k]) || d.reservations[k] < 0) errs.push(`reservations.${k} must be a whole number`);
  for (const k of ["order", "reserve"]) {
    const v = raw.links?.[k];
    if (!v) continue;
    if (/^https:\/\/[^\s]+\.[^\s]+$/.test(v)) d.links[k] = v;
    else errs.push(`links.${k} must start with https://`);
  }

  // Hours: { "tue": ["17:00-21:30"], "sun": ["12:00-15:00", "16:00-21:00"] }; a missing day is closed.
  const hrs = raw.hours ?? {};
  for (const k of Object.keys(hrs)) if (!DAYS.includes(k.toLowerCase())) errs.push(`hours: "${k}" is not a day (use ${DAYS.join(", ")})`);
  DAYS.forEach((day, i) => {
    const list = hrs[day] ?? [];
    list.forEach((span) => {
      const m = /^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/.exec(span);
      if (!m || +m[1] > 23 || +m[3] > 23 || +m[2] > 59 || +m[4] > 59) return errs.push(`hours.${day}: "${span}" should look like 17:00-21:30`);
      d.hours.push({ day: i, open: `${m[1]}:${m[2]}`, close: `${m[3]}:${m[4]}` });
    });
  });
  const dates = new Set();
  for (const c of raw.closures ?? []) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(c?.date ?? "") || !String(c?.label ?? "").trim()) errs.push(`closures: each needs a date (YYYY-MM-DD) and a label, got ${JSON.stringify(c)}`);
    else if (!dates.has(c.date)) {
      dates.add(c.date);
      d.closures.push({ date: c.date, label: String(c.label).trim() });
    }
  }

  const used = new Set();
  const uid = (base) => {
    let id = slugify(base), n = 2;
    while (used.has(id)) id = `${slugify(base)}-${n++}`;
    used.add(id);
    return id;
  };
  for (const sec of raw.menu ?? []) {
    if (!sec?.title) { errs.push("menu: a section has no title"); continue; }
    const s = { id: uid(sec.title), title: String(sec.title).trim(), note: sec.note ? String(sec.note).trim() : undefined, items: [] };
    for (const it of sec.items ?? []) {
      const where = `menu "${sec.title}" / "${it?.name ?? "?"}"`;
      if (!it?.name) { errs.push(`${where}: missing name`); continue; }
      const tags = it.tags ?? [];
      for (const t of tags) if (!TAGS.includes(t)) errs.push(`${where}: tag "${t}" is not one of ${TAGS.join(", ")}`);
      s.items.push({ id: uid(it.name), name: String(it.name).trim(), description: it.description ? String(it.description).trim() : undefined, price: cents(it.price, where, errs, true), tags });
    }
    d.menu.push(s);
  }
  for (const sec of raw.wines ?? []) {
    if (!sec?.title) { errs.push("wines: a section has no title"); continue; }
    const s = { id: uid(`wine ${sec.title}`), title: String(sec.title).trim(), note: sec.note ? String(sec.note).trim() : undefined, wines: [] };
    for (const w of sec.wines ?? []) {
      const where = `wines "${sec.title}" / "${w?.name ?? "?"}"`;
      if (!w?.name || !w.producer || !w.region) { errs.push(`${where}: name, producer and region are required`); continue; }
      const glass = cents(w.glass, where, errs, true), bottle = cents(w.bottle, where, errs, true);
      if (glass === null && bottle === null) errs.push(`${where}: give a glass or a bottle price`);
      s.wines.push({ id: uid(`${w.producer} ${w.name} ${w.vintage ?? ""}`), name: String(w.name).trim(), producer: String(w.producer).trim(), region: String(w.region).trim(), grape: w.grape || undefined, vintage: w.vintage ?? undefined, glass: glass ?? undefined, bottle: bottle ?? undefined, notes: w.notes || undefined, organic: w.organic ? true : undefined, pick: w.pick ? true : undefined });
    }
    d.cellar.push(s);
  }
  return { data: d, errors: errs };
}

const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const arr = (a) => `array[${(a ?? []).map(q).join(",")}]::text[]`;

/** SQL that fills a freshly created schema with this client's content. */
export function seedSql(schema, d) {
  const out = [];
  const o = d.address;
  out.push(`insert into ${schema}.settings (id, name, tagline, blurb, street, city, state, zip, phone, email, timezone, max_party, last_seating_mins, lead_hours, days_ahead)
values (1, ${[d.name, d.tagline, d.blurb, o.street, o.city, o.state, o.zip, d.phone, d.email, d.timezone].map(q).join(", ")}, ${d.reservations.maxParty}, ${d.reservations.lastSeatingMins}, ${d.reservations.leadHours}, ${d.reservations.daysAhead});`);
  if (d.links.order || d.links.reserve) out.push(`update ${schema}.settings set order_url = ${q(d.links.order)}, reserve_url = ${q(d.links.reserve)} where id = 1;`);
  d.hours.forEach((h, i) => out.push(`insert into ${schema}.hours_weekly (day, open_at, close_at, sort) values (${h.day}, '${h.open}', '${h.close}', ${d.hours.filter((x, j) => j < i && x.day === h.day).length});`));
  d.closures.forEach((c) => out.push(`insert into ${schema}.closures (date, label) values (${q(c.date)}, ${q(c.label)});`));
  d.menu.forEach((s, n) => {
    out.push(`insert into ${schema}.menu_sections (id, title, note, sort) values (${q(s.id)}, ${q(s.title)}, ${q(s.note)}, ${n});`);
    s.items.forEach((i, k) => out.push(`insert into ${schema}.menu_items (id, section_id, name, description, price_cents, tags, sort) values (${q(i.id)}, ${q(s.id)}, ${q(i.name)}, ${q(i.description)}, ${i.price ?? "null"}, ${arr(i.tags)}, ${k});`));
  });
  d.cellar.forEach((s, n) => {
    out.push(`insert into ${schema}.wine_sections (id, title, note, sort) values (${q(s.id)}, ${q(s.title)}, ${q(s.note)}, ${n});`);
    s.wines.forEach((w, k) => out.push(`insert into ${schema}.wines (id, section_id, name, producer, region, grape, vintage, glass_cents, bottle_cents, notes, organic, pick, sort) values (${q(w.id)}, ${q(s.id)}, ${q(w.name)}, ${q(w.producer)}, ${q(w.region)}, ${q(w.grape)}, ${w.vintage ?? "null"}, ${w.glass ?? "null"}, ${w.bottle ?? "null"}, ${q(w.notes)}, ${!!w.organic}, ${!!w.pick}, ${k});`));
  });
  out.push(`insert into ${schema}.admin_users (email) values ${d.admins.map((a) => `(${q(a)})`).join(", ")};`);
  return out.join("\n") + "\n";
}

/** The site's fallback content (used when the database is unreachable) as a TypeScript file. */
export function contentTs(slug, d) {
  const site = {
    name: d.name, tagline: d.tagline, motto: d.motto, blurb: d.blurb, address: d.address, phone: d.phone, email: d.email, timezone: d.timezone,
    hours: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, intervals: d.hours.filter((h) => h.day === day).map((h) => ({ open: h.open, close: h.close })) })),
    closures: d.closures,
    menu: d.menu,
    cellar: d.cellar,
    reservations: d.reservations,
    links: Object.keys(d.links).length ? d.links : undefined,
    tier: "counter",
    isDemo: false,
  };
  return `// ${d.name}: the fallback copy for this site, generated by scripts/new-client.mjs from intake.json.
// The live menu, wines, hours and settings come from the database; this is what shows if it is unreachable,
// plus anything the database does not hold (add \`story\` and \`events\` here to switch those pages on, and \`meta\` for page descriptions).
import type { Photo, SiteData } from "@/lib/types";
import demo from "../demo/images.json";
import own from "./images.json";

export const site: SiteData = ${JSON.stringify(site, null, 2)};

// Until ${slug} has its own photos (clients/${slug}/images.json, files in public/${slug}/), the template's sample photos fill in.
export const images = { ...demo, ...own } as Record<string, Photo>;
export const usesSamplePhotos = Object.keys(own).length === 0;
`;
}
