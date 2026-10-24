# Fal AI plan: cost, consistency and the walkthrough idea

Oct 24, 2026 · Save as `docs/fal-image-plan.md`. Part of `trattoria-space-and-interaction.md`. The prompt to paste into the new chat is `docs/fal-chat-kickoff-prompt.md`.

**Status (Oct 24, 2026): first batch done.** 21 keepers are in `restaurants/clients/demo/assets/incoming/`; the logged results, final spend (about $2.51) and lessons are in section 9. SP-02 was cut and SP-13/14 were not made; upscaling was skipped for the mockup. The plan below is kept as written, with corrections noted where reality differed.

## 1. The idea in one paragraph

**Consistency comes from reference images, not from the model name.** So: make one strong anchor image of the dining room, then make every other image by handing the anchor (and a few other approved images) to a model that accepts reference images and is told "keep this room, show a different view". Explore cheaply where it doesn't matter, spend on the anchor, and edit rather than regenerate from scratch. This also gives us the keyframes for a walkthrough video later, at almost no extra planning.

*This changes one thing I told you before:* I said to use one model for the whole set. Better: the **anchor can come from any model** (we compare a few), and the **derived images all use one reference-capable model**.

## 2. Prices and models (verify before you spend)

I pulled these from [TeamDay's Sep 2026 comparison](https://www.teamday.ai/blog/ai-api-pricing-comparison-2026) (prices checked Sep 23, 2026) and fal's own [image-to-image](https://fal.ai/learn/tools/best-image-to-image-apis-2026) and [image-to-video](https://fal.ai/learn/tools/best-image-to-video-apis-2026) guides. They are third-party summaries, not fal's pricing page. **Each model's page on fal shows the live price; check it before the first run.** Their consistency notes come from the author's own single test, not an independent benchmark. License terms were not covered; **read each model's commercial-use terms.**

| Model on fal | Price (about 1 megapixel) | Reference images | Role in our plan |
| --- | --- | --- | --- |
| FLUX.2 [pro] | $0.03 first MP, +$0.015 per extra MP of input and output | up to 9 | Anchor challenger; also references |
| Seedream 5.0 Lite | $0.035 per image | up to 10; can return several variations per call | Anchor challenger; cheapest derived option |
| **Nano Banana 2** | **$0.08 at 1K** (2K is 1.5x, 4K is 2x) | **up to 14, no mask** | **Default for derived images**: it reasons about what to keep and what to change |
| Nano Banana Pro | $0.15 | up to 14 | Only if Nano Banana 2 struggles |
| SeedVR2 (upscaler) | about $0.001 per MP | n/a | Upscale winners instead of regenerating them at 2K |

**Verified on fal's own model pages (Oct 24, 2026):** FLUX.2 [pro] $0.03 for the first megapixel and $0.015 per additional MP, rounded up (1920x1080 bills as 2 MP, $0.045; 1280x720 stays at $0.03). Seedream 5.0 Lite $0.035 per image, flat, but its native minimum is 2560x1440 (about 3.7 MP) so it can't explore at 1 MP. Nano Banana 2 $0.08 at 1K ($0.12 at 2K, $0.16 at 4K). SeedVR2 $0.001 per MP. None of the pages had a negative-prompt field. Every page says "commercial use" and links to the general Terms of Service without spelling terms out, so the license still needs reading before a paying client.

Pricing reality check: our whole first batch is a few dollars. The expensive mistake is not the price per image; it's regenerating so many times that the images drift apart.

## 3. Which kind of call for which job

| Job | Use | Example |
| --- | --- | --- |
| A new view of the same place | **Reference generate** (attach the anchor, describe the new view) | Oven, bar, exterior from the anchor |
| Same shot, one change | **Single-image edit** (attach it, say what to change and "keep everything else") | Evening version of the dining room |
| Combine places and objects | **Multi-image output** (attach 2-4 references, say what each is for) | Dish on our plate in our room |
| Remove a flaw | **Single-image edit** | Fix a lantern count, remove a stray text-like shape |
| Different crop or shape of the same scene | **Reference generate** at the needed ratio (don't crop a 16:9 for a phone hero) | 4:5 phone version of the anchor |
| Bigger file for the hero | **Upscale** the winner (about a tenth of a cent) | 1K to 2K |

**Multi-reference rule:** label them in the prompt ("image 1 is the room, image 2 is the plate setting"), and say what to keep from each.

## 4. Order of work, with the method for each

The first image is the anchor. Each later step uses what the earlier ones produced.

| Step | Image | Method | Attach as reference |
| --- | --- | --- | --- |
| 1 | **SP-03 Dining room (anchor)** | New generation, 3 models x 3 tries | none |
| 2 | **SP-03b Same room, evening** | Single-image edit | SP-03 |
| 3 | SP-05 Place setting, overhead (**our tableware**) | Reference generate | SP-03 |
| 4 | SP-11 Five lanterns | Reference generate | SP-03 |
| 5 | SP-04 Oven | Reference generate | SP-03 |
| 6 | SP-01 Exterior, dusk | Reference generate | SP-03 (colors and lanterns glimpsed through windows) |
| 7 | SP-02 Door close-up | Multi-image output | SP-01, SP-03 |
| 8 | SP-06 Hands and pasta, SP-07 bar, SP-08 booth, SP-09 pantry, SP-10 candle, SP-12 espresso | Reference generate | SP-03, and SP-05 when plates appear |
| 9 | D-01 to D-08 dishes | Multi-image output, one dish per call | SP-05 (plate, table, light), plus the last approved dish for plating style |
| 10 | SP-13, SP-14 textures | Reference generate | SP-03 (optional; CSS can do plain textures) |
| 11 | Upscale all winners | Upscaler | the winners |

**Idea worth testing early:** SP-03 (late afternoon) and SP-03b (evening) are the same room from the same camera. The website can cross-fade between them as you scroll, matching the "meal" clock. It costs one cheap edit and gives the page a real sense of the evening arriving.

## 5. Cost plan (estimates)

Assumes Nano Banana 2 at $0.08, 3 tries per image on average.

| Stage | Count | Estimate |
| --- | --- | --- |
| Anchor SP-03: 3 models x 3 tries | 9 | $0.44 |
| SP-03b evening edit | 3 | $0.24 |
| Space shots (11) | 33 | $2.64 |
| Dishes D-01 to D-08 | 24 | $1.92 |
| Upscales | 14 | $0.05 |
| **First batch total** | | **about $5.30** |
| With a 2x safety margin | | **about $10.60** |
| Later: the other 14 dishes | 42 | about $3.40 |

Using Seedream 5.0 Lite for derived images would cut this roughly in half. Test both on step 5 (oven) with the same references: about $0.12 for the comparison, then use the winner.

**Controls:** add a small amount of credit (about $10), set a usage alert if fal offers one *(I haven't verified fal's billing options)*, and let the chat track running cost.

## 6. Consistency rules

1. Every derived image is made from references, never from the prompt alone.
2. The STYLE BLOCK (in the space doc) goes into every prompt, unchanged.
3. Pick the aspect ratio per image at generation time.
4. Keep the camera idea: eye level for rooms, 45 degrees or overhead for tables.
5. If a detail drifts (lantern count, tableware), fix it with a single-image edit, not a fresh generation.
6. Log every keeper in `image-log.md` (model, settings, seed if offered, references used, prompt, cost). I created the file.
7. Cut at three tries. If an image isn't working after three, change the references or the prompt, don't just roll again.

## 7. The walkthrough video (idea, not now)

Once the stills exist, a walkthrough is cheap because the stills become the start and end frames of each clip. Plan: exterior (SP-01) to door (SP-02) to dining room (SP-03) to oven (SP-04) to table detail (SP-05) to candle (SP-10): five transitions of about 6 seconds, about 30 seconds in total.

| Model on fal | Price per second (no audio unless noted) | Note |
| --- | --- | --- |
| Kling v3 Pro | $0.112 (1080p) | Multi-shot; clip length 3-15 s |
| Kling O3 Pro | $0.112 (1080p) | Animates between a start and end frame, which is exactly this job |
| Seedance 2.0 | about $0.30 (720p), $0.68 (1080p) | Camera control; optional end frame |
| Veo 3.1 Fast | $0.15 with audio (1080p) | |

A full pass at Kling's price is about **$3.40**; budget two passes (about **$6.70**) plus a **5-second test clip (about $0.56)** before committing. The article didn't test interiors, so the test clip matters: watch for lanterns changing count and walls warping.

On the site, a video would be a short muted loop (under 8 seconds, under a few MB, with a poster image), stored outside the repo (Supabase Storage or Vercel Blob), never auto-playing sound. A video hero is already in the catalog as an add-on.

**Honesty:** a fake walkthrough of a fictional restaurant is fine on the labelled demo. For a real client, a generated room isn't their room; for them, use real footage.

## 8. What you do now (done Oct 24, 2026)

1. ~~Open a new chat and paste `docs/fal-chat-kickoff-prompt.md`.~~ Done.
2. ~~Generate SP-03 and the rest.~~ Done; see section 9.
3. Keepers are saved in `restaurants/clients/demo/assets/incoming/` as `sp-03-dining-room.png` style names (PNG, not JPG; optimizing to JPG/WebP happens when the images are wired in). Rejected tries are in `incoming/_rejects/`.
4. Next: wire the images into the photo slots (needs the Phase 0 scaffold; see `restaurant-build-plan.md`).

## 9. Outcome of the first batch (Oct 24, 2026)

### Decisions made
- **Anchor (SP-03):** three models, one try each. **Nano Banana 2 won**: the only photographic one, with exactly five lanterns. FLUX.2 [pro] looked like a modern boutique hotel (sea view, about four stacked lanterns); Seedream 5.0 Lite had the best mood but six lanterns in two clusters and a 3D-render look. One fix edit on the Nano Banana 2 result (plain windows, no framed pictures, no side tables, darker and warmer) became the approved SP-03.
- **Derived-image model:** the oven comparison (SP-04) was Nano Banana 2 vs Seedream 5.0 Lite with the same reference. Seedream made the more dramatic standalone picture (bigger flames, 2304x3072) but drew a different oven; **Nano Banana 2 kept the SP-03 oven, shelves, sconces and floor, so it was used for everything.** The Seedream image is kept as an alternate in `_rejects/`.
- **Aspect ratios:** the Nano Banana 2 picker on fal only offers 1:1, 4:3, 3:4, 16:9 and 9:16. The set was generated at the nearest ratio and cropped (21:9 from 16:9, 4:5 from 3:4, 3:2 from 4:3). The picker sometimes reset between runs, so check it before every run.
- **Upscaling skipped** (mockup). If a hero looks soft on the full site, upscale just that image with SeedVR2 (about $0.004 for a 4 MP result).

### What was made
| Result | Images |
| --- | --- |
| Keepers (21) | SP-01, SP-03, SP-03b, SP-03v, SP-04, SP-05, SP-06, SP-07, SP-08, SP-09, SP-10, SP-11, SP-12, D-01 to D-08 |
| Cut | **SP-02** (door close-up): three tries could not make the door view agree with the exterior windows and the dining room. The La Porta scene uses SP-01. |
| Not made | SP-13, SP-14 (textures; CSS covers plain textures) |
| Simplified | SP-05: one plate, cutlery and napkin, no torn bread, olive-oil dish or wine glass (those extra objects kept breaking the shot) |
| Bonus | **SP-03v**: a vertical (3:4) version of the dining room with one place setting, made by accident when an edit ran against SP-03; good as a mobile hero |

### Actual spend: about $2.51 (estimate was $5.30)
SP-03 round $0.155 + fix $0.08; SP-03b $0.08; SP-05 $0.24 (3 tries); SP-11 $0.16; SP-04 $0.115 (both models); SP-01 $0.08; SP-02 $0.24 (cut); SP-06, 07, 09, 10, 12 $0.08 each; SP-08 $0.08 + $0.08 (the accidental SP-03v); D-01 $0.16 (two ratios); D-02 to D-07 $0.48; D-08 $0.16.

### Lessons (also in `fal-chat-kickoff-prompt.md` for the next theme)
1. **Match the output ratio to the reference's ratio.** A 1:1 dish made from a 3:4 reference showed the corner of a small table; the 3:4 version showed the long table.
2. **The full STYLE BLOCK drags the whole room into tight shots.** For close-ups (place setting, lanterns, oven, doorway) use only the light and camera sentences and say "do not show the room".
3. **Single-image edits: attach only the image being edited.** A leftover reference makes the model produce a different picture.
4. **Don't fix spatial logic with camera angles.** The model ignored "30 degrees". Work out the floor plan first: the street windows look across the room, so the long table runs parallel to the street wall; a door view is side-on, not end-on. Cut shots that need cross-image geometry.
5. **Look at lanterns from the side.** Looking up flattens them into discs with visible bulbs.
6. **Say "plain, no label" for tins, bottles and chalkboards.** It worked every time.
7. **Dishes chain well:** each dish uses SP-05 (plate, wood) plus the previous dish (angle, table, light, bokeh). Say "copy the background exactly" and name the lanterns; one dish invented a row of small lanterns until the prompt restated the paper-lantern cluster.
8. **Exact winning prompts** are in `restaurants/clients/demo/assets/prompts.md`; the per-image log is `image-log.md`.
