---
description: Run the LaunchGrid test kit (all pages, phone and desktop, accessibility) and any flow tests
argument-hint: "[flow names, e.g. gallery-flow]"
---
From `restaurants/` run `npm run qa -- $ARGUMENTS` (no arguments = `smoke` and `admin`). Report failures with the route and the exact violation. For a change that adds a page or a flow, add it to `qa/smoke.js` / `qa/admin.js` or copy `qa/gallery-flow.js`, and update `qa/data.json` and `qa/fake-supabase.js` if the database shape changed. Take screenshots with `check(page, route, { shot: "/tmp/x.png" })` and view them: passing tests do not mean it looks right.
