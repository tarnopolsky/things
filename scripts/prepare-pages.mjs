// Post-processes build/client/ into something GitHub Pages can serve directly.
//
//   node scripts/prepare-pages.mjs      (run by `npm run deploy`, after the build)

import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import config from "../react-router.config.js";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "build/client");

// With a `basename` set, React Router prerenders to build/client/<basename>/index.html.
// GitHub Pages already mounts the branch root at that same path, so leaving the folder in
// place would serve the site from /things/things/. Flatten it back up one level.
const base = (config.basename ?? "/").replace(/^\/|\/$/g, "");
if (base) {
  const nested = path.join(OUT, base);
  if (fs.existsSync(nested)) {
    for (const entry of fs.readdirSync(nested)) {
      fs.renameSync(path.join(nested, entry), path.join(OUT, entry));
    }
    fs.rmdirSync(nested);
    console.log(`  flattened build/client/${base}/ → build/client/`);
  }
}

// Pages serves 404.html for any path it does not recognise; hand it the app instead of
// GitHub's default error page.
fs.copyFileSync(path.join(OUT, "index.html"), path.join(OUT, "404.html"));

for (const junk of [".DS_Store"]) {
  fs.rmSync(path.join(OUT, junk), { force: true });
}

console.log("  build/client ready for GitHub Pages");
