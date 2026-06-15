"use client";

import { cn } from "@/lib/utils";

export function NewsCover({
  imageUrl,
  gradient,
  className,
  children,
}: {
  imageUrl?: string | null;
  gradient: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-neutral-100", className)}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
      )}
      {children}
    </div>
  );
}
