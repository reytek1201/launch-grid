---
description: Build a pitch for a restaurant prospect (research, a live preview of their site, a one-page proposal, an outreach email)
argument-hint: "<restaurant name> <city>"
---
Goal: a first meeting. Do not invent prices, claims or testimonials, and do not send anything: draft only.

1. **Research** (WebSearch / WebFetch): their current site, menu, hours, reviews' themes (summarize, do not quote), whether they have online ordering and reservations, and what is weak about their site (slow, not mobile-friendly, PDF menu, no hours schema). Cite each finding with its URL. Skip anything private.
2. **Preview**: write an `intake.json` from their public menu, hours and address (mark guessed fields), run `new-client` into a throwaway slug and render their name and menu with the template locally, or screenshot the demo with their name. Say plainly it is a preview made from public information.
3. **One-page proposal** (a Docs artifact the prospect can read on a phone): what they get (the site, the owner admin: 86 a dish, banner, hours, closures, photos, inbox; requests by email), what we need from them (menu, hours, photos or a photo shoot, admin emails), a four-step timeline, and what is not included. Put **[PRICE: Reytek to set]** wherever a price goes. Pull tier names and what is in each from `docs/restaurant-feature-catalog.md`; do not promise POS or delivery integrations without checking the vendor's current terms and citing them.
4. **Outreach email**: three short drafts (owner, GM, via a mutual contact), under 120 words, one clear ask (15 minutes), no hype. Show them as drafts with the message tool; Reytek sends them himself.
5. Offer to log the prospect in `docs/restaurant-build-plan.md` under Prospects.
