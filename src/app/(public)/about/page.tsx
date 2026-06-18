"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, Target } from "lucide-react";
import { PremiumPageHero, PremiumPanel } from "@/components/molecules/PremiumPageHero";
import { ExpandableText } from "@/components/molecules/ExpandableText";
import { PublicPage } from "@/components/molecules/PublicPage";
import { api } from "@/lib/api";

type SchoolValue = { id: string; title: string; desc: string; num: string };

export default function AboutPage() {
  const [values, setValues] = useState<SchoolValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [aboutSettings, setAboutSettings] = useState({
    description: "مدرسة غَزتنا مؤسسة تعليمية رقمية تهدف إلى تمكين الطلاب من خلال بيئة تعلم آمنة، مبتكرة، ومتصلة بالمستقبل.",
    vision: "أن نكون المدرسة الرقمية الرائدة في فلسطين، نُخرّج جيلاً قادراً على المنافسة عالمياً مع الحفاظ على الهوية والقيم الوطنية.",
    mission: "توفير تعليم عالي الجودة يجمع بين المناهج الأكاديمية والمهارات الرقمية، مع دعم شامل لأولياء الأمور والمجتمع.",
  });

  useEffect(() => {
    api.getSchoolValues()
      .then((data) => setValues(data as SchoolValue[]))
      .catch(() => setValues([]))
      .finally(() => setLoading(false));
    api.getSiteSettings()
      .then((res) => {
        const s = res as { about?: typeof aboutSettings };
        if (s.about) setAboutSettings((prev) => ({ ...prev, ...s.about }));
      })
      .catch(() => {});
  }, []);

  return (
    <PublicPage title="" description="">
      <PremiumPageHero
        badge="هويتنا التعليمية"
        title="من نحن"
        description={aboutSettings.description}
      />

      <div className="mb-16 grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <PremiumPanel
            label="Vision"
            title="رؤيتنا"
            gradient="from-brand-blue/10 via-white to-white"
            icon={<Target className="h-7 w-7 text-brand-blue" />}
          >
            <ExpandableText maxLines={4}>{aboutSettings.vision}</ExpandableText>
          </PremiumPanel>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <PremiumPanel
            label="Mission"
            title="رسالتنا"
            gradient="from-brand-orange/10 via-white to-brand-yellow/10"
            icon={<Heart className="h-7 w-7 text-brand-orange" />}
          >
            <ExpandableText maxLines={4}>{aboutSettings.mission}</ExpandableText>
          </PremiumPanel>
        </motion.div>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-neutral-950 px-6 py-12 sm:px-10 sm:py-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-30 pattern-tatreez"
          aria-hidden
        />
        <div className="relative">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold tracking-[0.25em] text-brand-yellow">
                CORE VALUES
              </span>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">قيمنا</h2>
            </div>
            <Sparkles className="hidden h-8 w-8 text-brand-yellow sm:block" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {loading ? (
              <p className="col-span-full text-center text-white/60">جاري التحميل...</p>
            ) : values.length === 0 ? (
              <p className="col-span-full text-center text-white/60">لا توجد قيم معروضة حالياً.</p>
            ) : (
            values.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <span className="text-3xl font-extrabold text-brand-yellow/80">{v.num}</span>
                <h3 className="mt-4 text-lg font-bold text-white">{v.title}</h3>
                <ExpandableText maxLines={3} className="mt-3 text-sm text-white/70">
                  {v.desc}
                </ExpandableText>
              </motion.div>
            ))
            )}
          </div>
        </div>
      </div>
    </PublicPage>
  );
}
