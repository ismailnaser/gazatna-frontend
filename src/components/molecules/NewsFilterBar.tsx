"use client";

import { newsFilters, type NewsFilter } from "@/data/home";
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
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            filter === f
              ? "bg-[#064e3b] text-white"
              : "border border-neutral-200 bg-white text-[#1a1a1a]/70 hover:border-[#064e3b]/30"
          )}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
