# A Conscious Pause

A personal photo essay — fifteen chapters covering January 2026 onward, each opening into film
strips of photographs with a full-screen viewer. Built with React Router, Tailwind and Radix,
deployed as static files.

The chapter copy is transcribed from [content.md](content.md) and [plan.md](plan.md). The
intro is the exception — it was rewritten to read as private rather than self-promoting, so
it no longer matches content.md's opening.

## Getting started

```bash
npm install
npm run photos   # build web derivatives from app/photos/ (first run takes a few minutes)
npm run dev
```

The site runs at `http://localhost:5173`.

`npm run photos` is incremental, so later runs only encode photos that are new. You only
need it after adding, removing or re-filing photographs.

## Adding or rearranging photographs

Two files control everything:

- **`scripts/photo-map.js`** — which folder feeds which gallery group, and which photo opens it.
- **`app/data/chapters.js`** — the chapters themselves: title, prose, order, groups, recipes,
  plus the intro and closing copy.

Add photos by dropping them into a folder under `app/photos/` and running `npm run photos`;
move a photo between groups by moving the file. Reorder or rewrite chapters by editing the
array in `chapters.js` — chapter numbers follow array position, so they renumber themselves.

See [CLAUDE.md](CLAUDE.md) for the full pipeline, including how to prune deleted photos.

## Building for production

```bash
npm run build   # emits fully static HTML to build/client/
npm start       # preview that build locally
```

The site is prerendered — `build/client/` is plain HTML, CSS, JS and images with no Node
server behind it. Deploy that folder to Netlify, Cloudflare Pages, GitHub Pages, S3, or any
static host.

Note that `app/photos/` (the full-resolution originals) is gitignored, while the generated
`public/gallery/` derivatives are committed — so a fresh clone can build and deploy without
the originals, but needs them to regenerate anything.
