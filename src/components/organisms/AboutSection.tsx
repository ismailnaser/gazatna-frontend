"use client";

import { motion } from "framer-motion";
import { Heart, Target } from "lucide-react";
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
          <h2 className="text-2xl font-bold text-p-black sm:text-3xl">من نحن</h2>
          <p className="mx-auto mt-3 max-w-2xl text-p-black/60">
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
            <Card className="h-full">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-p-green/10">
                <Target className="h-5 w-5 text-p-green" />
              </div>
              <h3 className="text-lg font-bold text-p-black">رؤيتنا</h3>
              <p className="mt-2 leading-relaxed text-p-black/60">
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
            <Card className="h-full">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-p-green/10">
                <Heart className="h-5 w-5 text-p-green" />
              </div>
              <h3 className="text-lg font-bold text-p-black">رسالتنا</h3>
              <p className="mt-2 leading-relaxed text-p-black/60">
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
