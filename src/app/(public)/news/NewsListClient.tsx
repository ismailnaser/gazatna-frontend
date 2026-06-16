"use client";

import { useEffect, useMemo, useState } from "react";
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

  const filtered = useMemo(() => {
    if (filter === "الكل") return items;
    return items.filter((item) => item.category === filter);
  }, [filter, items]);

  return (
    <PublicPage
      title="أخبار المدرسة"
      description="جميع الأخبار والفعاليات والإنجازات في مدرستنا"
    >
      <div className="mb-8">
        <NewsFilterBar filter={filter} onChange={setFilter} />
      </div>

      {loading ? (
        <p className="text-center text-neutral-500">جاري تحميل الأخبار...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-neutral-500">
          {items.length === 0 ? "لا توجد أخبار حالياً." : "لا توجد أخبار في هذا التصنيف."}
        </p>
      ) : (
        <div className="mx-auto max-w-3xl space-y-8">
          {filtered.map((item) => (
            <FeaturedNewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </PublicPage>
  );
}
