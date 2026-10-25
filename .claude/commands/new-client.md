---
description: Start a new restaurant client (database setup, seeded content, onboarding checklist)
argument-hint: "<slug> --intake clients/<slug>/intake.json   (or --name ... --admin ...)"
---
From `restaurants/` the new client starts from an intake file: copy `clients/_template/intake.example.json` to `clients/<slug>-intake.json` (or ask Reytek for the details and write it), then run `npm run new-client -- <slug> --intake <file>`. `$ARGUMENTS` are passed as given.

The script checks the intake (prices, hours, tags, emails, https links) and stops with a plain list of problems if anything is off. It writes `clients/<slug>/`: `setup.sql` (tables, rules, bucket, menu, wines, hours, closures, links, admins), `content.ts` (the site's fallback copy), `images.json`, `intake.json` and `ONBOARDING.md`.

Read `ONBOARDING.md` and walk Reytek through it one step at a time. Apply `setup.sql` with Supabase MCP only if he says the client lives in the Reytek1201 project; otherwise he pastes it into the client's own SQL editor. Then cover "Still to do": photos (the template's samples show until `images.json` has the client's own), story and events pages, theme wording. Do not commit anything containing real client secrets. Delete throwaway test clients' folders afterwards.
