"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";

type NewsImageCarouselProps = {
  images: string[];
  gradient: string;
  className?: string;
  alt?: string;
  href?: string;
  compact?: boolean;
  children?: React.ReactNode;
};

export function NewsImageCarousel({
  images,
  gradient,
  className,
  alt = "",
  href,
  compact = false,
  children,
}: NewsImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const hasMultiple = images.length > 1;
  const currentUrl = images[index] ?? null;

  const goTo = useCallback(
    (next: number) => {
      if (!hasMultiple) return;
      setIndex((next + images.length) % images.length);
    },
    [hasMultiple, images.length]
  );

  const imageBlock = currentUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={currentUrl} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
  ) : (
    <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
  );

  const buttonClass = compact
    ? "pointer-events-auto absolute top-1/2 z-20 flex h-7 w-7 shrink-0 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-md backdrop-blur-sm transition-colors hover:bg-black/70"
    : "pointer-events-auto absolute top-1/2 z-20 flex h-9 w-9 shrink-0 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-md backdrop-blur-sm transition-colors hover:bg-black/70";

  const iconClass = compact ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className={cn("relative overflow-hidden bg-neutral-100", className)}>
      {href ? (
        <Link href={href} className="absolute inset-0 z-0 block" aria-label={alt || "عرض الخبر"}>
          {imageBlock}
        </Link>
      ) : (
        imageBlock
      )}

      {children}

      {hasMultiple ? (
        <>
          <div
            className={cn(
              "pointer-events-none absolute z-10 flex items-center gap-1 rounded-full bg-black/50 text-white backdrop-blur-sm",
              compact ? "start-1.5 top-1.5 px-1.5 py-0.5 text-[10px]" : "start-3 top-3 px-2 py-1 text-xs"
            )}
          >
            <Images className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
            <span dir="ltr">
              {index + 1}/{images.length}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goTo(index - 1);
            }}
            className={cn(buttonClass, compact ? "start-1.5" : "start-3")}
            aria-label="الصورة السابقة"
          >
            <ChevronRight className={iconClass} aria-hidden />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goTo(index + 1);
            }}
            className={cn(buttonClass, compact ? "end-1.5" : "end-3")}
            aria-label="الصورة التالية"
          >
            <ChevronLeft className={iconClass} aria-hidden />
          </button>

          <div
            className={cn(
              "absolute inset-x-0 z-20 flex items-center justify-center gap-1",
              compact ? "bottom-1.5" : "bottom-3"
            )}
          >
            {images.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIndex(dotIndex);
                }}
                className={cn(
                  "rounded-full bg-white transition-all",
                  compact ? "h-1.5" : "h-2",
                  dotIndex === index ? (compact ? "w-4" : "w-6") : compact ? "w-1.5" : "w-2",
                  dotIndex === index ? "opacity-100" : "bg-white/55 hover:bg-white/80"
                )}
                aria-label={`الصورة ${dotIndex + 1} من ${images.length}`}
                aria-current={dotIndex === index ? "true" : undefined}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
