---
description: Is a client ready to go live? Checks files, database content and the live site
argument-hint: "<slug> [--url https://their-site]"
---
From `restaurants/` run `npm run launch-check -- $ARGUMENTS`. For the database check, also pass `--db "<SUPABASE_URL>|<publishable key>|<schema>"` using that client's values (publishable key only, from `get_publishable_keys`; never the service-role key).

It lists FAIL (do not launch), WARN (read it) and ok. Fix every FAIL yourself where the fix is in the repo (placeholders, photo list, alt text); for the rest tell Reytek the exact dashboard click path. Then go through what the script says it cannot check: Vercel env vars and domain, Supabase redirect URLs and invited admins, a real sign-in, and a test reservation that reaches the Inbox. Do not call a client ready while any FAIL remains.
