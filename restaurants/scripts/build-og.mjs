// Share images (1200x630) for each page: photo, dark fade, title and a line.
// Writes app/<route>/opengraph-image.jpg, which Next picks up as that page's og:image.
// Run: node scripts/build-og.mjs   (uses the optimized JPGs in public/demo/)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const W = 1200, H = 630;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const PAGES = [
  { route: "menu", file: "d-03-tagliatelle-ragu", title: "The Menu", line: "Handmade pasta, wood-fired mains, real dolci.", pos: "50% 50%" },
  { route: "cellar", file: "sp-13-cellar", title: "The Wine Cellar", line: "Italian bottles, by the glass and the bottle.", pos: "50% 50%" },
  { route: "visit", file: "sp-01-exterior-dusk", title: "Hours & Location", line: "Look for the olive-green door.", pos: "50% 40%" },
  { route: "gallery", file: "sp-11-five-lanterns", title: "Gallery", line: "A walk along the clothesline.", pos: "50% 50%" },
  { route: "contact", file: "sp-08-window-booth", title: "Send us a postcard", line: "Reservations, parties, questions, hellos.", pos: "50% 55%" },
  { route: "reserve", file: "sp-03b-dining-room-evening", title: "Reserve a table", line: "Pick a night. We will save you a seat.", pos: "50% 50%" },
  { route: "events", file: "sp-03-dining-room", title: "Private events", line: "A long table, a hot oven, a menu for your night.", pos: "50% 50%" },
  { route: "story", file: "sp-06-hands-pasta", title: "Our story", line: "Five generations, one Sunday sauce.", pos: "50% 42%" },
];

for (const p of PAGES) {
  const src = path.join("public", "demo", `${p.file}.jpg`);
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.38" stop-color="#140b07" stop-opacity="0"/><stop offset="1" stop-color="#140b07" stop-opacity="0.94"/></linearGradient></defs>
    <linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140b07" stop-opacity="0.65"/><stop offset="0.3" stop-color="#140b07" stop-opacity="0"/></linearGradient>
    <rect width="${W}" height="${H}" fill="url(#t)"/>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <text x="60" y="108" font-family="DejaVu Serif, serif" font-size="26" letter-spacing="7" fill="#F6EEDD" opacity="0.9">TRATTORIA CINQUE LUNE</text>
    <text x="60" y="508" font-family="DejaVu Serif, serif" font-weight="bold" font-size="78" fill="#F6EEDD">${esc(p.title)}</text>
    <text x="62" y="560" font-family="DejaVu Serif, serif" font-style="italic" font-size="31" fill="#f2b27a">${esc(p.line)}</text>
    <text x="62" y="602" font-family="DejaVu Sans, sans-serif" font-size="21" fill="#F6EEDD" opacity="0.85">Demo restaurant, not a real business. Images are AI-generated.</text>
  </svg>`);
  const out = path.join("app", p.route, "opengraph-image.jpg");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  // "cover" crop that follows the focal point
  const [fx, fy] = p.pos.split(" ").map((v) => parseFloat(v) / 100);
  const meta = await sharp(src).metadata();
  const scale = Math.max(W / meta.width, H / meta.height);
  const rw = Math.round(meta.width * scale), rh = Math.round(meta.height * scale);
  const left = Math.min(rw - W, Math.max(0, Math.round(fx * rw - W / 2)));
  const top = Math.min(rh - H, Math.max(0, Math.round(fy * rh - H / 2)));
  await sharp(src).resize(rw, rh).extract({ left, top, width: W, height: H })
    .composite([{ input: svg }]).jpeg({ quality: 82, progressive: true, mozjpeg: true }).toFile(out);
  console.log("wrote", out);
}
