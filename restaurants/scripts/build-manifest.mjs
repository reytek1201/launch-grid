// Builds clients/demo/images.json from assets/image-log.md (alt text source) + the PNG masters.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const client = process.argv[2] ?? "demo";
const root = path.join("clients", client, "assets");
const log = fs.readFileSync(path.join(root, "image-log.md"), "utf8");
const out = {};
for (const line of log.split("\n")) {
  const cells = line.split("|").map((c) => c.trim());
  if (cells.length < 10 || !/^(SP|D)-/.test(cells[1])) continue;
  const id = cells[1];
  const file = cells[2].match(/incoming\/([^\s(]+\.png)/)[1];
  const alt = cells[cells.length - 2];
  const meta = await sharp(path.join(root, "incoming", file)).metadata();
  const slug = file.replace(/\.png$/, "");
  out[id.toLowerCase()] = { id, src: `/${client}/${slug}.jpg`, alt, width: meta.width, height: meta.height, focal: "50% 50%" };
}
fs.writeFileSync(path.join("clients", client, "images.json"), JSON.stringify(out, null, 2) + "\n");
console.log(Object.keys(out).length, "images");
