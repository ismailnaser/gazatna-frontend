"use client";

import { cn } from "@/lib/utils";
import type { NewsItem } from "@/data/home";

export function NewsListItem({ item }: { item: NewsItem }) {
  return (
    <article className="flex gap-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div
        className={cn(
          "h-20 w-20 shrink-0 rounded-xl bg-gradient-to-br sm:h-24 sm:w-24",
          item.gradient
        )}
      />

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <h3 className="font-bold leading-snug text-[#1a1a1a]">{item.title}</h3>
        <a
          href="#"
          className="self-end text-sm font-semibold text-[#064e3b] hover:underline"
        >
          اقرأ المزيد
        </a>
      </div>
    </article>
  );
}
