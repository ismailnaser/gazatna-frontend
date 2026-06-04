"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { StatCard } from "@/components/molecules/StatCard";
import { stats } from "@/data/home";

export function StatsSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex items-center gap-3"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-100">
            <BarChart3 className="h-5 w-5 text-teal-600" />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">إنجازاتنا بالأرقام</h2>
            <p className="mt-1 text-sm text-slate-500">
              مؤشرات تعكس جودة التعليم في مدرسة غزتنا
            </p>
          </div>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <StatCard key={stat.id} {...stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
