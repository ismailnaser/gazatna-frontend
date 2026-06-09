"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";
import { FeaturedNewsCard } from "@/components/molecules/FeaturedNewsCard";
import { NewsListItem } from "@/components/molecules/NewsListItem";
import { NewsFilterBar } from "@/components/molecules/NewsFilterBar";
import { newsItems, type NewsFilter } from "@/data/home";

export function LatestNews() {
  const [filter, setFilter] = useState<NewsFilter>("الكل");

  const filtered = useMemo(() => {
    if (filter === "الكل") return newsItems;
    return newsItems.filter((item) => item.category === filter);
  }, [filter]);

  const featured =
    filtered.find((item) => item.featured) ?? filtered[0];
  const listItems = filtered.filter((item) => item.id !== featured?.id);

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end">
          <a
            href="#"
            className="text-sm font-semibold text-[#881337] hover:underline"
          >
            عرض الكل
          </a>
        </div>

        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-5 lg:gap-10">
          {/* العنوان + الفلاتر — أولاً على الجوال، يمين على الكمبيوتر */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:col-span-2 lg:row-start-1"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#064e3b]/10">
                <Newspaper className="h-5 w-5 text-[#064e3b]" />
              </span>
              <div>
                <h2 className="text-2xl font-bold text-[#064e3b]">آخر الأخبار</h2>
                <p className="mt-1 text-sm text-[#1a1a1a]/50">
                  أحدث الفعاليات والإنجازات في مدرستنا
                </p>
              </div>
            </div>
            <NewsFilterBar filter={filter} onChange={setFilter} />
          </motion.div>

          {/* البطاقة المميزة — ثانياً على الجوال، يسار على الكمبيوتر */}
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

          {/* قائمة الأخبار — ثالثاً على الجوال */}
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
