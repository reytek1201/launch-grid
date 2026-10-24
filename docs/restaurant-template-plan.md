# LaunchGrid Restaurant Template: plan

Draft 2 · Oct 24, 2026 (draft 1 same day) · for Reytek · replaces nothing (new file). Save as `docs/restaurant-template-plan.md`.

## Status (update whenever you report progress)

**Done:** read business plan, project prompt, kickoff prompt, the Funkharp code and reytek1201.com (folder and live site); drafted this plan; wrote the feature catalog (`docs/restaurant-feature-catalog.md`); recorded your five answers and the new interaction requirement (section 1 and 4).
**Next this week:** approve the revised hours and timeline (section 6); pick features from the catalog; then I start Phase 0.
**Blocked on you:** approval of the plan. Nothing else.

---

## 0. Things I found that change the plan

1. **Database conflict.** `business-plan.md` says "decide before artist #2" and recommends one shared database to keep hosting near $45-65/month. The kickoff prompt says one Supabase project per client. Per-client is safer for isolation and easy to hand over when a client leaves, but costs more (Q1).
2. **The business plan has no restaurant section.** The kickoff prompt points to "Restaurant MVP", "Template plan" and "Offer and pricing". The file has "The offer", "Packages and prices" and "Making it repeatable", all music-only. So **restaurant prices don't exist yet**; I used tentative ones below, marked as estimates.
3. **Hours are inconsistent.** `project-prompt.md` says 10-12 hours a week; your latest says about 25. I used 25 as the ceiling and 20 as the working pace for this build, because Funkharp launch, the agreement and outreach need the rest.
4. **Tier hour targets are tight.** Funkharp overran its 10-15 hour estimate; `project-prompt.md` sets 25-40 hours per repeat site as the template goal. Counter at 16 hours and Dine-In at 28 are only credible once the template is done. Plan the first two clients at about 1.5x.
5. **Care plan math is thin.** A per-client Supabase project is about $10/month (estimate, from the Oct 12 plan). On a $29 care plan with one included hour at your $30 floor, you lose money in any month the client asks for the hour. Restaurant owners edit their own menu, so include 30 minutes, not 1 hour, or price the plan higher.
6. **Prices not re-verified.** My live fetches of Supabase, Vercel and Google's structured-data docs were not approved in time. Costs below are from the Oct 12 plan, which cites [Supabase pricing](https://supabase.com/pricing.md), [Vercel pricing explained](https://livemy.app/blog/vercel-pricing) and [Resend pricing](https://resend.com/pricing). I'll re-check them and the JSON-LD rules before the tasks that depend on them.

---

## 1. Decisions (your answers, Oct 24)

1. **Database:** one Supabase project per restaurant. Schema stays simple enough to merge into a shared project later.
2. **Theme #1:** Italian trattoria. No real prospect named yet.
3. **Funkharp:** copy its patterns. What I found: Next 16.3.6, React 19.2.8, Tailwind 4, React Compiler, framer-motion 13; Supabase migrations 0001-0011 (shows, inquiries, subscribers, admin settings, login attempts, push subscriptions, media); Resend in `lib/email.ts`; phone alerts are **web push** (`web-push`, `lib/push.ts`, `push_subscriptions` table). Reusable as-is or nearly: `Reveal`, `Magnetic`, `useRamp`, `useHideOnScroll`, `useMedia`, the page-transition `template.tsx`, admin auth and session, email and push libs. **Warning from Funkharp's `AGENTS.md`:** this Next.js version has breaking changes; read `node_modules/next/dist/docs/` before writing code.
4. **Where it lives:** inside the Launch Grid folder, in `restaurants/` (own `package.json`; `node_modules` and `.next` ignored so the folder stays small).
5. **Pricing:** tentative numbers in section 6 are fine as a start.
6. **New requirement:** your sites stand out through creative scrolling and placement; this one must feel interactive like the rest. This changes the theme design (section 4) and adds hours (section 6).

---

## 2. (a) Folder structure

