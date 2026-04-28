// MIGRATED FROM: src/components/ProductCarousel.tsx — moved to comply with atomic design structure
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  alt: string;
  className?: string;
  rounded?: boolean;
  priority?: boolean;
};

export function ProductCarousel({ images, alt, className, rounded = true, priority }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const scrollTo = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const slide = el.children[index] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== active) setActive(idx);
  };

  return (
    <div
      className={cn(
        "relative group bg-surface overflow-hidden",
        rounded && "rounded-xl",
        className,
      )}
    >
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex w-full h-full overflow-x-auto snap-x-mandatory scrollbar-hide"
      >
        {images.map((src, i) => (
          <div key={i} className="snap-center flex-none w-full h-full">
            <img
              src={src}
              alt={`${alt} — view ${i + 1}`}
              loading={priority && i === 0 ? "eager" : "lazy"}
              decoding="async"
              width={1024}
              height={1024}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              scrollTo(Math.max(0, active - 1));
            }}
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              scrollTo(Math.min(images.length - 1, active + 1));
            }}
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  scrollTo(i);
                }}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === active ? "w-6 bg-foreground" : "w-1.5 bg-foreground/30",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
