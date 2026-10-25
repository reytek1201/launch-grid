// Favicon set from one drawing: a waxing moon on espresso. Run: node scripts/build-icons.mjs
import fs from "node:fs";
import sharp from "sharp";

const moon = (rounded) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><mask id="m"><rect width="64" height="64" fill="black"/><circle cx="32" cy="32" r="19" fill="white"/><circle cx="41" cy="28" r="17" fill="black"/></mask></defs>
  <rect width="64" height="64" ${rounded ? 'rx="14"' : ""} fill="#2B1D14"/>
  <circle cx="32" cy="32" r="19" fill="none" stroke="#f2b27a" stroke-opacity="0.35" stroke-width="1.6"/>
  <rect width="64" height="64" fill="#f2b27a" mask="url(#m)"/>
</svg>`;

fs.writeFileSync("app/icon.svg", moon(true));
const png = (size, rounded = false) => sharp(Buffer.from(moon(rounded)), { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

fs.writeFileSync("app/apple-icon.png", await png(180));
fs.mkdirSync("public/icons", { recursive: true });
fs.writeFileSync("public/icons/icon-192.png", await png(192));
fs.writeFileSync("public/icons/icon-512.png", await png(512));

// favicon.ico: an ICO container holding one 32x32 PNG
const p32 = await png(32, true);
const head = Buffer.alloc(22);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);
head[6] = 32; head[7] = 32; head[8] = 0; head[9] = 0;
head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12);
head.writeUInt32LE(p32.length, 14); head.writeUInt32LE(22, 18);
fs.writeFileSync("app/favicon.ico", Buffer.concat([head, p32]));
console.log("icons written");
