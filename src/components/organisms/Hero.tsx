"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/atoms/Button";
import { api } from "@/lib/api";

type HeroSettings = {
  welcome: string;
  schoolName: string;
  tagline: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

const DEFAULT: HeroSettings = {
  welcome: "مرحبا بكم في",
  schoolName: "مدرسة غَزتنا",
  tagline: "التعليم الرقمي بمعايير عالمية",
  description:
    "من أصالة الانتماء إلى ريادة المستقبل — منصة تعليمية حديثة تجمع بين التميز الأكاديمي والتقنية، لبناء جيل واعٍ ومبدع في غزة",
  ctaPrimary: "ابدأ رحلتك",
  ctaSecondary: "تعرّف علينا",
};

export function Hero() {
  const [hero, setHero] = useState<HeroSettings>(DEFAULT);

  useEffect(() => {
    api
      .getSiteSettings()
      .then((res) => {
        const s = res as { hero?: Partial<HeroSettings> };
        if (s.hero) setHero({ ...DEFAULT, ...s.hero });
      })
      .catch(() => {});
  }, []);

  return (
    <section id="الرئيسية" className="relative min-h-dvh overflow-hidden">
      <Image
        src="/images/hero-illustration.jpg"
        alt=""
        fill
        priority
        className="object-cover object-top sm:object-center"
        sizes="100vw"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-dvh w-full flex-col items-start px-6 sm:px-10 lg:px-16">
        <div aria-hidden className="hero-content-offset w-full shrink-0" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl text-start"
        >
          <p className="text-xl font-medium text-brand-black sm:text-2xl">{hero.welcome}</p>

          <h1 className="mt-3 text-5xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">
            <span className="text-brand-black">مدرسة </span>
            <span className="text-brand-orange">غَزتنا</span>
          </h1>
          <div className="mt-4 h-1.5 w-56 rounded-full bg-brand-blue sm:w-72" />

          <p className="mt-8 text-2xl font-bold text-brand-black sm:text-3xl lg:text-4xl">
            {hero.tagline}
          </p>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-black/80 sm:text-xl">
            {hero.description}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button
              href="/register"
              variant="accent"
              className="min-w-[180px] rounded-full px-10 py-3.5 text-base shadow-md"
            >
              {hero.ctaPrimary}
            </Button>
            <Button
              href="/about"
              variant="outline"
              className="min-w-[180px] rounded-full border-brand-blue bg-white/90 px-10 py-3.5 text-base backdrop-blur-sm"
            >
              {hero.ctaSecondary}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
