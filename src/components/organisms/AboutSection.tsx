"use client";

import { motion } from "framer-motion";
import { Heart, Sparkles, Target } from "lucide-react";
import { Card } from "@/components/atoms/Card";

export function AboutSection() {
  return (
    <section id="من-نحن" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-yellow shadow-[-3px_3px_0_0_rgba(234,102,34,0.4)]">
            <Sparkles className="h-5 w-5 text-p-black" />
          </span>
          <h2 className="font-display text-2xl font-extrabold text-brand-blue sm:text-3xl">من نحن</h2>
          <p className="mx-auto mt-3 max-w-2xl font-semibold text-p-black/75">
            مدرسة غَزتنا مؤسسة تعليمية رقمية تهدف إلى تمكين الطلاب من خلال بيئة
            تعلم آمنة، مبتكرة، ومتصلة بالمستقبل.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="h-full bg-brand-yellow/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-white shadow-[-3px_3px_0_0_rgba(66,76,243,0.25)]">
                <Target className="h-5 w-5 text-brand-blue" />
              </div>
              <h3 className="font-display text-lg font-extrabold text-p-black">رؤيتنا</h3>
              <p className="mt-2 font-semibold leading-relaxed text-p-black/75">
                أن نكون المدرسة الرقمية الرائدة في فلسطين، نُخرّج جيلاً قادراً
                على المنافسة عالمياً مع الحفاظ على الهوية والقيم.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="h-full bg-[#ffe8d8]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-white shadow-[-3px_3px_0_0_rgba(234,102,34,0.3)]">
                <Heart className="h-5 w-5 text-brand-orange" />
              </div>
              <h3 className="font-display text-lg font-extrabold text-p-black">رسالتنا</h3>
              <p className="mt-2 font-semibold leading-relaxed text-p-black/75">
                توفير تعليم عالي الجودة يجمع بين المناهج الأكاديمية والمهارات
                الرقمية، مع دعم شامل لأولياء الأمور والمجتمع.
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
