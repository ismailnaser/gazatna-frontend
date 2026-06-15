"use client";

import { Calendar } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { NewsCover } from "@/components/molecules/NewsCover";
import type { PublicNewsItem } from "@/types/news";

export function FeaturedNewsCard({ item }: { item: PublicNewsItem }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <NewsCover
        imageUrl={item.imageUrl}
        gradient={item.gradient}
        className="h-56 sm:h-64 lg:h-72"
      >
        <span className="absolute bottom-4 end-4 rounded-full bg-[var(--brand-magenta)] px-3 py-1 text-xs font-semibold text-white">
          أخبار المدرسة
        </span>
      </NewsCover>

      <div className="p-5 sm:p-6">
        <h3 className="text-xl font-bold leading-snug text-[#1a1a1a] sm:text-2xl">
          {item.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[#1a1a1a]/60 sm:text-base">
          {item.description}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm text-[#1a1a1a]/50">
            <Calendar className="h-4 w-4" />
            {item.date}
          </span>
          <Button href="#" variant="outline" className="rounded-full px-5 py-2 text-sm">
            اقرأ المزيد
          </Button>
        </div>
      </div>
    </article>
  );
}