```
Launch Grid/restaurants/        (own package.json; ignore node_modules and .next)
  app/
    (public)/            page.tsx, menu/, hours/, contact/, gallery/,
                         specials/, events/, catering/, reserve/
    (admin)/admin/       menu/, hours/, specials/, events/, inbox/,
                         subscribers/, media/, settings/
    demo/[theme]/        labelled demo routes + theme switcher
    api/                 inquiries/, subscribe/
    sitemap.ts  robots.ts
  components/            backend-agnostic UI (forms, admin tables)
    motion/              Reveal, Magnetic, PageTransition, useRamp, useHideOnScroll,
                         useMedia (ported from Funkharp)
  themes/
    _base/               default section components + tokens
    trattoria/ steakhouse/ taqueria/ sushi/ cafe/ bbq/
      tokens.ts  fonts.ts  copy.ts  variants.ts  sections/  signature/
  lib/
    config/              client loader (reads CLIENT env)
    flags/               tier -> feature map, requireFeature()
    data/                typed queries returning view models
    supabase/            clients (server, browser), generated types
    hours/               open-now and closure logic
    jsonld/              Restaurant/LocalBusiness builder
    email/               Resend wrappers, auto-reply templates
  clients/
    _template/           config.ts, seed.sql, assets/
    demo/                config.ts, fixtures/<theme>.ts
  supabase/
    migrations/  seed/  tests/    (RLS tests)
  scripts/               new-client.ts, seed.ts
  docs/
  (per client: clients/<name>/assets/image-log.md)
```

Rule enforced by lint (`no-restricted-imports`): `themes/**` may not import from `lib/supabase` or `lib/data`. Themes get plain props only, so a theme swap cannot touch data or admin code.

## 3. (b) Schema (improvements to your list marked ★)

All tables have `id uuid`, `created_at`, `updated_at`. Row-level security on every table: public can read only what the public site shows; writes need `is_admin()`; `inquiries` and `subscribers` allow public insert only.

| Table | Key columns |
| --- | --- |
| `site_settings` | name, tagline, cuisine[], price_range, phone, email, address fields, timezone ★, order_url, reserve_url, social links, theme_id |
| `locations` ★ | one row now; FK target for hours, specials, events, inquiries so "Full Service" multi-location needs no rewrite |
| `menu_sections` | name, description, sort, is_hidden |
| `menu_items` | section_id, name, description, `price_cents` ★ (int), `price_note` ★ ("MP"), dietary_tags[] (check list), sold_out, is_hidden ★, image_id, sort |
| `hours_weekly` | location_id, weekday, opens, closes, sort ★ (several intervals per day, lunch and dinner), closes_next_day ★ |
| `hours_exceptions` | location_id, starts_on, ends_on ★ (ranges), closed, opens, closes, label ("Thanksgiving") |
| `specials` | title, description, price_cents, weekday (recurring) or starts_on/ends_on, show_in_banner, menu_item_id? |
| `events` | title, starts_at, ends_at, description, performer_name, performer_url ★ (link to a band page), image_id |
| `inquiries` | type (catering, private_event, reservation, contact), status ★ (new, replied, archived), name, email, phone, message, `details jsonb` ★ (party size, date), consent flag |
| `subscribers` | email, source, confirmed_at ★, unsubscribed_at ★ |
| `media` | storage path, `alt_text` ★ (required, for accessibility), sort, kind, `credit` ★ (licence and source, used for demo images) |
| `admin_users` | auth user id, role (owner, staff) |
| `admin_login_attempts` ★ | copied from Funkharp 0006 (login rate limiting) |
| `push_subscriptions` ★ | copied from Funkharp 0007 (phone alerts via web push) |

Not in the DB on purpose: feature flags (they live in client config, section 5). Audit log: cut.

## 4. (c) Theme system

- A theme is a folder: `tokens.ts` (colors, radii, spacing, type scale, written to CSS variables), `fonts.ts` (`next/font/google`), `variants.ts` (`hero: 'split' | 'full-bleed' | ...`, `menu: 'list' | 'columns' | 'cards'`), `copy.ts` (tone strings for headings and microcopy), `sections/` (Hero, MenuView, HoursBlock, SpecialsBanner, Gallery, ContactBlock, Footer).
- Pages compose **section slots**. Each slot resolves to the theme's component, falling back to `themes/_base`. So a new theme can start as tokens only and override sections one at a time.
- Data comes from `lib/data` view models, passed as props. Themes never fetch.
- Per-client branding (logo, color overrides) lives in `clients/<slug>/config.ts` and merges over the theme tokens.
- `/demo/[theme]` loads fixtures from `clients/demo/fixtures/` (one fictional restaurant per theme) and has a "same data" toggle that renders one neutral fixture in any theme, which is what lets an owner compare looks fairly.

### Interaction layer (your signature)

Every theme gets a **motion kit** and one **signature piece**, and the kit is shared:

