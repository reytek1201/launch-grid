---
description: Write the owner's guide (HANDOFF.md) for a launched client
argument-hint: "<slug> --url https://their-site --contact \"who to call\""
---
From `restaurants/` run `node scripts/handoff.mjs $ARGUMENTS`. It writes `clients/<slug>/HANDOFF.md` from the client's intake: sign-in steps, the six admin tabs, and the jobs an owner does most (86 a dish, banner, hours and closures, dishes, photos, inbox). Read it once against the live admin on a phone width; if any button name differs, fix the script (names must match the admin exactly). Offer to send it as a Google Doc or PDF the owner can open on a phone. Never include secrets.
