#!/usr/bin/env node
// Writes the photo shot list for a client: one ready-to-paste prompt per photo the template uses, in the order that keeps
// the pictures looking like one restaurant (anchor room first, everything else generated from it as a reference).
//
//   node scripts/photo-kit.mjs bella-notte
//
// Reads clients/<slug>/intake.json (name, menu, and an optional "look" block, see below) and writes
//   clients/<slug>/assets/shot-list.md   the prompts, ratios, where each photo appears, alt text to start from
//   clients/<slug>/assets/image-log.md   empty log (one row per keeper); scripts/build-manifest.mjs turns it into images.json
//   clients/<slug>/assets/incoming/      drop the PNG masters here
// Then:  npm run images -- <slug>  (JPGs into public/<slug>/)   node scripts/build-manifest.mjs <slug>  (images.json)
//
// "look" in intake.json (all optional; the defaults are the Trattoria demo's mood, so change what differs):
//   room      what the main dining room is like        building   the exterior        hero   the room's focal feature (oven, open kitchen, bar...)
//   table     the table and tableware                  light      lanterns / pendants / candles over the table
//   walls     wall and ceiling materials               palette    colors for the style block   craft   what the hands in the kitchen are making
//   detail    small props that fill the shelves        drink      what is poured in the cellar shot   dessert   the end-of-meal plate
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const slug = process.argv[2];
if (!slug) { console.error("Usage: node scripts/photo-kit.mjs <slug>"); process.exit(2); }
const dir = join(root, "clients", slug);
if (!existsSync(join(dir, "intake.json"))) { console.error(`clients/${slug}/intake.json not found. Run new-client first.`); process.exit(2); }
const intake = JSON.parse(readFileSync(join(dir, "intake.json"), "utf8"));

const L = {
  room: "a long communal dark oak table runs from the foreground toward the back of the room, mismatched wooden chairs on both sides",
  table: "cream ceramic plates with a thin terracotta rim, brass cutlery, linen napkins, simple wine glasses and candles in wine bottles",
  hero: "an arched brick wood-fired oven with visible flames",
  light: "exactly five round paper lanterns hanging in a single row above the table",
  walls: "ochre limewash walls, exposed brick and dark oak ceiling beams",
  detail: "strings of dried chilies and garlic, copper pots on shelves, jars of tomatoes and olive oil tins",
  building: "a two-story 1920s brick corner building with weathered brick and patches of ochre limewash",
  door: "an olive-green wooden door slightly open with warm light spilling onto the pavement",
  palette: "cream, terracotta, olive green and espresso brown",
  craft: "fresh egg pasta dough on a flour-dusted worn oak board with a wooden rolling pin",
  drink: "a glass of red wine",
  dessert: "a half-eaten slice of tiramisu dusted with cocoa",
  ...(intake.look ?? {}),
};
const customized = Object.keys(intake.look ?? {}).length;

const STYLE = `Warm 2700K candlelight, low-key lighting, gentle shadows, shallow depth of field, 35mm documentary photography, Kodak Portra 400 color, fine film grain, natural and lived-in, ${L.palette} palette. No people's faces, no text, no logos.`;
const REF = (what) => `Image 1 is the dining room. Use it as the reference for ${what}, so this looks like the same restaurant.`;
const NOTEXT = "Every sign, jar, tin and bag is completely plain with no labels, no lettering and no writing.";

