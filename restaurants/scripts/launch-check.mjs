#!/usr/bin/env node
// Is this client ready to go live? Prints a checklist: PASS / WARN (should fix) / FAIL (do not launch).
//
//   node scripts/launch-check.mjs bella-notte --url https://bella-notte.vercel.app
//
// Files are checked from clients/<slug>/. With --url the live site is fetched too (pages, titles, leftover demo wording,
// sitemap, robots, manifest). With --db "<SUPABASE_URL>|<publishable key>|<schema>" the database content is read the same way the site does.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const [slug, ...rest] = process.argv.slice(2);
if (!slug || slug.startsWith("--")) {
  console.error('Usage: node scripts/launch-check.mjs <slug> [--url https://site] [--db "https://x.supabase.co|sb_publishable_...|schema"]');
  process.exit(2);
}
const opt = {};
for (let i = 0; i < rest.length; i += 2) opt[rest[i]?.replace(/^--/, "")] = rest[i + 1];

const results = [];
const add = (level, what, fix = "") => results.push({ level, what, fix });
const pass = (w) => add("PASS", w);
const warn = (w, f) => add("WARN", w, f);
const fail = (w, f) => add("FAIL", w, f);

const dir = join(root, "clients", slug);
if (!existsSync(dir)) {
  console.error(`clients/${slug} does not exist. Run new-client first.`);
  process.exit(2);
}

// ── Files ────────────────────────────────────────────────────────────────────
const read = (f) => (existsSync(join(dir, f)) ? readFileSync(join(dir, f), "utf8") : "");
const content = read("content.ts");
content ? pass("content.ts exists") : fail("content.ts is missing", "Run new-client again or copy it from another client");

let intake = {};
try { intake = JSON.parse(read("intake.json") || "{}"); } catch { warn("intake.json is not valid JSON"); }

let images = {};
try { images = JSON.parse(read("images.json") || "{}"); } catch { fail("images.json is not valid JSON"); }
const imgList = Object.values(images);
if (imgList.length === 0) fail("No photos of their own yet: the site still shows the template's sample photos", `Add photos to public/${slug}/ and list them in clients/${slug}/images.json`);
else {
  pass(`${imgList.length} photos listed`);
  const noAlt = imgList.filter((i) => !i.alt || i.alt.trim().length < 15);
  noAlt.length ? fail(`${noAlt.length} photo(s) have missing or very short alt text`, "Describe what is in the picture, in one sentence") : pass("every photo has alt text");
  const missing = imgList.filter((i) => i.src?.startsWith("/") && !existsSync(join(root, "public", i.src)));
  missing.length ? fail(`${missing.length} listed photo file(s) are not in public/`, missing.slice(0, 3).map((m) => m.src).join(", ")) : pass("photo files exist");
}

const placeholders = [
  [/Edit this tagline/i.test(content), "tagline is still the placeholder"],
  [/Tell guests what makes this place/i.test(content), "blurb is still the placeholder"],
  [/123 Main Street/.test(content), "address is still 123 Main Street"],
  [/555-01\d\d/.test(content), "phone is a 555 placeholder"],
  [/@example\.|\.example/.test(content), "email is an example address"],
];
for (const [bad, what] of placeholders) bad ? fail(what, `Fix it in clients/${slug}/intake.json and content.ts, and in the admin Hours & contact page`) : null;
if (!placeholders.some(([bad]) => bad)) pass("no placeholder contact details in content.ts");

/\bstory\s*:/.test(content) ? pass("story page has content") : warn("No story page (it stays hidden)", "Fine for a first launch; add `story` to content.ts when the owner has the copy");
/\bevents\s*:/.test(content) ? pass("events page has content") : warn("No private-events page (it stays hidden)", "Add `events` to content.ts if they host parties");
/\bmeta\s*:/.test(content) ? pass("custom page descriptions set") : warn("Page descriptions are the generic ones", "Add `meta` to content.ts for better search snippets");

if (!(intake.menu?.length)) warn("intake.json has no menu", "The owner can add dishes in the admin, but a menu-less launch looks empty");
if (!(intake.admins?.length)) fail("no admin emails in intake.json");

