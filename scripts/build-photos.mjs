// Turns the full-resolution originals in app/photos into web derivatives.
//
//   node scripts/build-photos.mjs           incremental — skips work already done
//   node scripts/build-photos.mjs --force   rebuild everything
//
// Writes AVIF + WebP at three widths into public/gallery/, plus
// app/data/photos.json holding each photo's real dimensions and a tiny inline
// blur placeholder so the strip never reflows while images load.

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { SOURCES, LEAD } from "./photo-map.js";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "app/photos");
const OUT = path.join(ROOT, "public/gallery");
const MANIFEST = path.join(ROOT, "app/data/photos.json");

const WIDTHS = [400, 800, 1600];

// AVIF carries the full ladder. WebP exists only for the handful of browsers
// without AVIF, so it stops at 800px — at 1600 it costs ~2.4x the AVIF for the
// same pixels, which is not worth committing for a fallback that rarely runs.
const FORMATS = [
  { fmt: "avif", opts: { quality: 45, effort: 5 }, max: 1600 },
  { fmt: "webp", opts: { quality: 70 }, max: 800 },
];

const FORCE = process.argv.includes("--force");

const slug = (dir, file) =>
  `${dir}-${file.replace(/\.[^.]+$/, "")}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");

// A 16px-wide WebP, inlined as a data URI. Cheap enough to sit in the manifest
// and gives every frame a colour to hold while the real file arrives.
async function blurPlaceholder(pipeline) {
  const buf = await pipeline
    .clone()
    .resize(16, 16, { fit: "inside" })
    .webp({ quality: 40, alphaQuality: 40 })
    .toBuffer();
  return `data:image/webp;base64,${buf.toString("base64")}`;
}

async function processOne(dir, file) {
  const id = slug(dir, file);
  const abs = path.join(SRC, dir, file);
  const base = sharp(abs).rotate(); // honour EXIF orientation before anything else
  const meta = await base.metadata();

  // .rotate() is lazy, so metadata() still reports pre-rotation dimensions.
  const turned = meta.orientation >= 5 && meta.orientation <= 8;
  const width = turned ? meta.height : meta.width;
  const height = turned ? meta.width : meta.height;

  const dest = path.join(OUT, id);
  fs.mkdirSync(dest, { recursive: true });

  const made = { avif: [], webp: [] };
  for (const { fmt, opts, max } of FORMATS) {
    for (const w of WIDTHS) {
      if (w > max) continue;
      if (w > width * 1.2 && made[fmt].length) continue; // never upscale past the original
      const out = path.join(dest, `${w}.${fmt}`);
      if (FORCE || !fs.existsSync(out)) {
        await base.clone().resize(w).toFormat(fmt, opts).toFile(out);
      }
      made[fmt].push(w);
    }
  }

  return {
    id,
    src: `/gallery/${id}`,
    avif: made.avif,
    webp: made.webp,
    w: width,
    h: height,
    blur: await blurPlaceholder(base),
  };
}

function collect(chapter) {
  const out = [];
  for (const { dir, only } of SOURCES[chapter]) {
    const abs = path.join(SRC, dir);
    if (!fs.existsSync(abs)) continue;
    const files = fs
      .readdirSync(abs)
      .filter((f) => /\.(jpe?g)$/i.test(f))
      .sort();
    for (const f of files) {
      if (only && !only.includes(f)) continue;
      out.push({ dir, file: f });
    }
  }

  // Float the chapter's lead photo to the front.
  const lead = LEAD[chapter];
  if (lead) {
    const i = out.findIndex(({ dir, file }) => `${dir}/${file}` === lead);
    if (i > 0) out.unshift(out.splice(i, 1)[0]);
  }
  return out;
}

const manifest = {};
let done = 0;
const total = Object.keys(SOURCES).reduce((n, c) => n + collect(c).length, 0);

for (const chapter of Object.keys(SOURCES)) {
  manifest[chapter] = [];
  for (const { dir, file } of collect(chapter)) {
    manifest[chapter].push(await processOne(dir, file));
    done++;
    process.stdout.write(`\r  ${String(done).padStart(3)}/${total}  ${chapter}          `);
  }
}

fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

const bytes = Number(
  (await import("node:child_process")).execSync(`du -sk ${OUT}`).toString().split(/\s+/)[0]
);
console.log(`\n\n  ${total} photos → ${OUT.replace(ROOT + "/", "")}  (${(bytes / 1024).toFixed(0)} MB)`);
for (const [c, items] of Object.entries(manifest)) console.log(`    ${c.padEnd(10)} ${items.length}`);
