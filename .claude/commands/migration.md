---
description: Add a database migration the safe way (file, live apply, advisors, test data, new-client check)
argument-hint: "what the change is"
---
Change: $ARGUMENTS

1. Next number = highest `restaurants/db/NNN_*.sql` + 1. Write the SQL there, in schema `trattoria_demo` only, with RLS and grants (anon reads published content only; admins via `is_admin()`). `scripts/new-client.mjs` rebuilds client databases from these files, so keep each file self-contained and in order; sample/demo data goes in its own statement that new-client can strip (it already strips `gallery_photos` sample inserts and the admin email insert).
2. Apply the same SQL with Supabase MCP `apply_migration` (project `pehytilcqrmzeuoewdnk`). **Deploy order matters:** if live code would break on the new data before the new code ships, push the code first or make the old code tolerate it.
3. `get_advisors` (security and performance): fix anything new in our schema; leave the known music-site warnings.
4. Add the new columns and tables to `qa/data.json`; extend `qa/fake-supabase.js` if needed; `npm run qa`.
5. If new-client output should differ (new demo seed to strip, new env var), update `scripts/new-client.mjs` and run it once with a throwaway slug to read the output. Delete the folder afterwards. If you applied the output to the live DB for a test, drop the schema, its three storage policies; the bucket must be deleted by Reytek in the dashboard.
