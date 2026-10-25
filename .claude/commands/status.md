---
description: Where is the project right now: git, deploys, database health, open work
---
Report briefly:
1. `git status -sb` and the last 5 commits in the repo; whether the Mac copy is behind (compare with `git log` on `$HOME/mnt/Launch Grid` if the device is linked).
2. Vercel `list_deployments` for `cinque-lune-demo` (last 3: state, commit subject). If the latest is ERROR, fetch the build log events.
3. Supabase `get_advisors` security and performance, split into "new" and "known and left alone" (music-site functions in `public`, `submit_request` and `is_admin` executability, `pg_net` in public, RLS-without-policy music tables).
4. Open work from `docs/restaurant-build-plan.md` ("Next", "Blocked on you").
Plain words, no long lists.
