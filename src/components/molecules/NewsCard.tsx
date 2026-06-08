"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/atoms/Card";
import { cn } from "@/lib/utils";

type NewsCardProps = {
  title: string;
  gradient: string;
  index?: number;
};

export function NewsCard({ title, gradient, index = 0 }: NewsCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="group overflow-hidden p-0 transition-shadow hover:shadow-md">
        <div
          className={cn(
            "relative flex h-44 items-end bg-gradient-to-br p-5",
            gradient
          )}
        >
          <span className="absolute inset-0 bg-black/10" />
          <span className="relative text-xs font-medium text-white/90">
            أخبار المدرسة
          </span>
        </div>
        <div className="flex items-start justify-between gap-3 p-5">
          <h3 className="text-base font-bold leading-snug text-p-black">
            {title}
          </h3>
          <span className="mt-1 shrink-0 text-p-green transition-transform group-hover:-translate-x-1">
            <ArrowLeft className="h-4 w-4" />
          </span>
        </div>
      </Card>
    </motion.article>
  );
}
