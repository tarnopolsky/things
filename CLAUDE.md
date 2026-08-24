# quite-recovery — "Things I've been up to"

A single personal page: ten sections of hobbies, each an accordion row that opens into one
or more horizontally-scrolling film strips of photographs, with a full-screen lightbox. Ends
with contact details and a link to a professional résumé at tarnopolsky.github.io.

The author's name appears **nowhere on the page itself** — only in the `<title>`
("Natasha Tarnopolsky — Things I've been up to"). The page is identified, not announced.

## Tone — read before touching the copy or the type

The page is meant to be sendable to new colleagues without reading as a flex. An earlier
version read as show-offy, and the fix was as much visual as textual. **Deliberately absent,
do not reintroduce:**

- Any framing of the page as a *period of life*. It says nothing about why there was time for
  any of this — no layoff, no pause, no "free time". It is a list of things made, not an
  account. The old title "A Conscious Pause" went for the same reason (*conscious* is
  wellness-brand vocabulary; it asserts a philosophy before saying anything).
- **A pull-quote.** There was a David Bowie line at the foot of the page; it is now hidden —
  the `<figure>` in `welcome.jsx` is commented out, and `intro.quote` / `intro.attribution`
  are kept in `chapters.js` but unused. If it is ever restored, keep it small, italic and
  muted with no rule down the side, and put `lg:grid-cols-2` back on the `<footer>`. At
  display size a quote stops being something shared and becomes a thesis being asserted.
- **A total photo count** ("15 chapters · 191 photographs"). Quantifying reads as portfolio.
  The per-row counts stay — those are navigation.
- **Section numbers** (01–15) and the word *chapters* in the UI. Numbering hobbies is a book
  metaphor that lends them borrowed weight.
- **Display type above ~2.75rem, tracked-out caps, magazine-style two-column intros, and
  em-dash subtitles** in section names. Layout carries tone on its own: at 84px, Fraunces
  turns modest text into a statement. The typeface is fine; the size was not.

The section prose in `app/data/chapters.js` is transcribed verbatim from
[content.md](content.md) and [plan.md](plan.md). The intro and closing are the exceptions —
both were rewritten for the reasons above and deliberately no longer match content.md.

## The photo pipeline

```
app/photos/            originals · ~588MB · gitignored · the source of truth
      ↓  npm run photos          (scripts/photo-map.js + scripts/build-photos.mjs)
public/gallery/        derivatives · ~67MB · committed
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

- **one group** → a single unlabelled strip. Most sections are this.
- **several** → each strip gets a mono label, its own count and its own optional prose.
  **Trips** is the live example: one section holding five labelled runs, one per trip.
- **none** → a quiet, text-only section. None exist right now (Pilates and Silent
  retreat were removed), but the rendering path is kept.

The lightbox opens on a *group*, not a section, so paging through Sakura never runs on into
the Dead Sea. Folders map 1:1 to groups — the old hand-maintained filename lists that split
`make/` in code are gone, because the photos are sorted on disk now.

A section's `lede` is optional; one without it opens straight to its photographs.

**Everything starts closed** — `useState("")` in `welcome.jsx`, so the page opens as a plain
list of what is inside. One consequence: Radix unmounts closed panels, so the prerendered
`index.html` contains the section *titles* and peek thumbnails but none of the prose,
galleries or contact links. Fine for readers; worth knowing if search engines ever matter.

### Commands

| | |
| --- | --- |
| `npm run photos` | build derivatives. **Incremental** — only encodes files that don't exist yet |
| `npm run photos -- --force` | re-encode everything, e.g. after changing quality settings |
| `rm -rf public/gallery && npm run photos` | clean rebuild — **the only way to prune** |

There is no prune step: deleting an original leaves its derivatives orphaned in
`public/gallery`, and `--force` re-encodes without removing them.

Section order comes from array position in `chapters.js` — reordering is just moving an entry.
(Sections are numbered nowhere in the UI on purpose; see the tone note at the top.)

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
- **The five Trips groups have no `text`** — one sentence per place is what plan.md always
  intended. Nothing renders while it is absent, so blank looks deliberate rather than missing.
  content.md's "Day trips whenever the walls felt too close…" paragraph is unused but still
  in content.md if you want it back.
- **Museums & galleries** and **For sale** ledes are marked `draft: true`. Both describe only
  what is visibly in the photos, since content.md covers neither. For sale in particular is
  deliberately generic — the folder holds a boxed waste disposer, a teapot and a variegated
  monstera, not a line of pottery, and `IMG_3486` looks like a shop display with a price tag.
- **Moments** is the `moments` folder but its prose is about collecting cameras — the section
  was renamed after the text was written. Camera photographs are still to come: add a folder,
  one line in `SOURCES`, and a second group on that section.

## What is committed, and why

Committed: `public/gallery/` (~67MB) and `app/data/photos.json`.
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
- **Do not use `scrollIntoView` to bring an opened chapter into view.** It fixes its target
  scroll position at call time, but opening one chapter collapses another, so hundreds of
  pixels can disappear from above the target while the scroll is still running — it then
  sails past and lands mid-gallery with the heading off-screen. `onValueChange` in
  `welcome.jsx` instead re-measures the heading every frame for 320ms and corrects, which
  cannot drift because it predicts nothing.
