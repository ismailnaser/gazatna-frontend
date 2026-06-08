"use client";

import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";
import { NewsCard } from "@/components/molecules/NewsCard";
import { newsItems } from "@/data/home";

export function LatestNews() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex flex-wrap items-end justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-p-green/10">
              <Newspaper className="h-5 w-5 text-p-green" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-p-green">آخر الأخبار</h2>
              <p className="mt-1 text-sm text-p-black/50">
                أحدث الفعاليات والإنجازات في مدرستنا
              </p>
            </div>
          </div>
          <a
            href="#"
            className="text-sm font-semibold text-p-red hover:text-p-red-light"
          >
            عرض الكل
          </a>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {newsItems.map((item, index) => (
            <NewsCard
              key={item.id}
              title={item.title}
              gradient={item.gradient}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
