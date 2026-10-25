---
description: Start a new restaurant client (database setup + onboarding checklist)
argument-hint: "<slug> --name \"Restaurant\" --admin owner@example.com"
---
From `restaurants/` run `npm run new-client -- $ARGUMENTS`. Read the generated `clients/<slug>/ONBOARDING.md` and walk Reytek through it one step at a time. For the database step, apply `setup.sql` yourself with Supabase MCP only if he says the client lives in the Reytek1201 project; otherwise he pastes it into the client's own SQL editor. Remind him what is still the demo's (story, events, hero photos, gallery) and offer to replace it. Do not commit anything containing real client secrets.
