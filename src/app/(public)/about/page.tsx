"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, Star, Target } from "lucide-react";
import { PremiumPageHero, PremiumPanel } from "@/components/molecules/PremiumPageHero";
import { ExpandableText } from "@/components/molecules/ExpandableText";
import { PublicPage } from "@/components/molecules/PublicPage";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type SchoolValue = { id: string; title: string; desc: string; num: string };

const VALUE_TONES = [
  "bg-brand-yellow/45 border-brand-orange/30",
  "bg-brand-blue/10 border-brand-blue/25",
  "bg-[#ffe4d4] border-brand-orange/25",
];

export default function AboutPage() {
  const [values, setValues] = useState<SchoolValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [shouldLoadValues, setShouldLoadValues] = useState(false);
  const valuesRef = useRef<HTMLDivElement | null>(null);
  const [aboutSettings, setAboutSettings] = useState({
    description: "مدرسة غَزتنا مؤسسة تعليمية رقمية تهدف إلى تمكين الطلاب من خلال بيئة تعلم آمنة، مبتكرة، ومتصلة بالمستقبل.",
    vision: "أن نكون المدرسة الرقمية الرائدة في فلسطين، نُخرّج جيلاً قادراً على المنافسة عالمياً مع الحفاظ على الهوية والقيم الوطنية.",
    mission: "توفير تعليم عالي الجودة يجمع بين المناهج الأكاديمية والمهارات الرقمية، مع دعم شامل لأولياء الأمور والمجتمع.",
  });

  useEffect(() => {
    api
      .getSiteSettings()
      .then((res) => {
        const s = res as { about?: typeof aboutSettings };
        if (s.about) setAboutSettings((prev) => ({ ...prev, ...s.about }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const node = valuesRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadValues(true);
          observer.disconnect();
        }
      },
      { rootMargin: "160px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoadValues) return;
    setLoading(true);
    api
      .getSchoolValues()
      .then((data) => setValues(data as SchoolValue[]))
      .catch(() => setValues([]))
      .finally(() => setLoading(false));
  }, [shouldLoadValues]);

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
            label="رؤيتنا للمستقبل"
            title="رؤيتنا"
            gradient="from-brand-yellow/30 via-white to-white"
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
            label="ما نعمل لأجله"
            title="رسالتنا"
            gradient="from-brand-orange/15 via-white to-brand-yellow/20"
            icon={<Heart className="h-7 w-7 text-brand-orange" />}
          >
            <ExpandableText maxLines={4}>{aboutSettings.mission}</ExpandableText>
          </PremiumPanel>
        </motion.div>
      </div>

      <div ref={valuesRef} className="relative">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-yellow shadow-[-3px_3px_0_0_rgba(234,102,34,0.4)]">
            <Sparkles className="h-6 w-6 text-p-black" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-extrabold text-brand-blue sm:text-3xl">قيمنا</h2>
            <p className="text-sm font-semibold text-p-black/55">ما نزرعه في قلوب طلابنا كل يوم</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {loading ? (
            <p className="col-span-full text-center font-semibold text-p-black/60">جاري التحميل...</p>
          ) : values.length === 0 ? (
            <p className="col-span-full text-center font-semibold text-p-black/60">لا توجد قيم معروضة حالياً.</p>
          ) : (
            values.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={cn(
                  "rounded-[1.8rem_0.8rem_1.8rem_1rem] border-[3px] p-6 shadow-[-5px_6px_0_0_rgba(26,26,26,0.08)]",
                  VALUE_TONES[i % VALUE_TONES.length]
                )}
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white font-display text-xl font-extrabold text-brand-orange shadow-[-2px_2px_0_0_rgba(234,102,34,0.3)]">
                  {v.num}
                </span>
                <h3 className="font-display mt-4 flex items-center gap-2 text-lg font-extrabold text-p-black">
                  <Star className="h-4 w-4 fill-brand-yellow text-brand-yellow" />
                  {v.title}
                </h3>
                <ExpandableText maxLines={3} className="mt-3 text-sm font-semibold text-p-black/70">
                  {v.desc}
                </ExpandableText>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </PublicPage>
  );
}
