"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/atoms/Button";
import { api } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";

type HeroSettings = {
  welcome: string;
  schoolName: string;
  tagline: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  imageUrl?: string | null;
  imageHeight: string;
  imageObjectFit: "cover" | "contain";
  imageObjectPosition: string;
};

const DEFAULT: HeroSettings = {
  welcome: "مرحبا بكم في",
  schoolName: "مدرسة غَزتنا",
  tagline: "التعليم الرقمي بمعايير عالمية",
  description:
    "من أصالة الانتماء إلى ريادة المستقبل — منصة تعليمية حديثة تجمع بين التميز الأكاديمي والتقنية، لبناء جيل واعٍ ومبدع في غزة",
  ctaPrimary: "ابدأ رحلتك",
  ctaSecondary: "تعرّف علينا",
  imageUrl: null,
  imageHeight: "100dvh",
  imageObjectFit: "cover",
  imageObjectPosition: "center top",
};

const FALLBACK_IMAGE = "/images/hero-illustration.webp";
const FALLBACK_IMAGE_MOBILE = "/images/hero-illustration-828.webp";
const FALLBACK_IMAGE_JPG = "/images/hero-illustration.jpg";

export function Hero() {
  const [hero, setHero] = useState<HeroSettings>(DEFAULT);

  useEffect(() => {
    api
      .getSiteSettings()
      .then((res) => {
        const s = res as { hero?: Partial<HeroSettings> };
        if (s.hero) {
          setHero({
            ...DEFAULT,
            ...s.hero,
            imageHeight: s.hero.imageHeight || DEFAULT.imageHeight,
            imageObjectFit: s.hero.imageObjectFit === "contain" ? "contain" : "cover",
            imageObjectPosition: s.hero.imageObjectPosition || DEFAULT.imageObjectPosition,
          });
        }
      })
      .catch(() => {});
  }, []);

  const customImage = resolveMediaUrl(hero.imageUrl);
  const imageSrc = customImage || FALLBACK_IMAGE;
  const usingFallback = !customImage;
  const title = hero.schoolName.trim() || DEFAULT.schoolName;
  const titleParts = title.split(/\s+/);
  const firstWord = titleParts[0] ?? title;
  const restTitle = titleParts.slice(1).join(" ");
  const imageStyle = {
    objectFit: hero.imageObjectFit,
    objectPosition: hero.imageObjectPosition,
  } as const;

  return (
    <section
      id="الرئيسية"
      className="relative overflow-hidden bg-hero"
      style={{ minHeight: hero.imageHeight || "100dvh" }}
    >
      {usingFallback ? (
        <picture>
          <source
            type="image/webp"
            srcSet={`${FALLBACK_IMAGE_MOBILE} 828w, ${FALLBACK_IMAGE} 1920w`}
            sizes="100vw"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={FALLBACK_IMAGE_JPG}
            alt=""
            aria-hidden
            width={1920}
            height={945}
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full"
            style={imageStyle}
          />
        </picture>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt=""
          aria-hidden
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full"
          style={imageStyle}
        />
      )}

      <div
        className="relative z-10 flex w-full flex-col items-start px-6 sm:px-10 lg:px-16"
        style={{ minHeight: hero.imageHeight || "100dvh" }}
      >
        <div aria-hidden className="hero-content-offset w-full shrink-0" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl pb-16 text-start"
        >
          <p className="font-display text-xl font-extrabold text-brand-black sm:text-2xl">{hero.welcome}</p>

          <h1 className="font-display mt-3 text-5xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">
            <span className="text-brand-black">{firstWord} </span>
            {restTitle ? <span className="text-brand-orange">{restTitle}</span> : null}
          </h1>
          <div className="mt-4 h-1.5 w-56 rounded-full bg-brand-blue sm:w-72" />

          <p className="font-display mt-8 text-2xl font-extrabold text-brand-black sm:text-3xl lg:text-4xl">
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
