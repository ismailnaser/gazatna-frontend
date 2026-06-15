"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, GraduationCap } from "lucide-react";
import { PremiumPageHero } from "@/components/molecules/PremiumPageHero";
import { PublicPage } from "@/components/molecules/PublicPage";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Program = {
  id: string;
  title: string;
  grades: string;
  desc: string;
  features: string[];
  accent: string;
};

export default function ProgramsPage() {
  const [items, setItems] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPrograms()
      .then((data) => setItems(data as Program[]))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicPage title="" description="">
      <PremiumPageHero
        badge="المسارات الأكاديمية"
        title="البرامج الأكاديمية"
        description="مسارات تعليمية متكاملة من الابتدائية إلى الثانوية، مصمّمة بمعايير عالمية وروح محلية أصيلة."
      />

      <div className="mb-10 flex items-center gap-4 rounded-2xl border border-brand-blue/15 bg-brand-blue/5 px-5 py-4">
        <GraduationCap className="h-6 w-6 shrink-0 text-brand-blue" />
        <p className="text-sm leading-relaxed text-neutral-800 sm:text-base">
          كل مرحلة دراسية تُبنى على سابقتها — من الأساسيات إلى التخصص والجاهزية
          الجامعية.
        </p>
      </div>

      <div className="space-y-8">
        {loading ? (
          <p className="text-center text-neutral-500">جاري التحميل...</p>
        ) : items.length === 0 ? (
          <p className="text-center text-neutral-500">لا توجد برامج معروضة حالياً.</p>
        ) : (
          items.map((p, i) => (
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-[0_20px_50px_-24px_rgba(0,0,0,0.2)] transition-shadow hover:shadow-[0_28px_60px_-24px_rgba(66,76,243,0.3)]"
          >
            <div
              className={cn(
                "flex flex-col gap-6 bg-gradient-to-l p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 lg:p-10",
                p.accent
              )}
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl font-extrabold text-white/30 sm:text-6xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-white sm:text-2xl">{p.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-white/90">{p.grades}</p>
                </div>
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
            </div>

            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:p-10">
              <p className="text-base leading-relaxed text-neutral-700">{p.desc}</p>
              <ul className="space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm font-medium text-neutral-800">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-blue" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </motion.article>
          ))
        )}
      </div>
    </PublicPage>
  );
}
