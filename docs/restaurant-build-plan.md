# Restaurant build plan (build-first)

Oct 24, 2026 · Save as `docs/restaurant-build-plan.md`. Companions: `restaurant-template-plan.md` (architecture, schema, flags, full-scope hours), `restaurant-feature-catalog.md` (all features), `trattoria-site-plan.md` (theme #1).

**Direction (your call, Oct 24):** keep the catalog saved, start building the site, add backend as each screen needs it, and decide what's next from what we see. So the order is: **front end on fixture data first, backend arrives screen by screen, features come from the catalog at checkpoints.**

## Status (update whenever you report progress)

**Done:** research and planning docs; Trattoria site plan; space, image prompts and interaction system (`trattoria-space-and-interaction.md`); this build plan. Your decisions are recorded.
**Images:** 28 keepers in `restaurants/clients/demo/assets/incoming/` (scenes SP-01 to SP-14, dishes D-01 to D-13), logged in `image-log.md`, prompts in `prompts.md`. Melanzane and Tagliata still have no photo.
**Built (Oct 24):** Phases 0 to 2 and the Checkpoint 1 preview are done and live on Vercel (project `cinque-lune-demo`, auto-deploys from `main`; login protection is on). `restaurants/` runs on Next 16.3.6, React 19, Tailwind 4, framer-motion (React Compiler on). Pages on fixture data: Home ("A Meal in Scroll"), Menu (diet filters, dish viewer, wine lines), Wine cellar (pour scene and pairing picker), Reserve, Private events, Our story, Hours and location, Gallery (clothesline walk and viewer), Contact. Also: full footer with non-link social icons, back-to-top glide, branded 404 and error pages, favicon set and web manifest.
**Pre-backend polish (Oct 24):** reservation request slip (date, time slots from the hours data, party size, seating, closed days and closures respected), events inquiry slip, both through one seam, `lib/inquiry.ts`, that the backend will replace; story timeline; restaurant and menu JSON-LD, sitemap, robots (the demo is noindex), per-page share images (`npm run og`) and icons (`npm run icons`). Page fade-in is CSS-only and `Reveal` no longer hides content that starts on screen, so nothing waits for JavaScript to appear.
**Checks done:** lint and build clean; axe 0 violations on every page at desktop and 390px, including form states; keyboard, reduced-motion and touch runs. Lighthouse (mobile, simulated, sandbox) accessibility 100, best practices 100; performance varies 65 to 90 run to run in the sandbox, so measure on the deployed preview before quoting a number.
**Phone navigation (Oct 25):** app-style bottom tab bar (Home, Menu, raised Reserve, Cellar, More with a bottom sheet for Story, Events, Gallery, Visit, Contact) plus a slim solid top bar with the logo and a Call button; it hides while a form field has focus, respects the iPhone safe areas, and replaces the old check tray. Desktop keeps the top header. The site also declares itself web-app capable for iOS home-screen use.
**Skipped from the interaction doc:** tap-to-flip dish tickets.
**Still to do before client use:** a real-phone test at 390px (swipe viewers, back-to-top glide, pour scene, gallery sway); check the name "Cinque Lune" alone.
**Phase 3 started (Oct 25):** menu, wines, hours, closures and settings now live in Supabase (project Reytek1201, own schema `trattoria_demo`, migration in `restaurants/db/001_trattoria_demo.sql`, seed from `scripts/seed-sql.ts`). The site reads them every 60 s with the fixtures as a fallback; reservation, event and contact requests are written to the `requests` table through the `submit_request()` function (server action in `app/actions.ts`). RLS is on everywhere; the browser can read published content only. Env vars `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SCHEMA` are set on Vercel. To move to a client project later: dump the schema, restore, change the env vars.
**Next:** the admin side of Phase 3 (login, inbox screen, menu and hours editors with the 86 switch, instant refresh on save). Original list: inbox for reservation and event requests, menu and hours editors with the 86 switch, wines table. Waiting on a database (no free Supabase project; the Funkharp upgrade or Neon/Turso are the options).
**Blocked on you:** whether to switch off Vercel login protection so the preview link can be shared.

## How this works

- **Fixtures first.** The site renders from a typed `SiteData` object in `clients/demo/fixtures/trattoria.ts`. The types are defined in Phase 0 and the database schema later conforms to them, so swapping fixtures for Supabase data doesn't change a single component.
- **Edge cases in the fixtures from day one:** a sold-out item, a very long dish name, an empty course, a holiday closure, a missing photo. This is how we avoid a pretty site that breaks on real data.
- **Backend per screen.** A table and its admin screen are built together, right when the public page needs real data (menu and hours first).
- **Checkpoints.** At the end of phases 2, 3 and 4 you look at it, and we choose what comes next from the catalog (Dine-In features, more themes, more signature pieces).
- Each step is one sitting (about 2-4 hours). Hours are **estimates**.

## Phases

### Phase 0: Scaffold (about 4 h)
- 0.1 Read `node_modules/next/dist/docs/` for this Next version (Funkharp's `AGENTS.md` warns it differs from what I know), then create `restaurants/` with Next, React, Tailwind 4, TypeScript, framer-motion and the same lint setup as Funkharp. `.gitignore` for `node_modules` and `.next`. (2 h)
- 0.2 `SiteData` types, `clients/demo/config.ts`, `CLIENT` loader, empty tier/flag map (Counter only for now). (1 h)
- 0.3 Port the motion kit from Funkharp into `components/motion/` (Reveal, Magnetic, useRamp, useHideOnScroll, useMedia). (1 h, plus 3 h inside Phase 1 for tuning)
- **Done when:** `npm run dev` shows a blank themed page from the demo config, and `npm run build` passes.

### Phase 1: Trattoria front end on fixtures (about 21 h)
Steps T1-T6b in `trattoria-site-plan.md`: tokens and fonts, photo slots with placeholders, nav and "check" tray, hover vocabulary and candle cursor, Home (static), Menu, Hours and Location, Contact, Gallery, plus the motion kit applied.
- **Done when:** all five pages work at 390px and desktop, keyboard and screen-reader basics pass, and nothing animates the hours, phone or order buttons.

### Phase 2: The signature piece, "A Meal in Scroll" (about 14 h, raised from 10)
Step T7 in the trattoria plan, at the Funkharp level (pinned scenes, parallax layers, ink illustrations); see `trattoria-site-plan.md` section 9.
- **Checkpoint 1 (about Nov 6):** deploy a labelled preview ("Demo restaurant, not a real business"). You look at it and decide: keep, change, or push harder on the interaction.

### Phase 3: Backend for menu and hours (about 22 h)
- 3.1 Supabase project for the demo; migration 001: `site_settings`, `locations`, `menu_sections`, `menu_items`, `hours_weekly`, `hours_exceptions`, `media`, `admin_users`, `admin_login_attempts`; RLS on every table plus RLS tests. (5 h)
- 3.2 Data layer replaces fixtures; fixtures stay for the demo and tests. (3 h)
- 3.3 Admin shell: magic-link login, mobile layout, onboarding checklist stub. (3 h)
- 3.4 Menu editor with the 86 switch (sold-out in one tap), reorder, hide. (6 h)
- 3.5 Hours and closures editor; "open now" and the door sign read real data. (5 h)
- **Checkpoint 2 (about Nov 13):** you edit the menu from your phone and watch the site change.

### Phase 4: Finish Counter (about 16 h)
Restaurant JSON-LD with closures (verify against Google's docs first), sitemap, Open Graph, contact form to Resend with spam protection, gallery upload with alt text, specials banner, order/reserve buttons, `new-client` script.
- **Checkpoint 3 (about Nov 20):** the Counter tier is complete. Decide next from the catalog: Dine-In features, the other five themes, a second signature piece, or a real pilot restaurant.

### Phase 5+: Chosen at checkpoint 3
Candidates, in my suggested order: monthly report email and click tracking, specials page, events, inbox with phone alerts (web push, reuse Funkharp), steakhouse theme, taqueria theme.

## Calendar (about 20 h/week, estimates)

| Week of | Plan | Cumulative |
| --- | --- | --- |
| Oct 26 | Phase 0, most of Phase 1 (**in parallel: you generate the establishing images**) | 20 |
| Nov 2 | finish Phase 1, Phase 2, start Phase 3. **Checkpoint 1 about Nov 6** | 40 |
| Nov 9 | finish Phase 3. **Checkpoint 2 about Nov 13** | 60 |
| Nov 16 | Phase 4. **Checkpoint 3 about Nov 20** | 73, then 7 spare for fixes |

Thanksgiving week (Nov 23) and December are left for the checkpoint-3 decisions. Day 90 is Jan 10, 2027, so there are about 7 weeks of room after Counter is done.

## Risks

| Risk | Fallback |
| --- | --- |
| Signature piece eats more than 10 h | Fix the time box at 14 h; ship the simpler scene set (hero, one course scene, check) and extend later |
| Fixtures hide real-data problems | Edge-case fixtures from day one; Phase 3 starts with a data-shape review |
| Scroll piece is heavy on a mid phone | Lazy-load it, plain layout fallback, test on a real phone before checkpoint 1 |
| Funkharp fixes pull time away | Funkharp comes first; this plan slips week for week |
| Photos and illustrations take longer than code | Start with illustrated SVG and tinted placeholders; swap in licensed photos last, each logged in `image-log.md` |
