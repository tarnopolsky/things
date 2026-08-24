# quite-recovery — "A Conscious Pause"

A single-page personal photo essay covering January 2026 onward. Fifteen chapters, each an
accordion row that opens into one or more horizontally-scrolling film strips of photographs,
with a full-screen lightbox. Links back to a résumé at tarnopolsky.github.io.

Source copy lives in [content.md](content.md) and [plan.md](plan.md) at the repo root, and
the chapter prose in `app/data/chapters.js` is transcribed from them verbatim. **The intro is
the exception** — it was rewritten to read as private rather than self-promoting (the page is
meant to be sendable to new colleagues), so it deliberately no longer matches content.md's
opening. The pull-quote is a line from the film *Soul* (2020), replacing content.md's
"financial cushion" line for the same reason.

## The photo pipeline

```
app/photos/            originals · ~588MB · gitignored · the source of truth
      ↓  npm run photos          (scripts/photo-map.js + scripts/build-photos.mjs)
public/gallery/        derivatives · ~65MB · committed
app/data/photos.json   generated manifest: dimensions + inline blur placeholder · committed
      ↓
app/data/chapters.js → app/welcome/welcome.jsx → app/components/gallery/*
```

### Hand-edited vs generated

Two files decide what appears where. Everything else is generated or presentational.

| File | Decides |
| --- | --- |
| `scripts/photo-map.js` | which folder feeds which **group**; `LEAD` picks the opening photo |
| `app/data/chapters.js` | the chapters — title, prose, order, groups, recipes, alt text; also the intro and closing copy |

**`app/data/photos.json` is generated. Never hand-edit it** — run `npm run photos`.

### Groups

A chapter holds a `groups` array, so one shape covers every case:

- **one group** → a single unlabelled strip. Every chapter is currently this.
- **several** → each strip gets a mono label, its own count and its own prose.
- **none** → a quiet, text-only chapter (Pilates, Silent retreat)

The multi-group path is unexercised right now — pottery/drawing/florals and the five trips
were each promoted to their own chapter — but it is kept deliberately, because Capture is due
a second group when the camera-collection photographs arrive. Deleting it would just mean
writing it again.

The lightbox opens on a *group*, not a chapter, so a chapter with several strips never pages
from one into the next. Folders map 1:1 to groups — the old hand-maintained filename lists
that split `make/` in code are gone, because the photos are sorted on disk now.

A chapter's `lede` is optional: the trip chapters have none and open straight to their
photographs.

### Commands

| | |
| --- | --- |
| `npm run photos` | build derivatives. **Incremental** — only encodes files that don't exist yet |
| `npm run photos -- --force` | re-encode everything, e.g. after changing quality settings |
| `rm -rf public/gallery && npm run photos` | clean rebuild — **the only way to prune** |

There is no prune step: deleting an original leaves its derivatives orphaned in
`public/gallery`, and `--force` re-encodes without removing them.

Chapter numbers (`01`–`15`) derive from array position in `chapters.js`, so reordering
renumbers automatically.

### Common tasks

| Want to | Edit | Then |
| --- | --- | --- |
| move a photo between groups | move the file between folders in `app/photos/` | `npm run photos` |
| change a group's opening photo | `LEAD` in `photo-map.js` | `npm run photos` |
| add photos | drop them into a folder under `app/photos/` | `npm run photos` |
| reorder, rename or rewrite chapters | `chapters.js` | nothing — not generated |
| edit the intro, closing or a recipe note | `chapters.js` | nothing |
| add a group or chapter with a new folder | `SOURCES` in `photo-map.js` **and** an entry in `chapters.js` | `npm run photos` |

### Open placeholders

Deliberately unfinished, awaiting the user's words — none of it is broken:

- Six of the seven **recipe notes** (everything but the rye sourdough) render as a muted `—`.
- **The five trip chapters have no `lede`** — one sentence per place is what plan.md always
  intended. Nothing renders while it is absent, so blank looks deliberate rather than missing.
  content.md's "Day trips whenever the walls felt too close…" paragraph was retired when the
  trips became separate chapters; it is still in content.md if you want it back.
- The **Museums & galleries** lede is marked `draft: true` — it describes only what is
  visibly in the photos, since content.md has no section for them.
- plan.md's "Three things I made with my own hands" line went with the old **Make** chapter
  when pottery, drawing and florals were split apart.
- **Capture** currently shows the `moments` folder. Camera-collection photos are still to
  come: add the folder, one line in `SOURCES`, and a second group on that chapter.

## What is committed, and why

Committed: `public/gallery/` (~65MB) and `app/data/photos.json`.
Ignored: `app/photos/` (~588MB of originals), `build/`, `node_modules/`.

Derivatives are committed deliberately — it keeps image processing and `sharp` (a heavy
native binary) out of the deploy build, and lets the site go to any static host. The cost is
that git history grows every time everything is re-encoded.

## The derivative ladder

Per photo: `400/800/1600.avif` plus `400/800.webp`.

AVIF is the real ladder (~95% browser support). WebP exists only as the `<img src>` fallback
for browsers without AVIF, and stops at 800 because a 1600px WebP costs roughly 2.4x the
equivalent AVIF for the same pixels — not worth committing for a path that rarely runs.

Known inefficiency: the accordion peek thumbs (36px tall) and the lightbox rail (48px) both
hardcode `400.webp` at ~29KB each. A 128px tier would cut first-paint thumbnail weight from
~0.7MB to ~0.14MB and let `400.webp` be dropped.

## Deployment

`react-router.config.js` sets `ssr: false` + `prerender: true`, so `npm run build` emits
fully static HTML into `build/client/`. Deploy that folder to any static host or CDN. There
is no Node server — `npm start` is only a local preview of the built output.

This is safe because the app has no `loader`, `action` or `headers` exports, which are the
exports `ssr: false` prohibits. Adding any of them means reverting to `ssr: true` and a Node
runtime.

## Design notes

The warm-paper palette is defined as CSS tokens at the end of `app/app.css`. The gallery
reads `bg-background` / `text-foreground` / `border-border` only and never `dark:`
utilities — that is why dark mode works from one `prefers-color-scheme` block redefining
those tokens. Type is Fraunces (display, Google Fonts), Figtree (body, local), JetBrains
Mono (metadata, local).

Two constraints worth knowing before editing the gallery:

- `AccordionContent` must keep `overflow-hidden` for its collapse animation, so the film
  strip cannot bleed outside the text column; the edge-fade mask conveys continuation.
- Its inner div must **not** carry a fixed `h-(--radix-accordion-content-height)`. That value
  is measured once, so pinning it clips content that grows afterwards — exactly what a
  gallery does as images decode.
- The strip uses a roving tabindex, so a 50-photo strip is one tab stop rather than 50.
