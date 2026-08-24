import { useCallback, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FilmStrip } from "@/components/gallery/film-strip";
import { Lightbox } from "@/components/gallery/lightbox";
import { chapters, closing, intro, peek, totalPhotos } from "@/data/chapters";
import { cn } from "@/lib/utils";

// Prose sits in a narrow measure indented to the chapter title; photographs run
// the full width of the column beneath it.
const MEASURE = "max-w-[46ch] sm:pl-[3.25rem]";

export function Welcome() {
  const [open, setOpen] = useState(chapters[0].id);
  const [view, setView] = useState(null);
  const headers = useRef({});

  const viewedChapter = view && chapters.find((c) => c.id === view.chapterId);
  const viewedGroup = viewedChapter?.groups.find((g) => g.key === view.groupKey);

  // Opening a tall chapter can leave its own heading somewhere off-screen, so
  // bring it back to the top of the page — but only when it has actually drifted.
  const onValueChange = useCallback((value) => {
    setOpen(value);
    if (!value) return;
    requestAnimationFrame(() => {
      const el = headers.current[value];
      if (!el) return;
      const { top } = el.getBoundingClientRect();
      if (top < 0 || top > window.innerHeight * 0.4) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }, []);

  return (
    <main className="mx-auto w-full max-w-[78rem] px-6 pb-24 sm:px-10">
      <header className="border-b border-border py-20 sm:py-28">
        <p className="font-mono text-[0.6875rem] tracking-[0.22em] text-muted-foreground uppercase">
          {intro.eyebrow}
        </p>
        <h1 className="mt-7 font-display text-[clamp(2.75rem,8vw,5.25rem)] leading-[0.95] font-light -tracking-[0.02em]">
          {intro.title}
        </h1>

        {/* Two columns so the intro spans the header rather than hugging the left:
            the opening line runs large as a standfirst, the rest sits beside it. */}
        <div className="mt-12 grid gap-x-14 gap-y-8 lg:grid-cols-[1.15fr_1fr]">
          <p className="font-display text-[clamp(1.375rem,2.2vw,1.75rem)] leading-[1.45] font-light text-foreground/85 text-balance">
            {intro.paragraphs[0]}
          </p>
          <div className="space-y-5 text-[1.0625rem] leading-relaxed text-muted-foreground">
            {intro.paragraphs.slice(1).map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>

        <blockquote className="mt-14 max-w-[46ch] border-l border-foreground/25 pl-6">
          <p className="font-display text-[1.375rem] leading-[1.5] font-light text-foreground/85 text-balance">
            {intro.quote}
          </p>
          <footer className="mt-3 font-mono text-[0.6875rem] tracking-wider text-muted-foreground">
            — <cite className="not-italic">{intro.attribution}</cite>
          </footer>
        </blockquote>

        <p className="mt-12 font-mono text-[0.6875rem] tracking-wider text-muted-foreground/80 tabular-nums">
          {chapters.length} chapters
          <span className="mx-2 opacity-40">·</span>
          {totalPhotos} photographs
        </p>
      </header>

      <Accordion type="single" collapsible value={open} onValueChange={onValueChange}>
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
                  "focus-visible:ring-0 focus-visible:ring-offset-0"
                )}
                indicator={
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative size-3 shrink-0 self-center text-muted-foreground transition-colors duration-300 group-hover/accordion-trigger:text-foreground",
                      // Only one element in the row may claim the free space, or
                      // flexbox splits it and the count drifts into mid-row.
                      hasPhotos ? "ml-8" : "ml-auto"
                    )}
                  >
                    <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
                    <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current transition-transform duration-300 ease-out group-aria-expanded/accordion-trigger:scale-y-0 motion-reduce:transition-none" />
                  </span>
                }
              >
                <span className="w-7 shrink-0 self-center font-mono text-[0.6875rem] tabular-nums text-muted-foreground/70">
                  {chapter.index}
                </span>

                <span
                  className={cn(
                    "font-display text-[clamp(1.375rem,3.2vw,2rem)] leading-tight font-light -tracking-[0.01em]",
                    "transition-opacity duration-300",
                    !hasPhotos && "text-muted-foreground"
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
                          : "font-display text-[1.375rem] leading-[1.5] font-light text-foreground/85"
                      )}
                    >
                      {chapter.lede}
                    </p>
                  </div>
                )}

                {/* The strip stays inside the column: AccordionContent needs
                    overflow-hidden for its collapse animation, so a negative-margin
                    breakout would just be clipped. The edge fade carries the
                    sense of the run continuing instead. */}
                <div className={cn("[--gutter:0px] space-y-14", !chapter.lede && "pt-2")}>
                  {chapter.groups.map((group) => (
                    <section key={group.key}>
                      {labelled && (
                        <div className={cn("mb-5 flex items-baseline gap-4", MEASURE, "max-w-none")}>
                          <h3 className="font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
                            {group.label}
                          </h3>
                          <span aria-hidden="true" className="h-px flex-1 bg-border" />
                          <span className="font-mono text-[0.6875rem] tabular-nums text-muted-foreground/70">
                            {String(group.photos.length).padStart(2, "0")}
                          </span>
                        </div>
                      )}

                      {group.text && (
                        <p className={cn(MEASURE, "mb-8 text-[1.0625rem] leading-relaxed text-muted-foreground text-balance")}>
                          {group.text}
                        </p>
                      )}

                      <FilmStrip
                        photos={group.photos}
                        alt={group.alt}
                        label={group.label ? `${chapter.title} — ${group.label}` : chapter.title}
                        onOpen={(index) =>
                          setView({ chapterId: chapter.id, groupKey: group.key, index })
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
                        <div key={dish} className="flex flex-wrap gap-x-6 gap-y-1 py-3">
                          <dt className="min-w-[14ch] flex-1 text-[0.9375rem]">{dish}</dt>
                          <dd
                            className={cn(
                              "flex-[2] text-[0.9375rem] text-muted-foreground",
                              !note && "opacity-45"
                            )}
                          >
                            {note ?? "—"}
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

      <footer className="max-w-[54ch] pt-20 sm:pl-[3.25rem]">
        <div className="space-y-5 text-[1.0625rem] leading-relaxed text-muted-foreground">
          {closing.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <p className="mt-10">
          {/* Inline, not inline-flex: as a flex item the arrow stops flowing with
              the text and lands mid-line as soon as the label wraps. */}
          <a
            href={closing.link.href}
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
      </footer>

      <Lightbox
        photos={viewedGroup?.photos ?? []}
        eyebrow={viewedChapter?.index}
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