const shots = [
  { id: "SP-03", ratio: "16:9", ref: "none (text-to-image)", use: "Home hero (desktop), Table scene, Gallery. THE ANCHOR: make this first and get it right.", alt: "the dining room, set for dinner", prompt: `Wide establishing photograph of the main dining room, eye-level, 16:9. ${cap(L.room)}, the room empty of people. At the far end, ${L.hero} glows. ${cap(L.light)}. Table set with ${L.table}. ${cap(L.walls)}; ${L.detail}. Soft golden window light enters from the side. ${STYLE}` },
  { id: "SP-03b", ratio: "16:9", ref: "SP-03 (single-image edit)", use: "Home (the room at night), Table scene, Check scene", alt: "the same dining room at dusk, lit by candles", prompt: `Keep the room, the table, the chairs, the lights and the table setting exactly the same. Change only the time of day: it is now late evening. The windows show deep blue dusk with a last thin band of amber. The room is lit mainly by candlelight; the candles and wall sconces burn brighter, ${L.hero} glows stronger. Deeper shadows in the corners and ceiling, warm 2700K light pooling on the table. Same camera angle, same framing. No text, no people, no logos.` },
  { id: "SP-01", ratio: "16:9", ref: "SP-03", use: "Home door scene (the first thing visitors see)", alt: "the restaurant's exterior at dusk", prompt: `${REF("the materials, colors and warm light")} Create a new photograph of the exterior of the same building at dusk, from across the street at eye level: ${L.building}, tall windows glowing warm amber from inside, ${L.door}, a plain blank hanging sign above the door with no lettering. Deep blue evening sky with a last band of amber, a quiet empty street, no cars, no people. ${STYLE}` },
  { id: "SP-03v", ratio: "3:4", ref: "SP-03", use: "Home hero on phones (vertical)", alt: "the dining room, vertical view", prompt: `${REF("the room, table and lights")} Create a vertical 3:4 photograph of the same room from a slightly lower angle at the near end of the table, one place setting at the front, golden-hour street light through the window, the lights glowing above. No people. ${STYLE}` },
  { id: "SP-05", ratio: "1:1", ref: "SP-03", use: "Menu scene backdrop (starters)", alt: "an overhead view of a place setting on a dark wooden table", prompt: `Image 1 is the dining room. Use it only as a reference for the tableware, the wood and the warm candlelight. Do not show the room. Create a new photograph shot straight down from directly above, filling the square frame with the table surface and one place setting centered: ${L.table.split(",")[0]}, the brightest object in the frame, about 45% of the frame width, with a small sprig of rosemary. Cutlery and a folded napkin beside it. Nothing else. The wood continues to all four edges. ${STYLE}` },
  { id: "SP-06", ratio: "3:4 (crop 4:5)", ref: "SP-03", use: "Menu scene backdrop (pasta / first courses)", alt: "hands working at the kitchen board", prompt: `Image 1 is the dining room. Use it only as a reference for the wood, the candlelight and the palette; do not show the room. Create a new vertical photograph of two pairs of hands working ${L.craft}, a few whole eggs, a small bowl of flour, flour dust in the air. Close framing on the hands and the board, high 45-degree angle, the rest softly blurred into warm darkness. Five fingers each, no faces, no arms above the elbow. ${STYLE}` },
  { id: "SP-04", ratio: "3:4", ref: "SP-03", use: "Menu scene backdrop (mains), Events page", alt: "the oven glowing in the kitchen", prompt: `${REF("the exact oven, the walls, the beams and the candlelight")} Create a new vertical photograph of ${L.hero} from a closer, slightly lower angle: real visible flames and glowing embers, a wooden peel leaning against it, a fine haze of flour dust in the firelight, copper pots on a shelf beside it. Dark foreground, the glow as the main light. No people, no hands. ${STYLE}` },
  { id: "SP-12", ratio: "3:4 (crop 4:5)", ref: "SP-03 and SP-05", use: "Menu scene backdrop (dessert)", alt: "espresso and dessert at the end of the meal", prompt: `Image 1 is the dining room. Image 2 is the place setting. Use image 1 for the table, walls and candlelight and image 2 for the exact plate and cutlery. Create a new vertical photograph of the end of a meal: a small brass tray with two plain white espresso cups and a stovetop espresso pot, beside the plate from image 2 with ${L.dessert} and a fork. Thin steam from the cups, a candle glowing in the background with soft out-of-focus lights. 45-degree angle, calm. No people, no hands. ${STYLE}` },
  { id: "SP-11", ratio: "16:9 (crop 21:9)", ref: "SP-03", use: "Home, the strip between door and menu", alt: "the lights hanging in a row above the table", prompt: `${REF("the exact lights, the ceiling beams and the candlelight")} Create a new wide photograph, camera at eye level looking straight at the lights from the side: ${L.light}, evenly spaced, each a soft glow with no visible bulb. Behind them a dark beam and a wall. The row sits in the vertical middle with generous dark space above and below. No table, no people. ${STYLE}` },
  { id: "SP-10", ratio: "16:9 or 4:3", ref: "SP-03", use: "Home closing scene, Reserve page", alt: "a candle burning in a bottle on the table", prompt: `${REF("the lights, the table and the candlelight")} Create a close-up of a single candle burning in a plain dark green wine bottle with no label, thick cream wax drips down the neck, on the table in the right third of the frame. Behind it the lights glow as soft out-of-focus orbs of bokeh; the rest of the frame is calm, dark and empty, the left half quiet for text. ${STYLE}` },
  { id: "SP-07", ratio: "4:3 (crop 3:2)", ref: "SP-03", use: "Contact / Visit", alt: "a corner of the bar", prompt: `${REF("the walls, the wood, the sconces and the candlelight")} Create a photograph of a corner of the bar: a dark worn bar counter with a row of bottles on a shelf behind it, a few simple glasses on the counter, a brass wall sconce with a lit candle, a small black chalkboard on the wall, completely blank. Eye level, three-quarter view, softly blurred warm background. No people. ${NOTEXT} ${STYLE}` },
  { id: "SP-08", ratio: "3:4 (crop 4:5)", ref: "SP-03", use: "Reserve, Visit", alt: "a window booth at golden hour", prompt: `${REF("the walls, the windows and the candlelight")} Create a vertical photograph of a window booth at golden hour: a wooden bench against the wall beside a plain wood-framed window with low golden sun, a small table with a red-and-cream checkered cloth, a candle in a bottle with wax drips, and ${L.drink} catching the light. A plate and cutlery at one place. No people. ${STYLE}` },
  { id: "SP-09", ratio: "4:3 (crop 3:2)", ref: "SP-03", use: "Story / Events", alt: "the pantry shelves", prompt: `${REF("the walls, the wood and the candlelight")} Create a photograph of a pantry corner: rustic wooden shelves against the walls holding ${L.detail}. ${NOTEXT} A brass candle sconce casts warm light across the shelves. Eye level, straight-on, softly blurred background. No people. ${STYLE}` },
  { id: "SP-13", ratio: "16:9", ref: "SP-03", use: "Cellar page and the home scene's wine pick", alt: "the wine cellar", prompt: `${REF("the walls, the wood and the candlelight")} Create a wide photograph of the cellar: arched brick or stone walls, wooden racks of bottles lying on their sides with plain unlabeled necks, a small table with two glasses and a candle. Cool, quiet, low light. No people. ${NOTEXT} ${STYLE}` },
  { id: "SP-14", ratio: "16:9", ref: "SP-03", use: "Cellar pour scene", alt: "a pour of wine into a glass", prompt: `${REF("the table, the glassware and the candlelight")} Create a close photograph of ${L.drink} being poured into a simple glass on the table, the stream caught mid-pour, candle bokeh behind. Only the hand holding a plain unlabeled bottle at the edge of the frame, no face. ${NOTEXT} ${STYLE}` },
];
function cap(s) { return s[0].toUpperCase() + s.slice(1); }

