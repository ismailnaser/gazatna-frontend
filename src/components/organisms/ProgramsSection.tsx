"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap } from "lucide-react";
import { api } from "@/lib/api";

type ProgramRow = { grade: string; description: string };

export function ProgramsSection() {
  const [items, setItems] = useState<ProgramRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getSiteSettings()
      .then((data) => {
        const s = data as { programs?: ProgramRow[] };
        setItems(Array.isArray(s.programs) ? s.programs : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => items, [items]);

  if (loading) {
    return (
      <section className="bg-neutral-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center text-neutral-500 sm:px-6 lg:px-8">
          جاري تحميل البرامج...
        </div>
      </section>
    );
  }

  if (visible.length === 0) {
    return null;
  }

  return (
    <section className="bg-neutral-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex flex-wrap items-end justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-blue/10">
              <GraduationCap className="h-5 w-5 text-brand-blue" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-p-green">البرامج التعليمية</h2>
              <p className="mt-1 text-sm text-p-black/50">
                مسارات تعليمية حسب الصفوف الدراسية في مدرسة غَزتنا
              </p>
            </div>
          </div>
          <Link
            href="/programs"
            className="text-sm font-semibold text-[var(--brand-magenta)] hover:underline"
          >
            عرض الكل
          </Link>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p, i) => (
            <motion.article
              key={p.grade}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3 bg-gradient-to-l from-brand-blue/90 to-brand-blue px-5 py-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <BookOpen className="h-5 w-5 text-white" />
                </span>
                <div>
                  <h3 className="font-bold text-white">الصف {p.grade}</h3>
                  <p className="text-xs text-white/80">برنامج تعليمي</p>
                </div>
              </div>
              {(p.description || "").trim() && (
                <div className="flex flex-1 flex-col p-5">
                  <p className="line-clamp-4 flex-1 text-sm leading-relaxed text-p-black/70">
                    {p.description}
                  </p>
                </div>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
