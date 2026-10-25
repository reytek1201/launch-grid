#!/usr/bin/env node
// Sets up the backend for a new restaurant client and writes its onboarding checklist.
//
//   node scripts/new-client.mjs bella-notte --name "Bella Notte" --admin owner@bellanotte.com
//
// Options: --admin a@x.com,b@y.com (required: who may sign in to the admin; add your own address too if you want in)
//          --name "Restaurant name" (required)   --phone "(404) 555-0100"   --city Atlanta   --state GA   --zip 30303
//          --intake clients/bella-notte/intake.json   everything above plus menu, wines, hours, closures, links (see clients/_template/intake.example.json); flags override it
//          --street "123 Main St"   --timezone America/New_York   --email hello@restaurant.com (public contact email)
//
// Writes clients/<slug>/setup.sql (run it once in the Supabase SQL editor, in the project that will hold this client)
// and clients/<slug>/ONBOARDING.md (the rest of the steps, with this client's exact settings).
// The SQL is built from db/*.sql, so a client always gets the same tables, rules and photo storage as the demo.
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { contentTs, readIntake, seedSql } from "./intake.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const die = (m) => {
  console.error(`\n${m}\n`);
  process.exit(1);
};

const [slug, ...rest] = process.argv.slice(2);
if (!slug || slug.startsWith("--")) die('Usage: node scripts/new-client.mjs <slug> --name "Restaurant name" --admin owner@example.com');
if (!/^[a-z][a-z0-9-]{1,30}[a-z0-9]$/.test(slug)) die("The slug is lowercase letters, numbers and hyphens, 3 to 32 characters, starting with a letter. Example: bella-notte");
if (slug === "demo") die('"demo" is the Trattoria demo. Choose another slug.');

const opt = {};
for (let i = 0; i < rest.length; i += 2) {
  if (!rest[i]?.startsWith("--") || rest[i + 1] === undefined) die(`Expected "--option value", got "${rest[i] ?? ""}".`);
  opt[rest[i].slice(2)] = rest[i + 1];
}
const known = ["intake", "name", "admin", "phone", "city", "state", "zip", "street", "timezone", "email"];
for (const k of Object.keys(opt)) if (!known.includes(k)) die(`Unknown option --${k}. Known: ${known.map((x) => `--${x}`).join(", ")}`);

// Everything about the restaurant comes from one object: the intake file if given, else the flags.
let raw = {};
if (opt.intake) {
  try { raw = JSON.parse(readFileSync(opt.intake, "utf8")); } catch (e) { die(`Cannot read ${opt.intake}: ${e.message}`); }
}
const flag = { name: opt.name, phone: opt.phone, email: opt.email, timezone: opt.timezone, admins: opt.admin };
for (const [k, v] of Object.entries(flag)) if (v !== undefined) raw[k] = v;
raw.address = { ...(raw.address ?? {}), ...Object.fromEntries(["street", "city", "state", "zip"].filter((k) => opt[k] !== undefined).map((k) => [k, opt[k]])) };
if (!opt.intake) {
  // Without an intake file, fill what the flags leave out with obvious placeholders to edit later in the admin.
  raw.phone ??= "(404) 555-0100";
  raw.address = { street: "123 Main Street", city: "Atlanta", state: "GA", zip: "30303", ...raw.address };
  raw.email ??= String(raw.admins ?? "").split(",")[0].trim();
  raw.hours ??= { tue: ["17:00-21:00"], wed: ["17:00-21:00"], thu: ["17:00-21:00"], fri: ["17:00-21:00"], sat: ["17:00-21:00"] };
}
const parsed = readIntake(raw);
if (parsed.errors.length) die(`The intake has ${parsed.errors.length} problem(s). Nothing was changed:\n  - ${parsed.errors.join("\n  - ")}`);
const D = parsed.data;
opt.name = D.name;
const admins = D.admins;

const dir = join(root, "clients", slug);
if (existsSync(dir)) die(`clients/${slug} already exists. Nothing was changed.`);

const schema = slug.replace(/-/g, "_");
const bucket = slug;

