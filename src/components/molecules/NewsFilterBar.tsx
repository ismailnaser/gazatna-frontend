"use client";

import { newsFilters, type NewsFilter } from "@/types/news";
import { cn } from "@/lib/utils";

export function NewsFilterBar({
  filter,
  onChange,
}: {
  filter: NewsFilter;
  onChange: (filter: NewsFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {newsFilters.map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => onChange(f)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-extrabold transition-transform hover:-translate-y-0.5",
            filter === f
              ? "bg-brand-blue text-white shadow-[-3px_3px_0_0_rgba(249,180,40,0.7)]"
              : "border-2 border-black/10 bg-white text-p-black/70 hover:border-brand-yellow"
          )}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
