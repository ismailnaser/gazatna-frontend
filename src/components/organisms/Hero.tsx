"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/atoms/Button";

export function Hero() {
  return (
    <section
      id="الرئيسية"
      className="relative min-h-[100dvh] overflow-hidden bg-white"
    >
      {/* شاشات طولية (هاتف، تابلت عمودي) */}
      <Image
        src="/images/hero-bg-portrait.png"
        alt=""
        fill
        priority
        className="object-cover object-center portrait:block landscape:hidden"
        sizes="100vw"
        aria-hidden
      />

      {/* شاشات عرضية (كمبيوتر، هاتف أفقي) */}
      <Image
        src="/images/hero-bg.png"
        alt=""
        fill
        priority
        className="hidden object-cover object-center portrait:hidden landscape:block"
        sizes="100vw"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-4xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-lg font-medium text-[#1a1a1a] sm:text-xl">
            مرحبا بكم في
          </p>

          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-[#064e3b] sm:text-6xl lg:text-7xl">
            مدرسة غَزتنا
          </h1>
          <div className="mx-auto mt-3 h-1.5 w-48 rounded-full bg-[#064e3b] sm:w-64" />

          <p className="mt-8 text-xl font-bold text-[#1a1a1a] sm:text-2xl">
            التعليم الرقمي بمعايير عالمية
          </p>

          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-[#1a1a1a]/70 sm:text-lg">
            منصة تعليمية حديثة تجمع بين التميز الأكاديمي والتقنية، لبناء جيل
            واعٍ ومبدع في غزة
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row-reverse">
            <Button
              href="/register"
              className="min-w-[180px] rounded-full px-10 py-3.5 text-base"
            >
              ابدأ رحلتك
            </Button>
            <Button
              href="/about"
              variant="outline"
              className="min-w-[180px] rounded-full px-10 py-3.5 text-base"
            >
              تعرّف علينا
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