// Dishes: one square photo per featured dish. The template's menu cards use keys d-01, d-02, ...
const dishes = intake.menu?.flatMap((s) => s.items.map((i) => ({ section: s.title, ...i }))).filter((i) => i.name).slice(0, 13) ?? [];
const dishBlock = dishes.map((d, n) => {
  const key = `D-${String(n + 1).padStart(2, "0")}`;
  return `### ${key} ${d.name} (${d.section})\n> Image 1 is the dining room; use it only for the table wood, plate style and candlelight. Create a new square 1:1 photograph of one serving of ${d.name}${d.description ? ` (${d.description})` : ""} on the plate from the reference, on the dark worn table, shot from a 45-degree angle, the dish filling most of the frame, the background softly blurred. Real, appetizing, not styled. No people, no hands. ${STYLE}\n- Alt text to start from: "${d.name}${d.description ? `: ${d.description}` : ""}, on a plate on a wooden table"`;
}).join("\n\n");

const md = `# Photo shot list: ${intake.name}

Generated by \`scripts/photo-kit.mjs\`. ${customized ? "Uses the \"look\" block in intake.json." : "**The prompts use the Trattoria demo's look** (a brick trattoria with five paper lanterns and a wood-fired oven). If this restaurant looks different, add a \"look\" block to intake.json (fields are listed at the top of scripts/photo-kit.mjs) and run this again, or edit the prompts below."}

## How to make them (the demo's whole set cost about \$2.86 on fal with Nano Banana 2, retries included; check current prices first)
1. **Make SP-03 first** (text-to-image, 16:9). Regenerate until the room is right: it is the reference for everything else, and a bad anchor spoils every photo. Fix details with a single-image edit ("Keep X exactly as it is. Change only Y.").
2. For each other shot use the **edit / reference endpoint** with SP-03 attached as "image 1" (SP-12 also attaches SP-05). One image per prompt, keep the winner, log it.
3. Reject and retry on: text or lettering anywhere, faces, wrong number of lights, six fingers, labels on bottles, a different-looking room.
4. Save the winning PNGs in \`clients/${slug}/assets/incoming/\` named like \`sp-03-dining-room.png\`, \`d-01-burrata.png\`, and add one row each to \`assets/image-log.md\` (ID, file, model, settings, references, cost, date, alt text).
5. Then: \`npm run images -- ${slug}\` (JPGs into public/${slug}/), \`node scripts/build-manifest.mjs ${slug}\` (writes images.json), \`npm run launch-check -- ${slug}\`.
6. Rewrite each alt text so it says what is really in the picture (the starting lines below are only guesses).

Keep the **PNG masters out of the repo** (\`assets/incoming\` is ignored). Only public/${slug}/ JPGs and images.json are committed.

## Scene photos

${shots.map((s) => `### ${s.id} (${s.ratio}; reference: ${s.ref})\nUsed on: ${s.use}\n\n> ${s.prompt}\n\n- Alt text to start from: "${s.alt}"`).join("\n\n")}

## Dish photos
Square 1:1, reference: SP-03 (and SP-05 for the plate). Attach the matching dish to its menu item in the admin, or after the photos exist run an update like \`update ${slug.replace(/-/g, "_")}.menu_items set photo = 'd-01' where id = '<dish id>';\`.

${dishBlock || "(No menu in intake.json yet.)"}
`;

mkdirSync(join(dir, "assets", "incoming"), { recursive: true });
writeFileSync(join(dir, "assets", "shot-list.md"), md);
const logPath = join(dir, "assets", "image-log.md");
if (!existsSync(logPath)) writeFileSync(logPath, `# Image log (${slug})\n\nOne line per keeper. Exact prompts: shot-list.md. build-manifest.mjs reads the ID, file and alt text.\n\n| ID | file | model | settings | seed | references | cost | date | alt text |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n`);
console.log(`Wrote clients/${slug}/assets/shot-list.md (${shots.length} scene shots, ${dishes.length} dishes) and image-log.md${customized ? "" : "\nNote: using the demo's look; add \"look\" to intake.json if this restaurant is different."}`);
