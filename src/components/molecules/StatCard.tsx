"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  index?: number;
};

const BLOBS = [
  "42% 58% 38% 62% / 48% 38% 62% 52%",
  "58% 42% 62% 38% / 42% 58% 42% 58%",
  "38% 62% 52% 48% / 62% 38% 58% 42%",
  "52% 48% 42% 58% / 38% 62% 48% 52%",
];

const CRAYONS = [
  { fill: "#FFF4C8", stroke: "#EA6622", mark: "#F9B428" },
  { fill: "#DCEBFF", stroke: "#424CF3", mark: "#4BC2FC" },
  { fill: "#FFE4D4", stroke: "#EA6622", mark: "#F87050" },
  { fill: "#E4F8D8", stroke: "#2F9E44", mark: "#7BC47F" },
];

export function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  index = 0,
}: StatCardProps) {
  const blob = BLOBS[index % BLOBS.length];
  const crayon = CRAYONS[index % CRAYONS.length];

  return (
    <motion.article
      initial={{ opacity: 0, rotate: -2, y: 16 }}
      whileInView={{ opacity: 1, rotate: index % 2 === 0 ? -1.4 : 1.6, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="crayon-stat relative overflow-hidden px-6 py-7 text-center"
      style={{
        borderRadius: blob,
        background: crayon.fill,
        boxShadow: `-5px 7px 0 0 ${crayon.stroke}33`,
        border: `3px solid ${crayon.stroke}`,
      }}
    >
      <span className="crayon-scribble" style={{ background: crayon.mark }} />
      <div
        className={cn(
          "relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[1.4rem] rotate-[-8deg] border-[3px] border-black/10",
          iconBg
        )}
      >
        <Icon className={cn("h-7 w-7", iconColor)} />
      </div>
      <p className="font-display relative text-4xl font-extrabold tracking-tight text-p-black sm:text-5xl">
        {value}
      </p>
      <p className="relative mt-2 text-sm font-bold text-p-black/70">{label}</p>
    </motion.article>
  );
}
