"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { FeaturedNewsCard } from "@/components/molecules/FeaturedNewsCard";
import { api } from "@/lib/api";
import { mapNewsItem, type PublicNewsItem } from "@/types/news";

export function LatestNews() {
  const [items, setItems] = useState<PublicNewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    setLoading(true);
    api
      .getNews()
      .then((data) => {
        const mapped = (data as Array<Record<string, unknown>>).map((n) => mapNewsItem(n));
        setItems(mapped.slice(0, 3));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [shouldLoad]);

  return (
    <section ref={sectionRef} className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-yellow/80 shadow-[-3px_3px_0_0_rgba(234,102,34,0.35)]">
              <Newspaper className="h-5 w-5 text-p-black" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-extrabold text-brand-blue">آخر الأخبار</h2>
              <p className="text-sm font-semibold text-p-black/50">أحدث 3 بوستات</p>
            </div>
          </div>
          <Link
            href="/news"
            prefetch={false}
            className="text-sm font-extrabold text-brand-orange hover:underline"
          >
            عرض الكل
          </Link>
        </div>

        {!shouldLoad || loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-4">
            <div className="aspect-square animate-pulse rounded-[1.6rem] bg-neutral-100" />
            <div className="aspect-square animate-pulse rounded-[1.6rem] bg-neutral-100" />
            <div className="aspect-square animate-pulse rounded-[1.6rem] bg-neutral-100" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center font-semibold text-p-black/60">لا توجد أخبار حالياً.</p>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-3 sm:gap-4">
            {items.map((item) => (
              <FeaturedNewsCard key={item.id} item={item} compact />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
