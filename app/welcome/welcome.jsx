import { useCallback, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FilmStrip } from "@/components/gallery/film-strip";
import { Lightbox } from "@/components/gallery/lightbox";
import { chapters, closing, intro, peek } from "@/data/chapters";
import { cn } from "@/lib/utils";

// Prose sits in a narrow measure; photographs run the full width beneath it.
const MEASURE = "max-w-[46ch]";

export function Welcome() {
  // Everything starts closed: the page opens as a plain list of what is inside.
  const [open, setOpen] = useState("");
  const [view, setView] = useState(null);
  const headers = useRef({});

  const viewedChapter = view && chapters.find((c) => c.id === view.chapterId);
  const viewedGroup = viewedChapter?.groups.find(
    (g) => g.key === view.groupKey,
  );

  // Hold the clicked chapter's heading still while the accordion animates.
  //
  // scrollIntoView is unusable here: it locks its target scroll position at call
  // time, but opening one chapter collapses another, so hundreds of pixels can
  // vanish from above the target mid-flight and the scroll sails straight past it.
  // Instead, re-measure every frame and correct — the anchor cannot drift because
  // nothing is predicted. A heading already in a comfortable spot stays exactly
  // where it was clicked; one that is off-screen or too low eases up to REST.
  const onValueChange = useCallback(
    (value) => {
      const el = headers.current[value || open];
      const from = el?.getBoundingClientRect().top ?? 0;
      setOpen(value);
      if (!el) return;

      const REST = 88;
      const settled = from >= REST && from <= window.innerHeight * 0.4;
      // Closing a chapter never needs the heading to move.
      const to = !value || settled ? from : REST;

      const DURATION = 320; // comfortably past the 200ms accordion animation
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      const started = performance.now();
      let cancelled = false;

      // Never fight a reader who takes over mid-flight.
      const stop = () => (cancelled = true);
      const opts = { passive: true };
      for (const e of ["wheel", "touchstart", "keydown"])
        addEventListener(e, stop, opts);

      const clamp = (y) =>
        Math.min(Math.max(0, document.documentElement.scrollHeight - innerHeight), Math.max(0, y));

      // iOS only — Android handles the per-frame version fine, and this path costs a
      // visible pause before the page moves, so it is not worth applying there. Every
      // scrollTo interrupts WebKit's own scrolling, and ~30 of them in 320ms stutters
      // badly, worst on a section near the bottom where it also fights rubber-banding.
      // One native smooth scroll after the accordion settles cannot overshoot either,
      // because the layout has stopped changing by then.
      //
      // UA sniffing rather than feature detection: this is a specific platform quirk with
      // nothing to feature-detect. iPadOS reports itself as MacIntel, hence the touch check.
      const iOS =
        /iP(hone|ad|od)/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

      if (iOS) {
        // `stop` above already flips `cancelled` on touchstart, so a reader who starts
        // scrolling before the timer fires is left alone.
        setTimeout(() => {
          if (!cancelled) {
            const next = clamp(scrollY + el.getBoundingClientRect().top - to);
            if (Math.abs(next - scrollY) > 1) {
              scrollTo({ top: next, behavior: reduced ? "auto" : "smooth" });
            }
          }
          cleanup();
        }, 240); // past the 200ms accordion animation
        return;
      }

      const EPSILON = 1.5;
      let settledFrames = 0;

      const step = (now) => {
        if (cancelled) return cleanup();
        const t = Math.min(1, (now - started) / DURATION);
        const want = reduced ? to : from + (to - from) * ease(t);
        const drift = el.getBoundingClientRect().top - want;

        // Clamp into the document: a section near the bottom may not have enough page
        // left to reach REST, and pushing past the end achieves nothing.
        const next = clamp(scrollY + drift);

        if (Math.abs(next - scrollY) > EPSILON) {
          scrollTo(0, next);
          settledFrames = 0;
        } else if (++settledFrames > 3 && t >= 1) {
          return cleanup();
        }
        t < 1 || settledFrames <= 3 ? requestAnimationFrame(step) : cleanup();
      };
      const cleanup = () => {
        for (const e of ["wheel", "touchstart", "keydown"])
          removeEventListener(e, stop, opts);
      };
      requestAnimationFrame(step);
    },
    [open],
  );

  return (
    <main className="mx-auto w-full max-w-[78rem] px-6 pb-24 sm:px-10">
      {/* Kept deliberately quiet: no pull-quote, no photo count, no tracked-out caps.
          Those read as a statement being made rather than a page being signed. */}
      <header className="border-b border-border py-16 sm:py-20">
        <h1 className="font-display text-[clamp(1.875rem,4vw,2.75rem)] leading-[1.1] font-light -tracking-[0.01em]">
          {intro.title}
        </h1>
        <div className="mt-8 max-w-[58ch] space-y-4 text-[1.0625rem] leading-relaxed text-muted-foreground">
          {intro.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </header>

      <Accordion
        type="single"
        collapsible
        value={open}
        onValueChange={onValueChange}
      >
        {chapters.map((chapter) => {
          const hasPhotos = chapter.count > 0;
          const labelled = chapter.groups.length > 1;

          return (
            <AccordionItem
              key={chapter.id}
              value={chapter.id}
              className="scroll-mt-4 border-b border-border not-last:border-b"
            >
              <div ref={(n) => (headers.current[chapter.id] = n)} />
              <AccordionTrigger
                className={cn(
                  "items-center gap-5 rounded-none py-7 text-base font-normal hover:no-underline sm:gap-8 sm:py-9",
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                )}
                indicator={
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative size-3 shrink-0 self-center text-muted-foreground transition-colors duration-300 group-hover/accordion-trigger:text-foreground",
                      // Only one element in the row may claim the free space, or
                      // flexbox splits it and the count drifts into mid-row.
                      hasPhotos ? "ml-8" : "ml-auto",
                    )}
                  >
                    <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
                    <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current transition-transform duration-300 ease-out group-aria-expanded/accordion-trigger:scale-y-0 motion-reduce:transition-none" />
                  </span>
                }
              >
                <span
                  className={cn(
                    "font-display text-[clamp(1.25rem,2.4vw,1.625rem)] leading-tight font-light -tracking-[0.01em]",
                    "transition-opacity duration-300",
                    !hasPhotos && "text-muted-foreground",
                  )}
                >
                  {chapter.title}
                </span>

                {hasPhotos && (
                  <span className="ml-auto flex items-center gap-5">
                    {/* A glance at what is inside, folded away once it opens. */}
                    <span
                      aria-hidden="true"
                      className="hidden gap-1.5 opacity-70 transition-all duration-500 group-hover/accordion-trigger:opacity-100 group-aria-expanded/accordion-trigger:pointer-events-none group-aria-expanded/accordion-trigger:translate-x-2 group-aria-expanded/accordion-trigger:opacity-0 md:flex"
                    >
                      {peek(chapter).map((p) => (
                        <img
                          key={p.id}
                          src={`${p.src}/400.webp`}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          width={p.w}
                          height={p.h}
                          className="h-9 w-auto rounded-[2px] object-cover"
                          style={{ aspectRatio: `${p.w} / ${p.h}` }}
                        />
                      ))}
                    </span>
                    <span className="font-mono text-[0.6875rem] tabular-nums text-muted-foreground/70">
                      {String(chapter.count).padStart(2, "0")}
                    </span>
                  </span>
                )}
              </AccordionTrigger>

              <AccordionContent className="pb-14">
                {/* A trip chapter has no lede yet and opens straight to its photographs. */}
                {chapter.lede && (
                  <div className={cn(MEASURE, hasPhotos ? "pb-10" : "pb-4")}>
                    <p
                      className={cn(
                        "leading-relaxed text-balance",
                        hasPhotos
                          ? "text-[1.0625rem] text-muted-foreground"
                          : "font-display text-[1.375rem] leading-[1.5] font-light text-foreground/85",
                      )}
                    >
                      {chapter.lede}
                    </p>

                    {/* A link with no href yet is dropped rather than rendered, so a
                        half-filled contact never reaches the page. */}
                    {chapter.links?.some((l) => l.href) && (
                      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.9375rem]">
                        {chapter.links
                          .filter((l) => l.href)
                          .map((l) => (
                            <li key={l.label}>
                              <a
                                href={l.href}
                                target="_blank"
                                rel="noreferrer"
                                className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground"
                              >
                                {l.label}
                              </a>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* The strip stays inside the column: AccordionContent needs
                    overflow-hidden for its collapse animation, so a negative-margin
                    breakout would just be clipped. The edge fade carries the
                    sense of the run continuing instead. */}
                <div
                  className={cn(
                    "[--gutter:0px] space-y-14",
                    !chapter.lede && "pt-2",
                  )}
                >
                  {chapter.groups.map((group) => (
                    <section key={group.key}>
                      {labelled && (
                        <div
                          className={cn(
                            "mb-5 flex items-baseline gap-4",
                            MEASURE,
                            "max-w-none",
                          )}
                        >
                          <h3 className="font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
                            {group.label}
                          </h3>
                          <span
                            aria-hidden="true"
                            className="h-px flex-1 bg-border"
                          />
                          <span className="font-mono text-[0.6875rem] tabular-nums text-muted-foreground/70">
                            {String(group.photos.length).padStart(2, "0")}
                          </span>
                        </div>
                      )}

                      {group.text && (
                        <p
                          className={cn(
                            MEASURE,
                            "mb-8 text-[1.0625rem] leading-relaxed text-muted-foreground text-balance",
                          )}
                        >
                          {group.text}
                        </p>
                      )}

                      <FilmStrip
                        photos={group.photos}
                        alt={group.alt}
                        label={
                          group.label
                            ? `${chapter.title} — ${group.label}`
                            : chapter.title
                        }
                        onOpen={(index) =>
                          setView({
                            chapterId: chapter.id,
                            groupKey: group.key,
                            index,
                          })
                        }
                      />
                    </section>
                  ))}
                </div>

                {chapter.recipes && (
                  <div className={cn(MEASURE, "mt-14 max-w-[58ch]")}>
                    <h3 className="font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
                      What actually worked
                    </h3>
                    <dl className="mt-5 divide-y divide-border border-t border-border">
                      {chapter.recipes.map(({ dish, note }) => (
                        <div
                          key={dish}
                          className="flex flex-wrap gap-x-6 gap-y-1 py-3"
                        >
                          <dt className="min-w-[14ch] flex-1 text-[0.9375rem]">
                            {dish}
                          </dt>
                          <dd
                            className={cn(
                              "flex-[2] text-[0.9375rem] text-muted-foreground",
                              !note && "opacity-45",
                            )}
                          >
                            {note ?? "coming soon…"}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Contacts sit on the page's left edge with everything else. The second column is
          the Bowie quote, currently hidden — see the commented-out <figure> below. Restore
          `lg:grid-cols-2` at the same time if you bring it back. */}
      <footer className="grid gap-x-16 gap-y-10 pt-20">
        <div>
          {/* Skipped entirely while the address is empty — an invitation to email with no
              address to email is worse than no invitation. */}
          {closing.email && (
            <p className="mb-8 text-[1.0625rem] leading-relaxed text-muted-foreground">
              {closing.invitation}{" "}
              <a
                href={`mailto:${closing.email}`}
                className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground"
              >
                {closing.emailLabel}
              </a>
              .
            </p>
          )}

          <p>
            {/* Inline, not inline-flex: as a flex item the arrow stops flowing with
              the text and lands mid-line as soon as the label wraps. */}
            <a
              href={closing.link.href}
              target="_blank"
              rel="noreferrer"
              className="group/link text-[1.0625rem] text-foreground underline-offset-[6px] hover:underline"
            >
              {closing.link.label}
              <span
                aria-hidden="true"
                className="ml-2 inline-block transition-transform duration-300 ease-out group-hover/link:translate-x-1 motion-reduce:transition-none"
              >
                →
              </span>
            </a>
          </p>
        </div>

        {/* HIDDEN — the David Bowie quote. Kept, not deleted: uncomment this block and put
            `lg:grid-cols-2` back on the <footer> above to restore it. The text itself still
            lives in `intro.quote` / `intro.attribution` in app/data/chapters.js.

            Small on purpose. At display size, with a rule down the side, a quote stops
            being something shared and becomes a thesis being asserted.

        <figure className="max-w-[36ch] lg:pt-1">
          <blockquote className="text-[0.9375rem] leading-relaxed text-muted-foreground italic">
            “{intro.quote}”
          </blockquote>
          <figcaption className="mt-2 text-[0.8125rem] text-muted-foreground/70">
            {intro.attribution}
          </figcaption>
        </figure>
        */}
      </footer>

      <Lightbox
        photos={viewedGroup?.photos ?? []}
        title={
          viewedGroup?.label
            ? `${viewedChapter.title} — ${viewedGroup.label}`
            : viewedChapter?.title
        }
        alt={viewedGroup?.alt}
        index={viewedGroup ? view.index : null}
        onIndex={(index) => setView((v) => ({ ...v, index }))}
        onClose={() => setView(null)}
      />
    </main>
  );
}
