# "Things I've been up to" — page plan

A single personal page listing what I do outside work, with the photographs. Linked from my
résumé at tarnopolsky.github.io. Published to GitHub Pages at
**https://tarnopolsky.github.io/things/**.

Not a portfolio and not a blog — a list of hobbies with pictures, meant to be sendable to
new colleagues without reading as a boast.

## Tone

This is the constraint everything else follows from. The page went through a version that
read as show-offy, and fixing it was as much a layout problem as a wording one.

Deliberately absent:

- **Any framing of the page as a period of life.** It says nothing about why there is time
  for any of this. It is a list of things done, not an account of a stretch of time.
- **A thesis.** No pull-quote set in display type — a line set apart in large serif reads as
  a position being asserted rather than something shared. (A David Bowie line is kept in the
  data but commented out of the markup.)
- **Totals.** No "N sections · N photographs" counter; quantifying reads as portfolio. The
  per-row counts stay, because those are navigation.
- **Section numbers and the word "chapters".** Numbering hobbies is a book metaphor that
  lends them borrowed weight.
- **Display type above ~2.75rem, tracked-out caps, magazine-style two-column intros,
  em-dash subtitles.** Layout carries tone by itself: at 84px, a high-contrast serif turns
  modest text into a statement.

The author's name appears **nowhere on the page** — only in the tab title
("Natasha Tarnopolsky — Things I've been up to"). The page is signed, not announced.

## Structure

Heading, one line of intro, then the sections as a plain list. Everything starts collapsed,
so the page opens as an index of what is inside.

> By day I'm a developer. Outside of that, this is the fun stuff — some I've done forever,
> some I just started.

| # | Section | Photos | Notes |
| --- | --- | --- | --- |
| 1 | Pottery wheel | 24 | |
| 2 | Drawing | 21 | |
| 3 | Florals | 16 | |
| 4 | Houseplants | 9 | |
| 5 | Cooking & baking & eating | 14 | plus a recipe list |
| 6 | Tennis & Sports | 9 | |
| 7 | Moments | 50 | everyday photographs |
| 8 | Trips | 42 | five labelled runs, one per trip |
| 9 | Museums & galleries | 12 | |
| 10 | For sale | 2 | a notice, not a hobby — sits last, by the contacts |

199 photographs in total, from 192 originals.

**Trips** is the one section with several groups: Jerusalem at Hanukkah, Sakura, Almond
blossom, Poppies, Dead Sea — roughly in the order they happened. Each takes an optional
sentence; none are written yet, and nothing renders while one is empty.

Closing: an invitation to email (the address hides behind the words "email me") and a link
to the professional résumé, opening in a new tab.

## Behaviour

- Each section opens into one or more **horizontally scrolling film strips** — photographs at
  their true proportions, shared height, nothing cropped to fit a grid.
- Clicking a photograph opens a **full-screen lightbox** with a thumbnail rail along the
  bottom, so a 50-photo section can be browsed without scrolling sideways forever.
- The lightbox opens on a *group*, not a section: paging through Sakura never runs on into
  the Dead Sea.
- Opening a section **holds its heading still** while the accordion animates, rather than
  scrolling to it.
- A 50-photo strip is **one tab stop**, not fifty (roving tabindex).

## Design

Warm paper ground, Fraunces for headings, Figtree for body, JetBrains Mono for the small
counts. Dark mode follows the system setting. The favicon is a red Le Creuset-style teapot.

## Technical

- **Photo pipeline.** Full-resolution originals in `app/photos/` (609MB, gitignored) →
  `npm run photos` → AVIF + WebP at three widths plus an inline blur placeholder in
  `public/gallery/` (67MB, committed), with a manifest at `app/data/photos.json`.
- **Two hand-edited files.** `scripts/photo-map.js` maps folders to gallery groups;
  `app/data/chapters.js` holds every word on the page.
- **Static.** `ssr: false` + `prerender: true` — no Node server. `npm run deploy` builds and
  pushes to the `gh-pages` branch.
- **Subpath.** The site is served from `/things/`, so `base`, `basename` and the photo-path
  prefix in `chapters.js` all have to agree. Photo paths live in data, which Vite does not
  rewrite, so they are prefixed in code.

See [CLAUDE.md](CLAUDE.md) for the full pipeline, the deployment steps and the constraints
worth knowing before editing the gallery.

## Still open

- One sentence per trip in **Trips**.
- Notes against the recipes in **Cooking & baking & eating**.
- The **Museums & galleries** and **For sale** ledes are drafts, written from what is
  visibly in the photographs.
- **Moments** is where camera-collection photographs go when they exist — add the folder,
  one line in `SOURCES`, and a second group on that section.
