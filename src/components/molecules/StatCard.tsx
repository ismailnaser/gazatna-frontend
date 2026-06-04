"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/atoms/Card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  index?: number;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
    >
      <Card className="flex flex-col gap-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            iconBg
          )}
        >
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
          <p className="mt-1 text-sm text-slate-500">{label}</p>
        </div>
      </Card>
    </motion.div>
  );
}
