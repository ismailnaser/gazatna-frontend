"use client";

import { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats()
      .then((data) => {
        const mapped = (data as StatFromApi[]).map((s) => ({
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
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center text-neutral-500 sm:px-6 lg:px-8">
          جاري تحميل الإحصائيات...
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex items-center gap-3"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-p-red/10">
            <BarChart3 className="h-5 w-5 text-p-red" />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-p-green">إنجازاتنا بالأرقام</h2>
            <p className="mt-1 text-sm text-p-black/50">
              مؤشرات تعكس جودة التعليم في مدرسة غَزتنا
            </p>
          </div>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((stat, index) => (
            <StatCard key={stat.id} {...stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
