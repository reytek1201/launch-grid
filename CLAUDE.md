# LaunchGrid Studio: project guide

Reytek (Atlanta) runs LaunchGrid Studio, a one-person studio that builds custom websites with a built-in back office: music first, restaurants second. Funkharp (a band site) is the live proof; this repo holds the **restaurant template** and its demo, **Trattoria Cinque Lune** (fictional). Goal: land the first paying client. Everything here should look and feel like a real product a restaurant owner could run from a phone.

Read first when you need detail: `docs/restaurant-build-plan.md` (status, source of truth), `docs/restaurant-feature-catalog.md` (tiers), `docs/trattoria-site-plan.md` (design), `restaurants/README.md`.

## Layout
- `restaurants/` the Next.js app (Next 16, React 19 with React Compiler, Tailwind 4, framer-motion). **`restaurants/AGENTS.md`: this is not the Next.js you know. Read `node_modules/next/dist/docs/` before relying on old habits.**
- `restaurants/db/NNN_*.sql` numbered migrations, in order. The `new-client` script builds a client's database from these, so every schema change goes here too.
- `restaurants/clients/<slug>/` one folder per client (`content.ts`, `images.json`, `intake.json`, `setup.sql`); `clients/demo/` is the demo; `clients/_template/intake.example.json` is the intake shape. `NEXT_PUBLIC_CLIENT` picks the folder. Demo fixtures, image log, prompts. `restaurants/qa/` the test kit. `restaurants/scripts/` build and seed scripts, `new-client.mjs`.
- `docs/` plans. `.claude/commands/` slash commands: `/ship`, `/qa`, `/migration`, `/status`, `/new-client`, `/launch-check`.

## Where things live
- GitHub `reytek1201/launch-grid` (private), branch `main`. Pushing `main` deploys.
- Vercel project `cinque-lune-demo` (team `rays-projects-a1b26797`, id `prj_JPee3QXQWNYpQGsxUfFUM6CD81ft`), public at `cinque-lune-demo.vercel.app`. Root directory `restaurants`.
- Supabase project **Reytek1201** (`pehytilcqrmzeuoewdnk`, Pro). It also hosts the music site, so **only ever touch the `trattoria_demo` schema, the `trattoria-demo` storage bucket and their policies.** Never touch `public` tables or functions (join_transmission, place_order, music tables): those warnings in the advisors are known and left alone on purpose.
- Env vars (Vercel): `SUPABASE_URL`, `SUPABASE_ANON_KEY` (publishable key only, never service-role), `SUPABASE_SCHEMA`, `SUPABASE_BUCKET` (default `trattoria-demo`), `NEXT_PUBLIC_SITE_URL`, `SPAM_SALT`. Optional email alerts: `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_ALERTS_TO` (not set; nothing is sent without them, fine for a mock site).
- Paths: cloud `/home/claude/launch-grid`; Reytek's Mac `/Users/keymacro/Projects/Launch Grid` (mounted as `$HOME/mnt/Launch Grid`, Downloads at `$HOME/mnt/Downloads`).

## How the app works
- Content comes from Supabase (menu, wines, hours, closures, settings, banner, order/booking links, gallery, uploads) read with `fetch` revalidate 60 and tag `site`; fixtures in `clients/demo` are the fallback so the site never errors. Events and story copy are still fixtures.
- Admin (`/admin`): email sign-in link (Supabase Auth, `shouldCreateUser: false`, so admins must be invited and listed in `admin_users`), RLS enforces it (`is_admin()`). Every admin save is a server action in `app/admin/actions.ts`: `requireAdmin()`, validate, write, `done(path)` (which runs `updateTag(SITE_TAG)` + `revalidatePath`), errors via `fail()` / `check()` redirects with `?error=`. Reuse `Submit`, `Card`, `Field`, `Arrows`, `HideButton`, `CloseDetails`, `PhotoUpload`. Add a table to `TABLES` / `PAGE` / `PARENT` and ordering and hide come free.
- Requests (reservation, event, contact) are never written by the browser: server action `sendRequest` → security-definer `submit_request` (spam guards: hidden trap field, 3 s minimum, link and email checks, per-visitor and global limits, duplicate guard). Email alert after the response via `after()`.
- Photos: the browser shrinks (dishes square 1200 px, gallery keeps shape 1600 px, WebP), the server action uploads to the bucket and stores the path. Dish photo key is `d-01` (sample) or `up:<id>` (uploaded); gallery rows with path `sample:<key>` point at shipped photos.
- Design system "Candlelight and ink": cream `#F6EEDD`, paper `#FBF6EA`, espresso `#2B1D14`, terracotta `#B9532F` / deep `#9A3F20`, olive `#4F5E2F`, wine `#6E2233`, peach `#f2b27a`; Fraunces (headings), Source Sans 3 (body), Caveat (handwritten). The admin mirrors Funkharp: dark sticky top bar, floating phone tab bar, paper cards.

