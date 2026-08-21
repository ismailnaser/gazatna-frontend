"use client";

import { useEffect, useState } from "react";
import { FeaturedNewsCard } from "@/components/molecules/FeaturedNewsCard";
import { NewsFilterBar } from "@/components/molecules/NewsFilterBar";
import { PublicPage } from "@/components/molecules/PublicPage";
import { api } from "@/lib/api";
import { mapNewsItem, type NewsFilter, type PublicNewsItem } from "@/types/news";

export function NewsListClient() {
  const [filter, setFilter] = useState<NewsFilter>("الكل");
  const [items, setItems] = useState<PublicNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getNews()
      .then((data) => {
        const mapped = (data as Array<Record<string, unknown>>).map((n) => mapNewsItem(n));
        setItems(mapped);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || items.length === 0) return;
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const target = document.getElementById(hash);
    target?.scrollIntoView({ block: "start" });
  }, [loading, items]);

  const filtered = filter === "الكل" ? items : items.filter((item) => item.category === filter);

  return (
    <PublicPage title="أخبار المدرسة" description="اسحب لتحت على خيط البوستات">
      <div className="mx-auto mb-8 max-w-lg">
        <NewsFilterBar filter={filter} onChange={setFilter} />
      </div>

      {loading ? (
        <div className="mx-auto max-w-lg space-y-6">
          <div className="aspect-square animate-pulse rounded-[1.6rem] bg-white/80" />
          <div className="h-24 animate-pulse rounded-[1.6rem] bg-white/80" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center font-semibold text-p-black/60">
          {items.length === 0 ? "لا توجد أخبار حالياً." : "لا توجد أخبار في هذا التصنيف."}
        </p>
      ) : (
        <div className="relative mx-auto max-w-lg ps-7">
          <span
            className="candy-thread pointer-events-none absolute inset-y-3 start-0 w-2.5"
            aria-hidden
          />
          <div className="relative space-y-8">
            {filtered.map((item) => (
              <div key={item.id} id={`reel-${item.id}`} className="scroll-mt-24">
                <FeaturedNewsCard item={item} />
              </div>
            ))}
          </div>
        </div>
      )}
    </PublicPage>
  );
}
