// PNG masters (kept out of the repo) -> progressive JPG copies in public/<client>/.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const client = process.argv[2] ?? "demo";
const dir = path.join("clients", client, "assets", "incoming");
const dest = path.join("public", client);
fs.mkdirSync(dest, { recursive: true });
const crop = /-(\d+x\d+)\.png$/;
let n = 0;
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".png") || crop.test(f)) continue; // masters only; the site crops with object-fit
  const img = sharp(path.join(dir, f));
  const { width } = await img.metadata();
  await img.resize({ width: Math.min(width, 1600) }).jpeg({ quality: 84, progressive: true, mozjpeg: true })
    .toFile(path.join(dest, f.replace(/\.png$/, ".jpg")));
  n++;
}
console.log(n, "images written to", dest);