- **Motion kit** (ported from Funkharp): scroll reveals, magnetic buttons, scroll-linked ramps, page transitions, hide-on-scroll nav. All respect reduced-motion and fine-pointer checks as Funkharp already does.
- **Signature piece** (`themes/<id>/signature/`): one scroll-driven centerpiece per theme, like Funkharp's turntable. Trattoria proposal, **"A Meal in Scroll"**: the menu is told as courses (antipasti, primi, secondi, dolci); a sticky hand-drawn table setting fills in as you scroll, section titles are written in by an SVG pen stroke, and a door sign flips between Aperto and Chiuso from the real hours. It reads the same menu data as the plain list.
- **What reytek1201.com adds (read Oct 24):** each of your sites is built on one *metaphor you can touch* (Funkharp: turntable and sketch figure; Reytek1201: broadcast channels, a draggable tonearm, a retro TV), a skippable entrance ("Enter with sound / Enter silent / Skip intro"), a persistent object that survives page changes (the one turntable and now-playing pill), scroll progress driven by a single CSS variable (`--prog`, set in a light requestAnimationFrame loop) plus IntersectionObserver reveals, and the phone checked at 390px. So each restaurant theme gets a **metaphor**, not just a palette. Trattoria: the corner table (door sign, table setting, waiter's check pad). Steakhouse: the chef's pass / dry-aging window. Taqueria: the street-cart ticket rail. Sushi: the counter, with plates on a belt of white space. Cafe: the pastry case. Barbecue: the diner counter and jukebox. Persistent object idea for every theme: a small "waiter's check" that holds Order / Reserve / Call and follows you down the page.
- **Entrance rule for restaurants:** no sound on entry, and any intro is skippable in one tap and never shown twice. Reytek1201's "Enter with sound" fits a music hub; for a restaurant it would cost you customers.
- **Technique to port, not code:** your sites are plain HTML/JS with a custom router; the restaurant template is Next. I port the *ideas* (the `--prog` variable, reveals, persistent object) using Funkharp's framer-motion kit, and keep the scroll math light, as your lanes script does.
- **Guardrails (direct advice):** a hungry visitor on a phone wants hours, phone, address and the order button in seconds. Those never sit behind an animation or a pinned scroll section. Menu text, hours and prices are always real HTML in the page (for search and screen readers). Scroll-linked pieces use Funkharp's `useRamp` approach, since native scroll timelines mis-map sub-ranges. Budget: no layout shift, keep mobile Lighthouse performance high; if a signature piece costs too much on a mid phone, it falls back to the plain layout.
- **Pricing:** the theme's signature piece comes with Dine-In. A custom signature piece for one client's own story is an add-on: quoted, or $75/hour for small jobs, as in the business plan.

## 5. (d) Feature-flag design

```ts
// lib/flags/tiers.ts (shape, not final code)
type Tier = 'counter' | 'dinein' | 'fullservice'
const COUNTER = { menu, hours, closures, specialsBanner, orderLinks,
                  contactForm, gallery }          // all true
const DINEIN  = { ...COUNTER, specialsPage, events, catering,
                  reservationRequests, mailingList }
const FULL    = { ...DINEIN, multiLocation, squareSync }  // later, off in this build
// clients/<slug>/config.ts: { tier: 'dinein', features: { events: false } }
```

- `requireFeature('events')` runs in three places: page routes (`notFound()`), admin navigation and routes, and API routes. Public nav and sitemap are built from the same map, so a disabled page never appears.
- Flags are in code, so turning one on is a redeploy. That is simpler and safer than a DB flag; revisit only if you ever need self-serve upgrades.
- Full Service is a new tier entry plus new flags; existing flags and tables don't change (`locations` is already there).

## 6. (e) Phased plan with hours

All hours are **estimates**. Revised for the interaction layer: +44 hours over draft 1.

| Phase | Work | Est. hours |
| --- | --- | --- |
| 0. Foundation | repo, lint rules, client loader and flags (3.5); core migration with RLS and RLS tests (4); auth and mobile admin shell (2.5); **motion kit ported from Funkharp (4)** | 14 |
| 1. Theme 1 + menu and hours back office | trattoria theme and sample content (8); **trattoria signature "A Meal in Scroll" (10)**; menu admin with sold-out switch and reorder (8); hours and closures admin (5); public Home, Menu, Hours (3); Restaurant JSON-LD with closures (3); mobile and accessibility pass (3) | 40 |
| 2. Rest of Counter | gallery and media with alt text (5); specials banner (2); order/reserve buttons (1.5); contact form to Resend with spam protection (4); sitemap, Open Graph, robots (2); `new-client` script and seed (5); tests and QA (2.5) | 22 |
| 2.5 Early demo (proposed) | one-theme labelled demo ("Demo restaurant, not a real business") | 4 |
| 3. Dine-In | specials page and weekly scheduler (6); events with band link (4); inbox with statuses (6); catering form and auto-reply (4); phone alert, reusing Funkharp web push (3); reservation-request form (3); mailing list and export (4) | 30 |
| 4. Other five themes | steakhouse 7, taqueria 7, sushi 6, cafe 7, barbecue 8 (tokens, hero, menu layout, fictional menu and copy, images) = 35; **plus a signature piece each, about 6 hours = 30** | 65 |
| 5. Demo site | theme switcher, fixtures, "same data" toggle, image credits, performance and accessibility on all six, deploy | 14 |
| **Total** | | **189** (about 227 with a 20% buffer) |

**Calendar at about 20 hours a week** (the rest goes to Funkharp, the agreement and outreach):

| Week of | Plan | Cumulative |
| --- | --- | --- |
| Oct 26 | Phase 0, start Phase 1 | 20 |
| Nov 2 | Phase 1 (menu and hours back office, trattoria look) | 40 |
| Nov 9 | finish Phase 1, start Phase 2 | 60 |
| Nov 16 | finish Phase 2, early demo live (about Nov 20) | 80 |
| Nov 23 (Thanksgiving, ~16h) | Phase 3 | 96 |
| Nov 30 | finish Phase 3, start Phase 4 | 116 |
| Dec 7 | Phase 4 | 136 |
| Dec 14 | Phase 4 | 156 |
| Dec 21 (holiday, ~16h) | Phase 4 | 172 |
| Dec 28 (holiday, ~16h) | finish Phase 4, nearly finish Phase 5 | 188 |
| Jan 4 | finish Phase 5 | 189 |

Raw finish is about Jan 5; buffered, about Jan 25. **Day 90 is Jan 10, so the full scope misses it once the buffer is counted.** Options, in order of preference:

1. Do signature pieces for trattoria, steakhouse and taqueria only; sushi, cafe and barbecue ship with the shared motion kit and get signature pieces after launch. Saves about 18 hours: raw finish about Dec 22, buffered about Jan 8.
2. Give the build more than 20 hours a week.
3. Cut features (section 7).

**Early demo (Phase 2.5)** is still my recommendation: owners can see the trattoria with its scroll piece by about Nov 20.

**Tentative restaurant pricing (estimates, to validate):**

| | Counter | Dine-In |
| --- | --- | --- |
| Build fee | $1,400 | $2,400 |
| Target hours | 16 | 28 |
| At 1.5x hours overrun | 24 h = $58/h | 42 h = $57/h |
| Break-even at your $30 floor (1.5x) | $720 | $1,260 |
| Care plan | $29/month | $49/month |

Care plan covers hosting, updates, backups and 30 minutes a month of small changes. Per-client database about $10/month is the main cost (estimate). Marked as underpriced if it ends up at 1 included hour.

## 7. (f) What I'd cut first, in order

1. Signature pieces on sushi, cafe and barbecue (about 18 hours): they keep the shared motion kit.
2. Themes 5 and 6 (cafe, barbecue): four themes still prove the system.
3. Mailing list (Dine-In): owners rarely send campaigns; they already have Mailchimp or Instagram.
4. Reservation-request form: link to Resy, OpenTable or phone instead.
5. Events-to-band-page link: keep events, drop the link until a music client exists.
6. Auto-reply and phone alert: keep the admin inbox; email notification is enough at launch.
7. Menu layout variants: ship `list` and `cards` only.
8. Gallery upload polish: curated images through the admin instead of drag-and-drop reorder.

Never cut: row-level security, alt text, mobile admin, closure handling in JSON-LD, the "Demo" label, reduced-motion support, and hours/phone/order buttons that work without animation.

## 8. Say no to (distractions)

An admin sandbox on the demo, allergen filtering (dietary tags are owner-entered, no allergen claims), translations, a custom reservation engine, Google Business Profile automation (do it by hand during onboarding), and anything on your no list: ordering, payments, POS, delivery, loyalty, tables, review aggregation, multi-location.

## 9. Open items for a lawyer or accountant (not advice)

Mailing-list consent and unsubscribe rules, privacy policy and terms wording for client sites, trade-name filing, and sales tax on website builds in Georgia.

## 10. Source notes

Costs come from the Oct 12 plan and its cited pages (links in section 0). Image sources will be logged per file in `clients/<name>/assets/image-log.md`. JSON-LD closure handling (`validFrom` / `validThrough` on an opening-hours specification) must be checked against Google's current local business documentation before Phase 1 task "Restaurant JSON-LD".
