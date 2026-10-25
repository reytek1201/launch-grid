---
description: Take a client from signed intake to a live, checked site
argument-hint: "<slug>"
---
Preconditions: `clients/<slug>/intake.json` is final and Reytek confirmed which Supabase project hosts the client (the shared Reytek1201 project, or the client's own).

1. `npm run new-client -- <slug> --intake clients/<slug>/intake.json` if the folder does not exist; otherwise reuse it.
2. **Database.** Shared project: apply `clients/<slug>/setup.sql` with `apply_migration` (name it `client_<slug>`), then `get_advisors` and report anything new. Never touch another client's or the music site's objects. Client's own project: tell him exactly where to paste it (SQL editor). Either way he must expose the schema (Settings → API → Exposed schemas) and invite each admin (Authentication → Users → Invite user); verify these click paths against current Supabase docs before giving them.
3. **Vercel.** New project from `reytek1201/launch-grid`, root directory `restaurants`, with the env vars table in `ONBOARDING.md` (use `create_git_project` and `create_project_env`; publishable key only, never service-role; generate no secrets into chat or the repo except the SPAM_SALT already in ONBOARDING.md which must be set but not committed publicly). Deploy; poll `get_deployment` until READY. Never say it is live before READY.
4. **Photos.** `/photos <slug>` if the client has none yet.
5. `npm run launch-check -- <slug> --url <site> --db "<url>|<publishable key>|<schema>"`. Fix every FAIL.
6. Do the manual checks the script lists: a real sign-in, a test reservation reaching the Inbox, one dish photo and one gallery photo upload.
7. `/handoff <slug> --url <site>`, then update `docs/restaurant-build-plan.md` (clients table) and sync Reytek's Mac.
Stop and ask before: buying or pointing a domain, anything touching a client's DNS, or sending email to the owner.
