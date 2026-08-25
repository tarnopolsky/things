// Generates every favicon from one SVG source.
//
//   node scripts/build-icons.mjs
//
// Only needs re-running if the mark itself changes. Writes into public/, so the results
// are committed like any other static asset.

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const PAPER = "#FBFAF5";

// Le Creuset "Flame" — orange at the top falling to red at the base. The gradient is doing
// real work at small sizes: a flat fill collapses into a single blob, the tonal shift keeps
// the lid, body and handle readable.
const MARK = `<defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#F47B20"/>
    <stop offset="0.55" stop-color="#E8471A"/>
    <stop offset="1" stop-color="#C81E12"/>
  </linearGradient></defs>
  <path d="M17 40 C10 37 4 31 3 24 L9 21 C11 28 16 33 22 36 Z" fill="url(#f)"/>
  <path d="M44 28 C56 28 60 34 60 40 C60 47 54 51 47 51 L47 45 C51 45 54 43 54 40 C54 36 51 34 44 34 Z" fill="url(#f)"/>
  <ellipse cx="32" cy="41" rx="20" ry="17" fill="url(#f)"/>
  <ellipse cx="32" cy="25" rx="12" ry="5" fill="url(#f)"/>
  <path d="M29 22 C29 18 35 18 35 22 Z" fill="url(#f)"/>
  <ellipse cx="32" cy="18" rx="4.5" ry="2.6" fill="url(#f)"/>`;

const transparent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${MARK}</svg>`;
// iOS ignores transparency and composites onto black, so the touch icon gets the paper
// background the rest of the site uses.
const onPaper = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${PAPER}"/>${MARK}</svg>`;

fs.writeFileSync(path.join(PUBLIC, "favicon.svg"), transparent);

const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

await sharp(Buffer.from(onPaper)).resize(180, 180).png().toFile(path.join(PUBLIC, "apple-touch-icon.png"));
await sharp(Buffer.from(transparent)).resize(32, 32).png().toFile(path.join(PUBLIC, "favicon-32.png"));

// Hand-rolled .ico so no extra dependency is needed: the format is just a small header
// followed by PNG payloads. Browsers still request /favicon.ico unprompted.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((s) => png(transparent, s)));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(sizes.length, 4);

let offset = 6 + sizes.length * 16;
const entries = sizes.map((size, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(size === 256 ? 0 : size, 0);
  e.writeUInt8(size === 256 ? 0 : size, 1);
  e.writeUInt8(0, 2); // palette
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // colour planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(images[i].length, 8);
  e.writeUInt32LE(offset, 12);
  offset += images[i].length;
  return e;
});
fs.writeFileSync(path.join(PUBLIC, "favicon.ico"), Buffer.concat([header, ...entries, ...images]));

for (const f of ["favicon.svg", "favicon.ico", "favicon-32.png", "apple-touch-icon.png"]) {
  console.log(`  ${f.padEnd(22)} ${(fs.statSync(path.join(PUBLIC, f)).size / 1024).toFixed(1)} KB`);
}