// ── Database (optional) ──────────────────────────────────────────────────────
async function database() {
  const [url, key, schema] = opt.db.split("|");
  const get = async (t, q = "select=*") => {
    const r = await fetch(`${url}/rest/v1/${t}?${q}`, { headers: { apikey: key, "Accept-Profile": schema }, signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error(`${t}: HTTP ${r.status}${r.status === 406 ? " (is the schema in Settings → API → Exposed schemas?)" : ""}`);
    return r.json();
  };
  try {
    const [s] = await get("settings", "select=*&id=eq.1");
    if (!s) return fail("settings row is missing in the database");
    pass(`database reachable (${s.name})`);
    if (/Edit this tagline|Tell guests what makes/.test(`${s.tagline} ${s.blurb}`)) fail("tagline or blurb in the database is still the placeholder", "Admin → Hours & contact");
    if (/123 Main|555-01/.test(`${s.street} ${s.phone}`)) fail("address or phone in the database is still a placeholder", "Admin → Hours & contact");
    const items = await get("menu_items", "select=id,photo_path,price_cents");
    items.length ? pass(`${items.length} dishes published`) : fail("no dishes in the database", "Admin → Menu");
    const hrs = await get("hours_weekly", "select=day");
    hrs.length ? pass("opening hours set") : fail("no opening hours in the database", "Admin → Hours");
    const wines = await get("wines", "select=id");
    wines.length ? pass(`${wines.length} wines published`) : warn("no wines (the Cellar page will be empty)", "Remove the Cellar from the nav or add wines");
    // The anon key must not be able to read the inbox.
    const inbox = await fetch(`${url}/rest/v1/requests?select=id&limit=1`, { headers: { apikey: key, "Accept-Profile": schema } });
    const body = inbox.ok ? await inbox.json() : [];
    inbox.ok && body.length === 0 ? pass("inbox is closed to the public (returned nothing)") : inbox.ok ? fail("PUBLIC KEY CAN READ THE INBOX", "Stop. Check RLS on requests") : pass("inbox is closed to the public");
  } catch (e) {
    fail(`database check failed: ${e.message}`);
  }
}
if (opt.db) await database();
else warn("Database not checked", 'Add --db "<SUPABASE_URL>|<publishable key>|<schema>"');

// ── Live site (optional) ─────────────────────────────────────────────────────
async function live() {
  const base = opt.url.replace(/\/$/, "");
  const name = intake.name ?? "";
  const pages = ["/", "/menu", "/cellar", "/gallery", "/visit", "/reserve", "/contact"];
  for (const p of pages) {
    try {
      const r = await fetch(base + p, { signal: AbortSignal.timeout(20000), redirect: "follow" });
      const html = await r.text();
      if (!r.ok) { fail(`${p} returned ${r.status}`); continue; }
      const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? "";
      if (name && !title.includes(name.replace(/&/g, "&amp;"))) warn(`${p} title "${title}" does not include "${name}"`);
      if (/Cinque Lune|Trattoria Cinque/.test(html) && !/Cinque/i.test(name)) fail(`${p} still mentions the demo restaurant (Cinque Lune)`);
      if (/Anytown|118 Fig Alley|555-0142/.test(html)) fail(`${p} still shows the demo's address or phone`);
      if (/noindex/.test(html)) warn(`${p} is marked noindex`, "Remove before launch if search engines should find it");
    } catch (e) {
      fail(`${p} could not be fetched: ${e.message}`);
    }
  }
  pages.length && results.filter((r) => r.level === "FAIL").length === 0 && pass("public pages load with this restaurant's name");
  for (const [p, label] of [["/sitemap.xml", "sitemap"], ["/robots.txt", "robots.txt"], ["/manifest.webmanifest", "web manifest"]]) {
    try { (await fetch(base + p, { signal: AbortSignal.timeout(15000) })).ok ? pass(`${label} works`) : warn(`${label} missing at ${p}`); } catch { warn(`${label} not reachable`); }
  }
  try {
    const r = await fetch(base + "/admin", { redirect: "manual", signal: AbortSignal.timeout(15000) });
    [301, 302, 303, 307, 308].includes(r.status) ? pass("/admin sends signed-out visitors to the login") : warn(`/admin answered ${r.status} for a signed-out visitor`);
  } catch { /* ignore */ }
}
if (opt.url) await live();
else warn("Live site not checked", "Add --url https://their-site");

// ── Report ───────────────────────────────────────────────────────────────────
const icon = { PASS: "ok  ", WARN: "warn", FAIL: "FAIL" };
console.log(`\nLaunch check: ${slug}\n`);
for (const r of results) console.log(`${icon[r.level]}  ${r.what}${r.fix ? `\n      → ${r.fix}` : ""}`);
const n = (l) => results.filter((r) => r.level === l).length;
console.log(`\n${n("FAIL")} to fix before launch, ${n("WARN")} worth a look, ${n("PASS")} fine.${n("FAIL") ? " Not ready." : " Ready, once the warnings are read."}\n`);
console.log("Not checked here: Vercel env vars and domain, Supabase redirect URLs and invited admin users, a real sign-in, a test reservation. Walk ONBOARDING.md section 3 for those.\n");
process.exit(n("FAIL") ? 1 : 0);
