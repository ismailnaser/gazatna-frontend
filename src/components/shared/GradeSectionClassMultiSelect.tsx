"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { GradeSectionClassPicker } from "@/components/shared/GradeSectionClassPicker";
import { getGradeLabel, getSectionLabel } from "@/lib/groupClassesByGrade";
import { cn } from "@/lib/utils";
import type { Grade, SchoolClass } from "@/types/teacher";
import { ChevronDown } from "lucide-react";

type GradeSectionClassMultiSelectProps = {
  label?: string;
  classes: SchoolClass[];
  grades?: Grade[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  countLabel?: string;
  className?: string;
};

export function GradeSectionClassMultiSelect({
  label,
  classes,
  grades,
  value,
  onChange,
  placeholder = "جميع الفصول",
  countLabel = "شعب",
  className,
}: GradeSectionClassMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const summary =
    value.length === 0
      ? placeholder
      : value.length === 1
        ? (() => {
            const match = classes.find((cls) => cls.id === value[0]);
            if (!match) return "عنصر واحد";
            return `${getGradeLabel(match)} · ${getSectionLabel(match)}`;
          })()
        : `${value.length} ${countLabel} محددة`;

  return (
    <div ref={rootRef} className={cn("relative flex flex-col gap-1.5", className)}>
      {label ? <span className="text-sm font-medium text-p-black/80">{label}</span> : null}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-p-black",
          open && "border-brand-teal ring-2 ring-brand-teal/15",
          "focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
        )}
      >
        <span className={cn("truncate text-start", value.length === 0 && "text-neutral-500")}>
          {summary}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-neutral-400 transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          className={cn(
            "absolute start-0 top-full z-50 mt-1.5",
            "w-[min(20rem,calc(100vw-2rem))] min-w-[17rem]",
            "max-h-[min(28rem,70vh)] overflow-y-auto",
            "rounded-xl border border-neutral-200 bg-white shadow-xl"
          )}
        >
          <div className="border-b border-neutral-100 bg-neutral-50/80 px-3 py-2.5">
            <p className="text-sm font-bold text-p-black">اختيار الشعب</p>
            <p className="mt-0.5 text-xs leading-relaxed text-p-black/55">
              اختر مباشرة — مثل: التاسع - أ، الأول - ب
            </p>
          </div>

          <div className="p-3">
            <GradeSectionClassPicker
              classes={classes}
              grades={grades}
              mode="multiple"
              value={value}
              onChange={onChange}
              showBulkActions
              variant="dropdown"
            />
          </div>

          <div className="sticky bottom-0 border-t border-neutral-100 bg-white px-3 py-2.5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full rounded-lg bg-brand-blue px-3 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90"
            >
              تم
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