## Quality bar (every change)
- Works at 390 px wide first; no sideways scroll; tap targets at least 40 px.
- Accessibility: axe reports zero violations (contrast included). Photos get real alt text. Buttons and fields have names.
- Never show an error page to a guest. Anything that can fail has a fallback or a plain-words message.
- Security: RLS on every table, anon reads published content only, no secrets in the repo or in chat. Server actions check the admin themselves.
- Test before you say "done": `npm run qa` in `restaurants/` (see below), plus a flow test for anything new. Look at screenshots, don't just trust exit codes.

## Working here (environment gotchas)
- **Test kit:** `cd restaurants && npm run qa` starts a fake Supabase (`qa/fake-supabase.js`, data in `qa/data.json`, in memory only) and `next dev`, then runs `qa/smoke.js` (all public pages) and `qa/admin.js` (all admin pages) on phone and desktop with axe. `npm run qa -- gallery-flow` runs a click-through flow; copy it for new flows. Fake logs: `/tmp/qa-fake.log`. When you add a table or column, add it to `qa/data.json`, and teach the fake any new request shape.
- `next build` fails in the cloud sandbox (it cannot fetch Google Fonts); Vercel's build is fine. Use `npx tsc --noEmit`, `npx eslint app lib components`, and `npm run qa` locally.
- The cloud shell cannot reach `*.vercel.app`. Check deploys with the Vercel tools (`list_deployments`, `get_deployment` until `READY`; builds take about 25 to 60 s). Never claim something is live before READY.
- `sleep` is blocked in Bash; wait with Monitor, or just poll the Vercel tool again.
- Git: author must be `Claude <noreply@anthropic.com>` (`git config user.email noreply@anthropic.com; git config user.name Claude`), or GitHub shows commits as unverified and the stop hook complains. End commit messages with the attribution lines the session gives you. Push only to `main` when asked to ship.
- Supabase: apply schema changes with the MCP `apply_migration` **and** save the same SQL as the next `db/NNN_*.sql`. Run `get_advisors` after. SQL cannot delete storage buckets (use the dashboard). Scratch tests belong in a throwaway schema, dropped afterwards.
- Syncing Reytek's Mac from the cloud: `git bundle create /tmp/claude-0/lgN.bundle <last-synced-sha>..main` (**use a new N every time**; a stale file with the same name was silently reused once), copy to `/mnt/user-data/outputs/`, `device_commit_files` to `/Users/keymacro/Downloads/lgN.bundle`, then `device_bash`: `cd "$HOME/mnt/Launch Grid" && git pull -q $HOME/mnt/Downloads/lgN.bundle main`. Confirm with `git log --oneline -1`.
- Next 16 specifics: `proxy.ts` (not middleware), `cookies()` and `searchParams` are async, `updateTag` in server actions, `after()` from `next/server`, `serverActions.bodySizeLimit` is `3mb`, `images.remotePatterns` covers the storage bucket.

## Working with Reytek
- Plain words, short, direct. Say what shipped, what was checked, and what was not. Don't narrate steps. Give him exact click paths for dashboards (and verify them; a wrong menu path cost a round trip once).
- Do the whole job: code, migration, test, deploy, sync his Mac, update `docs/restaurant-build-plan.md` (status line for the feature, adjust "Next"). Ask only when a wrong guess is expensive.
- He tests on his phone and catches real UI problems (clipped text, empty states, missing sample data). Fix the cause, not just the symptom.
- Look up current prices and rules and cite them; no legal or tax advice as fact.
- Restaurants are the second product: every restaurant site must feel interactive (creative scrolling tied to the place), with one shared backend and per-client design and features.
