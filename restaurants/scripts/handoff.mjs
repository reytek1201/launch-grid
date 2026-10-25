#!/usr/bin/env node
// Writes the owner's guide for a client: clients/<slug>/HANDOFF.md, plain words, phone first.
//   node scripts/handoff.mjs bella-notte --url https://www.bellanotte.com --contact "Reytek, 404-555-0100, you@launchgrid.example"
// Print it, or paste it into a Google Doc / email. Every button name below matches the admin; if the admin changes, change this.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const [slug, ...rest] = process.argv.slice(2);
if (!slug || slug.startsWith("--")) { console.error('Usage: node scripts/handoff.mjs <slug> [--url https://site] [--contact "who to call"]'); process.exit(2); }
const opt = {};
for (let i = 0; i < rest.length; i += 2) opt[rest[i].replace(/^--/, "")] = rest[i + 1];
const file = join(root, "clients", slug, "intake.json");
if (!existsSync(file)) { console.error(`clients/${slug}/intake.json not found.`); process.exit(2); }
const d = JSON.parse(readFileSync(file, "utf8"));
const site = (opt.url ?? "").replace(/\/$/, "");
const admin = site ? `${site}/admin` : "your website address followed by /admin";
const admins = Array.isArray(d.admins) ? d.admins : String(d.admins ?? "").split(",");

const md = `# Running your website: ${d.name}

You do not need to know anything technical. Everything below works from your phone.

## Signing in
1. Go to **${admin}**.
2. Type your email (${admins.map((a) => a.trim()).join(" or ")}) and tap **Email me a sign-in link**.
3. Open that email **on the same phone or computer** and tap the link. You are in.
4. Tip: on your phone, tap Share, then **Add to Home Screen**, so it opens like an app.

If it says the link did not work, it has expired or was opened on a different device. Request a new one.

## The six tabs along the bottom
**Home** shows today's date, how many new requests are waiting, whether the kitchen is open, and what is sold out. It also holds the specials banner and your order and booking links.
**Inbox** is every reservation, event inquiry and message from the website. **Menu** and **Cellar** are your dishes and wines. **Gallery** is your photos. **Hours** is your hours, closures and contact details.

## Things you will do most
**Mark a dish sold out (86 it).** Menu tab, find the dish, tap the switch that says **On the menu**; it changes to **Sold out** and the website shows it as sold out within a minute. To bring it back, tap it again, or on Home use **Bring back** under "Sold out right now". The same switch is on every wine in the Cellar tab.

**Put up a special or a notice.** Home tab, **Specials banner**. Type one short line (up to 140 characters), pick a date to hide it after (optional), tick **Show it on the site**, tap **Save banner**. It appears across the top of every page. Guests can close it for their visit. Untick the box to take it down.

**Change your hours.** Hours tab, **Weekly hours**. **Closed all day** switches a day off; a split day (lunch and dinner) has two time ranges. For a holiday or private buyout, use **Closures** on the same page: pick the date, type a label such as "Thanksgiving Day", tap **Add closure**. The "open now" sign and Google both follow it.

**Add or change a dish.** Menu tab, **Add dish** under the right section (to change an existing dish, open its **Edit** and tap **Save dish**). Prices are in dollars. Leave the price empty for market price. Tap **Save dish**. Sections can be reordered with the arrows, and hidden with **Hide** if you want to keep something for later.

**Add a photo.** Menu tab, open a dish, **Photo**, choose a picture from your phone. It is resized for you. Write a short description of what is in it (this is read aloud for blind visitors). Gallery tab, **Add a photo**, does the same for the Gallery page.

**Answer a request.** Inbox tab. New ones have a badge. Open one, call or email the guest from the details shown, then tap **Mark seen** or **Mark done** so the list stays tidy. **Please reply to every reservation request yourself**: the website takes the request, it does not confirm a table.${d.links?.order || d.links?.reserve ? "" : "\n\nAlready use Toast, DoorDash, OpenTable or Resy? Home tab, **Order and booking links**: paste the web address and the website shows an Order online button or a Book online card."}

## What the website does without you
Shows today's hours and "open now" from your Hours tab. Hides sections that have no dishes. Tells Google your hours and holiday closures. Blocks most spam. Keeps working if the database has a hiccup (it shows the last saved menu).

## If something looks wrong
- A change is not showing: wait one minute and reload; pages refresh at least every minute.
- You cannot sign in: check you typed the email exactly as it appears at the top of this page; only those addresses can sign in.
- Anything else: ${opt.contact ?? "call or text your website person"}. Please include a screenshot and the time it happened.

## Who else can sign in
${admins.map((a) => `- ${a.trim()}`).join("\n")}
To add or remove someone, ask ${opt.contact ? "us" : "your website person"}; it takes a minute.

## Good habits
- Check the Inbox at the start and end of each service.
- Update the banner the moment you 86 a headline dish or close early.
- Put a closure in Hours as soon as you know a holiday date.
- Do not put allergen promises in dish descriptions unless your kitchen has a process behind them; the diet tags are guidance.
`;
writeFileSync(join(root, "clients", slug, "HANDOFF.md"), md);
console.log(`Wrote clients/${slug}/HANDOFF.md`);
