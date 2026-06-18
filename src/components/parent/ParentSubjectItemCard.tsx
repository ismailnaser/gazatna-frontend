"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ExpandableText } from "@/components/molecules/ExpandableText";
import { ACADEMIC_DESCRIPTION_CLASS } from "@/lib/expandableText";
import { cn } from "@/lib/utils";

type SubjectCardTone = "homework" | "quiz" | "announcement" | "material";

const toneStyles: Record<
  SubjectCardTone,
  { bar: string; icon: string; label: string }
> = {
  homework: {
    bar: "bg-brand-orange",
    icon: "bg-brand-orange/10 text-brand-orange",
    label: "واجب",
  },
  quiz: {
    bar: "bg-brand-blue",
    icon: "bg-brand-blue/10 text-brand-blue",
    label: "اختبار",
  },
  announcement: {
    bar: "bg-amber-500",
    icon: "bg-amber-100 text-amber-700",
    label: "إعلان",
  },
  material: {
    bar: "bg-p-green",
    icon: "bg-p-green/10 text-p-green",
    label: "مرفق",
  },
};

function SubjectCardShell({
  tone,
  icon: Icon,
  typeLabel,
  dateLabel,
  title,
  description,
  meta,
  footer,
  href,
  className,
}: {
  tone: SubjectCardTone;
  icon: LucideIcon;
  typeLabel?: string;
  dateLabel: string;
  title: string;
  description?: string | null;
  meta?: React.ReactNode;
  footer?: React.ReactNode;
  href?: string;
  className?: string;
}) {
  const styles = toneStyles[tone];
  const label = typeLabel ?? styles.label;

  const card = (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-shadow",
        href && "hover:shadow-md",
        className
      )}
    >
      <div className="flex">
        <div className={cn("w-1 shrink-0", styles.bar)} aria-hidden />
        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between gap-2 border-b border-neutral-100 bg-neutral-50/60 px-3 py-2.5 sm:px-4">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  styles.icon
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold text-p-black">{label}</span>
            </div>
            <time className="shrink-0 text-[11px] text-p-black/45">{dateLabel}</time>
          </header>

          <div className="space-y-3 px-3 py-3 sm:px-4 sm:py-4">
            <div>
              <h3 className="text-base font-bold leading-snug text-p-black">{title}</h3>
              {description ? (
                tone === "material" ? (
                  <ExpandableText maxLines={3} className="mt-1.5 text-sm text-p-black/65">
                    {description}
                  </ExpandableText>
                ) : (
                  <p className={ACADEMIC_DESCRIPTION_CLASS}>{description}</p>
                )
              ) : null}
            </div>
            {meta}
          </div>

          {footer ? (
            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 bg-neutral-50/40 px-3 py-2.5 sm:px-4">
              {footer}
            </footer>
          ) : null}
        </div>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    );
  }

  return card;
}

export { DateMetaGrid as SubjectMetaGrid } from "@/components/molecules/DateMetaGrid";

export { SubjectCardShell };
