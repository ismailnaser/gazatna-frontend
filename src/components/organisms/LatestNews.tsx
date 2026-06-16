"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";
import { FeaturedNewsCard } from "@/components/molecules/FeaturedNewsCard";
import { NewsListItem } from "@/components/molecules/NewsListItem";
import { NewsFilterBar } from "@/components/molecules/NewsFilterBar";
import { api } from "@/lib/api";
import { mapNewsItem, type NewsFilter, type PublicNewsItem } from "@/types/news";

export function LatestNews() {
  const [filter, setFilter] = useState<NewsFilter>("الكل");
  const [items, setItems] = useState<PublicNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNews()
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

  const featured = filtered.find((item) => item.featured) ?? filtered[0];
  const listItems = filtered.filter((item) => item.id !== featured?.id);

  if (loading) {
    return (
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center text-neutral-500 sm:px-6 lg:px-8">
          جاري تحميل الأخبار...
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center text-neutral-500 sm:px-6 lg:px-8">
          لا توجد أخبار حالياً.
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end">
          <Link
            href="/news"
            className="text-sm font-semibold text-[var(--brand-magenta)] hover:underline"
          >
            عرض الكل
          </Link>
        </div>

        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-5 lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:col-span-2 lg:row-start-1"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-teal)]/10">
                <Newspaper className="h-5 w-5 text-[var(--brand-teal)]" />
              </span>
              <div>
                <h2 className="text-2xl font-bold text-[var(--brand-teal)]">آخر الأخبار</h2>
                <p className="mt-1 text-sm text-[#1a1a1a]/50">
                  أحدث الفعاليات والإنجازات في مدرستنا
                </p>
              </div>
            </div>
            <NewsFilterBar filter={filter} onChange={setFilter} />
          </motion.div>

          <div className="order-2 lg:col-span-3 lg:row-span-2 lg:row-start-1">
            {featured && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <FeaturedNewsCard item={featured} />
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="order-3 space-y-4 lg:col-span-2 lg:row-start-2"
          >
            {listItems.map((item) => (
              <NewsListItem key={item.id} item={item} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
