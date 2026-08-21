"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, GraduationCap, Star, Users, type LucideIcon } from "lucide-react";
import { StatCard } from "@/components/molecules/StatCard";
import { api } from "@/lib/api";

const iconMap: Record<string, LucideIcon> = {
  Star,
  GraduationCap,
  Users,
};

type StatFromApi = {
  id: string;
  label: string;
  value: string;
  iconName?: string;
  iconBg: string;
  iconColor: string;
};

type StatItem = {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
};

export function StatsSection() {
  const [items, setItems] = useState<StatItem[]>([]);
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
    api.getStats()
      .then((data) => {
        const mapped = (data as StatFromApi[])
          .filter((s) => s.id !== "years" && !s.label.includes("سنوات خبرة"))
          .map((s) => ({
            id: s.id,
            label: s.label,
            value: s.value,
            icon: iconMap[s.iconName ?? "Star"] ?? Star,
            iconBg: s.iconBg,
            iconColor: s.iconColor,
          }));
        setItems(mapped);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [shouldLoad]);

  if (!loading && shouldLoad && items.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex items-center gap-3"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-yellow shadow-[-3px_3px_0_0_rgba(234,102,34,0.35)]">
            <BarChart3 className="h-5 w-5 text-p-black" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-extrabold text-brand-blue sm:text-3xl">إنجازاتنا بالأرقام</h2>
            <p className="mt-1 text-sm text-p-black/72">
              أرقام ملوّنة من حياة المدرسة اليومية
            </p>
          </div>
        </motion.div>

        {!shouldLoad || loading ? (
          <div className="card-grid card-grid-lg">
            <div className="h-28 animate-pulse rounded-[1.5rem_0.6rem_1.5rem_0.8rem] bg-neutral-100" />
            <div className="h-28 animate-pulse rounded-[1.5rem_0.6rem_1.5rem_0.8rem] bg-neutral-100" />
            <div className="h-28 animate-pulse rounded-[1.5rem_0.6rem_1.5rem_0.8rem] bg-neutral-100" />
          </div>
        ) : items.length === 0 ? null : (
        <div className="card-grid card-grid-lg">
          {items.map((stat, index) => (
            <StatCard key={stat.id} {...stat} index={index} />
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
