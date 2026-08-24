import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

// One photograph. The tiny blur from the build sits underneath as a background,
// so a frame always has its final size and colour before the real file lands —
// nothing in the strip reflows while you scroll.
export function Frame({
  photo,
  alt,
  sizes,
  priority = false,
  className,
  imgClassName,
  fit = "cover",
}) {
  const [loaded, setLoaded] = useState(false);

  // Cached images can finish before React attaches onLoad, so catch that here.
  const ref = useCallback((node) => {
    if (node?.complete) setLoaded(true);
  }, []);

  const set = (fmt) =>
    photo[fmt].map((w) => `${photo.src}/${w}.${fmt} ${w}w`).join(", ");

  return (
    <div
      className={cn("relative overflow-hidden bg-cover bg-center", className)}
      style={{ aspectRatio: `${photo.w} / ${photo.h}`, backgroundImage: `url("${photo.blur}")` }}
    >
      <picture>
        <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
        <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
        <img
          ref={ref}
          src={`${photo.src}/${photo.webp.at(-1)}.webp`}
          alt={alt}
          width={photo.w}
          height={photo.h}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setLoaded(true)}
          className={cn(
            "h-full w-full transition-opacity duration-700 ease-out motion-reduce:transition-none",
            fit === "cover" ? "object-cover" : "object-contain",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName
          )}
        />
      </picture>
    </div>
  );
}
