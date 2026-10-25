---
description: Check, commit, push to main, confirm the Vercel deploy is READY, sync Reytek's Mac, update the build plan
---
Ship the current work in `restaurants/`. Do each step and stop on any failure.

1. `cd restaurants && npx tsc --noEmit && npx eslint app lib components` must be clean. Run `npm run qa` and, for anything new in the admin, the matching flow in `qa/`. Look at screenshots of what changed (phone first).
2. If the DB changed, the migration is already applied via MCP **and** saved as `db/NNN_*.sql`. Run Supabase `get_advisors` and note anything new.
3. Update `docs/restaurant-build-plan.md`: one status line for what changed, adjust "Next". Update `.env.example` if env vars changed.
4. Git: author `Claude <noreply@anthropic.com>`; commit message with a short imperative subject and the attribution lines the session provides; push to `main`.
5. Vercel: `list_deployments` for project `cinque-lune-demo`, then `get_deployment` until `READY` (or report the build error from `list_deployment_events`). Do not say "live" before READY.
6. If the session is in the cloud, sync Reytek's Mac with a **new** bundle name (see CLAUDE.md) and confirm the Mac's `git log --oneline -1`.
7. Report in plain words: what changed for the restaurant owner, what was verified, what was not, one next step.