// The demo's migrations, renamed for this client.
let sql = readdirSync(join(root, "db"))
  .filter((f) => /^\d{3}_.*\.sql$/.test(f))
  .sort()
  .map((f) => {
    let s = readFileSync(join(root, "db", f), "utf8");
    // The demo's sample gallery photos and its owner's sign-in are the demo's own.
    s = s.replace(/insert into trattoria_demo\.gallery_photos[\s\S]*?on conflict \(id\) do nothing;\n?/g, "");
    s = s.replace(/insert into trattoria_demo\.admin_users \(email\) values \([^)]*\);\n?/g, "");
    return `-- ───── ${f} ─────\n${s.trim()}\n`;
  })
  .join("\n")
  .replaceAll("trattoria_demo", schema)
  .replaceAll("trattoria-demo", bucket)
  .replaceAll("trattoria_admin_", `${schema}_admin_`)
  .replaceAll("Trattoria Cinque Lune (demo)", opt.name)
  .replaceAll("for the whole demo", "for the whole site")
  .replaceAll("the demo restaurant", opt.name);

sql += `
-- ───── this client ─────
${seedSql(schema, D)}`;

const salt = randomBytes(16).toString("hex");
const md = `# Onboarding: ${opt.name}

Slug \`${slug}\`, database schema \`${schema}\`, photo bucket \`${bucket}\`. Generated by \`scripts/new-client.mjs\`.
Admins who may sign in: ${admins.join(", ")}.

## 1. Database (about 5 minutes)
1. Pick where this client lives: the LaunchGrid Supabase project (own schema, quickest) or a new Supabase project in the client's name (they own their data; best for a paying client).
2. Open the project's **SQL editor**, paste all of \`clients/${slug}/setup.sql\`, and run it. It creates the tables, the access rules, the photo bucket and the first admin sign-ins, with a starting settings row and hours.
3. **Settings → API → Exposed schemas**: add \`${schema}\` and save. The site cannot read the database until this is done.
4. **Authentication → URL configuration**: add the site's address (and \`/auth/callback\`) to the redirect URLs.
5. **Authentication → Users → Invite user** for each admin email above. Sign-in only works for people who already exist here, so this must be done once per admin.
6. **Authentication → Sign In / Providers → Email**: turn on "Prevent use of leaked passwords".

## 2. Vercel project
1. New project from the \`reytek1201/launch-grid\` repo. **Root directory: \`restaurants\`**. Framework: Next.js.
2. Environment variables (Production):

| Name | Value |
| --- | --- |
| \`NEXT_PUBLIC_CLIENT\` | \`${slug}\` |
| \`SUPABASE_URL\` | the project URL (Settings → API) |
| \`SUPABASE_ANON_KEY\` | the **publishable** key, never the service-role key |
| \`SUPABASE_SCHEMA\` | \`${schema}\` |
| \`SUPABASE_BUCKET\` | \`${bucket}\` |
| \`NEXT_PUBLIC_SITE_URL\` | the final address, e.g. \`https://www.example.com\` |
| \`SPAM_SALT\` | \`${salt}\` |

3. Optional, to email the owner on every new request: \`RESEND_API_KEY\`, \`EMAIL_FROM\`, \`EMAIL_ALERTS_TO\`.
4. Deploy, then add the client's domain under Domains.

## 3. Check it works
- The public site loads without errors.
- Sign in at \`/admin/login\` with an admin address and open the link from the email, on the same device.
- Send a test reservation from the site; it appears in the admin Inbox.
- Upload a dish photo and a gallery photo; both show on the site.
- Switch the specials banner on and off.

## 4. Still to do for ${opt.name}
- **Photos.** The site shows the template's sample photos until \`clients/${slug}/images.json\` lists this restaurant's own (files go in \`public/${slug}/\`). Run \`/launch-check\` before going live; it flags sample photos.
- **Story and private-events pages.** They are off until \`clients/${slug}/content.ts\` has \`story\` and \`events\` (copy them from \`clients/demo/fixtures\` as a shape guide and write the client's own).
- **Wording and look.** The Trattoria theme's own copy ("Libro dei vini", "Cinque lune, una tavola lunga") is Italian-restaurant flavor; a different cuisine needs its own theme.
- Menu, wines, hours, closures, links, banner, uploaded gallery photos and the request inbox come from this client's own database and are already seeded from the intake.
`;

mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "setup.sql"), sql);
writeFileSync(join(dir, "content.ts"), contentTs(slug, D));
writeFileSync(join(dir, "images.json"), "{}\n");
writeFileSync(join(dir, "intake.json"), JSON.stringify(raw, null, 2) + "\n");
writeFileSync(join(dir, "ONBOARDING.md"), md);
console.log(`\nCreated clients/${slug}/ (setup.sql, content.ts, images.json, intake.json, ONBOARDING.md)\nNext: open clients/${slug}/ONBOARDING.md and follow it.\n`);
