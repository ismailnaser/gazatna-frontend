"use client";

import { cn } from "@/lib/utils";
import { BookOpen, ClipboardList, GraduationCap } from "lucide-react";

export type ClassTab = "grades" | "homework" | "quizzes";

const tabs: { id: ClassTab; label: string; icon: typeof GraduationCap }[] = [
  { id: "grades", label: "العلامات", icon: GraduationCap },
  { id: "homework", label: "الواجبات", icon: BookOpen },
  { id: "quizzes", label: "الاختبارات", icon: ClipboardList },
];

export function ClassDetailTabs({
  active,
  onChange,
  counts,
}: {
  active: ClassTab;
  onChange: (tab: ClassTab) => void;
  counts?: Partial<Record<ClassTab, number>>;
}) {
  return (
    <div className="mb-5 grid grid-cols-3 gap-1.5 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-1.5">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-[11px] font-semibold transition-colors sm:flex-row sm:gap-1.5 sm:px-3 sm:text-sm",
            active === id
              ? "bg-white text-brand-blue shadow-sm ring-1 ring-neutral-200"
              : "text-neutral-600 hover:bg-white/60 hover:text-neutral-900"
          )}
        >
          <span className="inline-flex items-center gap-1">
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </span>
          {counts?.[id] != null && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] sm:text-xs",
                active === id ? "bg-brand-blue/10 text-brand-blue" : "bg-neutral-200 text-neutral-600"
              )}
            >
              {counts[id]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
