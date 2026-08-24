import { useEffect, useRef } from "react";
import { Dialog, VisuallyHidden } from "radix-ui";
import { ArrowLeftIcon, ArrowRightIcon, XIcon } from "lucide-react";
import { Frame } from "./frame";
import { cn } from "@/lib/utils";

// The full-screen viewer. This is where a long run is actually browsed: the strip
// is the invitation, the rail along the bottom is how you get from photograph 3 to
// photograph 60 without scrolling sideways for a week.
//
// It opens on one group, not a whole chapter — so paging through Make's pottery
// stays in pottery rather than running on into the drawings.
export function Lightbox({ photos = [], title, alt, index, onIndex, onClose }) {
  const open = index !== null;
  const photo = open ? photos[index] : null;
  const rail = useRef(null);
  const touch = useRef(null);

  const go = (delta) => {
    if (!photos.length) return;
    onIndex((index + delta + photos.length) % photos.length);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Keep the neighbours warm so paging feels instant.
  useEffect(() => {
    if (!open) return;
    for (const d of [1, -1]) {
      const n = photos[(index + d + photos.length) % photos.length];
      if (n) new Image().src = `${n.src}/${n.avif.at(-1)}.avif`;
    }
  }, [open, index, photos]);

  useEffect(() => {
    rail.current
      ?.querySelector('[data-current="true"]')
      ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [index]);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - (touch.current ?? 0);
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          }}
          className={cn(
            "fixed inset-0 z-50 flex flex-col text-neutral-200 outline-none",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-97",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
          )}
        >
          <VisuallyHidden.Root>
            <Dialog.Title>{title} — photograph {index + 1} of {photos.length}</Dialog.Title>
          </VisuallyHidden.Root>

          <header className="flex shrink-0 items-baseline gap-4 px-5 py-4 sm:px-8">
            <span className="truncate text-sm text-neutral-300">{title}</span>
            <span className="ml-auto font-mono text-[0.6875rem] tabular-nums text-neutral-500">
              {String(index + 1).padStart(2, "0")}
              <span className="opacity-40"> / </span>
              {String(photos.length).padStart(2, "0")}
            </span>
            <Dialog.Close className="-my-2 rounded-full p-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none">
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </header>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 sm:px-16">
            {photo && (
              <Frame
                key={photo.id}
                photo={photo}
                alt={`${alt} (${index + 1} of ${photos.length})`}
                priority
                fit="contain"
                sizes="(max-width: 640px) 96vw, 88vw"
                className="max-h-full max-w-full rounded-[2px] bg-neutral-900"
              />
            )}

            {photos.length > 1 &&
              [
                { d: -1, Icon: ArrowLeftIcon, side: "left-1 sm:left-4", label: "Previous photograph" },
                { d: 1, Icon: ArrowRightIcon, side: "right-1 sm:right-4", label: "Next photograph" },
              ].map(({ d, Icon, side, label }) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => go(d)}
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 rounded-full p-3 text-neutral-400 transition-colors",
                    "hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none",
                    side
                  )}
                >
                  <Icon className="size-5" />
                  <span className="sr-only">{label}</span>
                </button>
              ))}
          </div>

          <div
            ref={rail}
            className="no-scrollbar flex shrink-0 items-center gap-1.5 overflow-x-auto px-5 py-5 sm:px-8"
          >
            {photos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                data-current={i === index}
                onClick={() => onIndex(i)}
                aria-label={`Photograph ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "h-12 shrink-0 overflow-hidden rounded-[2px] transition-all duration-300",
                  "focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none",
                  i === index
                    ? "opacity-100 ring-1 ring-white/80"
                    : "opacity-40 hover:opacity-80"
                )}
                style={{ aspectRatio: `${p.w} / ${p.h}` }}
              >
                <img
                  src={`${p.src}/400.webp`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
