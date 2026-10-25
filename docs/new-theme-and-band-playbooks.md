# Playbooks: a new restaurant theme, and a new band site

## New restaurant theme (a client whose look is not "trattoria")
The Trattoria look lives in `restaurants/themes/trattoria/` (signature scenes, page pieces) and its colors in `app/globals.css`. Pages in `app/` call into the theme; data, admin, database and forms are shared and do not change.
1. Write the design first: `docs/<theme>-site-plan.md` (palette, fonts, one signature scroll idea tied to the place, per-page ideas). Every restaurant site must feel interactive.
2. Copy `themes/trattoria` to `themes/<name>`, rename the exports, swap the scenes and copy ("Libro dei vini", the lantern strip text and photo keys are Trattoria-specific). Keep the props the pages already pass.
3. Choose the theme per client: add `theme` to the client's `content.ts` and a small switch where the pages import theme components (do this once, the first time a second theme exists; today pages import Trattoria directly).
4. Photo keys are theme-specific: add the new theme's shot list to `scripts/photo-kit.mjs` (or a copy) so `/photos` stays accurate.
5. Run `/qa` (phone first, axe zero), then `/launch-check`.
Estimate: the first new theme is most of a build phase (see the Phase plan); the second is much faster because the seams exist.

## New band site (music side, Funkharp is the template)
Not built here yet. When the first band client arrives: copy the Funkharp repo structure, give the band its own Supabase schema from the same migration pattern (`new-client` idea: numbered SQL, one schema per client, RLS, admin allow-list), reuse the dark admin look, and write a `new-band` script from what Funkharp actually needs (shows, music links, merch, mailing list). Do not generalize it before there is a real second band to learn from.
