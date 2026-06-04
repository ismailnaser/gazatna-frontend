"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/atoms/Button";

export function Hero() {
  return (
    <section
      id="الرئيسية"
      className="relative overflow-hidden bg-gradient-to-bl from-violet-50 via-slate-50 to-teal-50"
    >
      <div
        className="pointer-events-none absolute -start-24 top-10 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -end-16 bottom-0 h-64 w-64 rounded-full bg-teal-200/40 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-violet-700 shadow-sm ring-1 ring-violet-100">
            <Sparkles className="h-4 w-4" />
            التعليم الرقمي بمعايير عالمية
          </span>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-800 sm:text-5xl lg:text-6xl">
            مرحباً بكم في{" "}
            <span className="bg-gradient-to-l from-violet-600 to-teal-500 bg-clip-text text-transparent">
              مدرسة غزتنا
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            منصة تعليمية حديثة تجمع بين التميز الأكاديمي والتقنية، لبناء جيل
            واعٍ ومبدع في غزة.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row-reverse">
            <Button href="#التسجيل" className="min-w-[160px] px-8 py-3 text-base">
              ابدأ رحلتك
            </Button>
            <Button
              href="#من-نحن"
              variant="outline"
              className="min-w-[160px] px-8 py-3 text-base"
            >
              تعرّف علينا
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
