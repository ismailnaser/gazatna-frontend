"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  default: {
    rail: "bg-brand-blue",
    icon: "bg-brand-blue text-white shadow-[3px_3px_0_0_rgba(249,180,40,0.85)]",
  },
  success: {
    rail: "bg-emerald-600",
    icon: "bg-emerald-600 text-white shadow-[3px_3px_0_0_rgba(75,194,252,0.7)]",
  },
  warning: {
    rail: "bg-brand-yellow",
    icon: "bg-brand-yellow text-p-black shadow-[3px_3px_0_0_rgba(234,102,34,0.75)]",
  },
  danger: {
    rail: "bg-brand-orange",
    icon: "bg-brand-orange text-white shadow-[3px_3px_0_0_rgba(66,76,243,0.55)]",
  },
} as const;

export function HubGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("card-grid", className)}>{children}</div>;
}

export function HubCard({
  href,
  icon: Icon,
  title,
  description,
  meta,
  tone = "default",
  className,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  meta?: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  const palette = tones[tone];

  return (
    <Link
      href={href}
      prefetch={false}
      className={cn("hub-tile group", className)}
    >
      <span className={cn("hub-tile-rail", palette.rail)} />
      <span className="hub-tile-hatch" aria-hidden />
      <span className="hub-tile-shine" aria-hidden />

      <span className={cn("hub-tile-icon", palette.icon)}>
        <Icon className="h-5 w-5" />
      </span>

      <h2 className="font-display mt-4 text-base font-extrabold leading-snug tracking-tight text-p-black">
        {title}
      </h2>
      {description ? (
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-p-black/62">{description}</p>
      ) : null}
      {meta ? <div className="mt-3 text-xs font-semibold text-p-black/55">{meta}</div> : null}

      <span className="hub-tile-arrow">
        <ArrowUpLeft className="h-4 w-4" />
      </span>
    </Link>
  );
}
