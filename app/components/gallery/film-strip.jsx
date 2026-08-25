import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { Frame } from "./frame";
import { cn } from "@/lib/utils";

// A chapter's photographs as one horizontal run, each at its true proportions
// and a shared height — portraits come out narrow, landscapes wide, nothing is
// cropped to fit a grid.
//
// Focus uses a roving tabindex: the strip is a single tab stop and the arrow
// keys move along it, so a 74-photo chapter does not put 74 stops between the
// reader and the rest of the page.
export function FilmStrip({ photos, alt, label, onOpen }) {
  const scroller = useRef(null);
  const items = useRef([]);
  const [active, setActive] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft > max - 8 });

    // Whichever frame covers the left edge of the viewport is the current one.
    const x = el.scrollLeft + 24;
    let i = items.current.findIndex(
      (n) => n && n.offsetLeft <= x && n.offsetLeft + n.offsetWidth > x
    );
    if (i >= 0) setActive(i);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const focusItem = (i) => {
    const next = Math.max(0, Math.min(photos.length - 1, i));
    setActive(next);
    items.current[next]?.focus({ preventScroll: true });
    items.current[next]?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  };

  const page = (dir) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const onKeyDown = (e) => {
    const moves = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: photos.length - 1,
    };
    if (e.key in moves) {
      e.preventDefault();
      focusItem(moves[e.key]);
    }
  };

  // Fade the run out only on a side that actually continues past the edge.
  const fade = (on) => (on ? "0px" : "44px");

  return (
    <div className="group/strip relative">
      <ul
        ref={scroller}
        onScroll={measure}
        onKeyDown={onKeyDown}
        aria-label={`${label} — ${photos.length} photographs`}
        className={cn(
          "no-scrollbar flex snap-x snap-proximity gap-2 overflow-x-auto overscroll-x-contain",
          // py leaves room for the hover lift and drop shadow: setting overflow-x
          // forces overflow-y to compute as auto, so anything outside would clip.
          "scroll-px-[var(--gutter)] px-[var(--gutter)] py-2"
        )}
        style={{
          maskImage: `linear-gradient(to right, transparent 0, #000 ${fade(
            edges.start
          )}, #000 calc(100% - ${fade(edges.end)}), transparent 100%)`,
        }}
      >
        {photos.map((photo, i) => (
          <li key={photo.id} className="shrink-0 snap-start">
            <button
              ref={(n) => (items.current[i] = n)}
              type="button"
              tabIndex={i === active ? 0 : -1}
              onClick={() => onOpen(i)}
              onFocus={() => setActive(i)}
              aria-label={`${alt} — open photograph ${i + 1} of ${photos.length}`}
              className={cn(
                "block h-[clamp(15rem,44vh,30rem)] cursor-zoom-in rounded-[3px]",
                "outline-none ring-offset-2 ring-offset-background",
                "focus-visible:ring-2 focus-visible:ring-foreground/60"
              )}
            >
              <Frame
                photo={photo}
                alt=""
                priority={i < 3}
                sizes="(max-width: 640px) 70vw, 40vw"
                className={cn(
                  "h-full w-auto rounded-[3px]",
                  "shadow-[0_1px_2px_rgb(0_0_0/0.06),0_8px_24px_-12px_rgb(0_0_0/0.22)]",
                  "transition-transform duration-500 ease-out will-change-transform",
                  "hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                )}
              />
            </button>
          </li>
        ))}
      </ul>

      {/* Paging arrows are a pointer affordance; keyboard users have the arrow
          keys above and touch users have the scroll itself. */}
      {[
        { dir: -1, hidden: edges.start, Icon: ArrowLeftIcon, side: "left-1", label: "Scroll back" },
        { dir: 1, hidden: edges.end, Icon: ArrowRightIcon, side: "right-1", label: "Scroll forward" },
      ].map(({ dir, hidden, Icon, side, label: l }) => (
        <button
          key={dir}
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => page(dir)}
          className={cn(
            "absolute top-1/2 hidden -translate-y-1/2 rounded-full border border-border/70 p-2.5 md:block",
            "bg-background/80 text-foreground/70 backdrop-blur-sm transition-all duration-300",
            "hover:text-foreground hover:shadow-md",
            "opacity-0 group-hover/strip:opacity-100",
            side,
            hidden && "pointer-events-none !opacity-0"
          )}
        >
          <Icon className="size-4" />
          <span className="sr-only">{l}</span>
        </button>
      ))}

      <div className="mt-4 flex items-center gap-4 px-[var(--gutter)]">
        <span className="font-mono text-[0.6875rem] tabular-nums tracking-wider text-muted-foreground">
          {String(active + 1).padStart(2, "0")}
          <span className="opacity-40"> / </span>
          {String(photos.length).padStart(2, "0")}
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-border">
          <span
            className="block h-px bg-foreground/45 transition-all duration-300 ease-out"
            style={{ width: `${((active + 1) / photos.length) * 100}%` }}
          />
        </span>
      </div>
    </div>
  );
}
