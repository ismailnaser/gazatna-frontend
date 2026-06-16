"use client";

import Link from "next/link";
import { NewsCover } from "@/components/molecules/NewsCover";
import type { PublicNewsItem } from "@/types/news";

export function NewsListItem({ item }: { item: PublicNewsItem }) {
  return (
    <article className="flex gap-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/news/${item.id}`} className="shrink-0">
        <NewsCover
          imageUrl={item.imageUrl}
          gradient={item.gradient}
          className="h-20 w-20 rounded-xl sm:h-24 sm:w-24"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <Link href={`/news/${item.id}`}>
          <h3 className="font-bold leading-snug text-[#1a1a1a] transition-colors hover:text-[var(--brand-teal)]">
            {item.title}
          </h3>
        </Link>
        <Link
          href={`/news/${item.id}`}
          className="self-end text-sm font-semibold text-[var(--brand-teal)] hover:underline"
        >
          اقرأ المزيد
        </Link>
      </div>
    </article>
  );
}
