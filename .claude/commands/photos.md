---
description: Make the photo shot list for a client (ready-to-paste image prompts for every photo the template uses)
argument-hint: "<slug>"
---
From `restaurants/` run `node scripts/photo-kit.mjs $ARGUMENTS`. If the restaurant does not look like the Trattoria demo (brick room, five paper lanterns, wood-fired oven), first ask Reytek three short things about the place (the room, the signature feature, the colors), put them in a `look` block in `clients/<slug>/intake.json` (fields are listed at the top of `scripts/photo-kit.mjs`) and run it again.

It writes `clients/<slug>/assets/shot-list.md` (prompts for SP-01 to SP-14 plus a square photo per featured dish, with ratio, where each is used, alt-text starter) and an empty `image-log.md`. Walk Reytek through the order: anchor room SP-03 first, everything else from it as the reference. After he saves PNGs in `assets/incoming/` and logs them: `npm run images -- <slug>`, `node scripts/build-manifest.mjs <slug>`, then `npm run launch-check -- <slug>`. Look at every finished photo for lettering, faces and odd hands before accepting it.
