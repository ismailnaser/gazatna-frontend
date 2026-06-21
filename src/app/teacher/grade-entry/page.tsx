"use client";

import { useState } from "react";
import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { TeacherAssessmentsGradingPanel } from "@/components/teacher/TeacherAssessmentsGradingPanel";
import { TeacherGradesPanel } from "@/components/teacher/TeacherGradesPanel";
import { cn } from "@/lib/utils";
import { BookOpen, ClipboardList } from "lucide-react";

type EntryUnit = "grading" | "grades";

const ENTRY_UNITS: Array<{
  value: EntryUnit;
  label: string;
  description: string;
  icon: typeof ClipboardList;
}> = [
  {
    value: "grading",
    label: "تقييم الواجبات والاختبارات",
    description: "متابعة التسليمات وتقييم واجبات واختبارات الطلاب",
    icon: ClipboardList,
  },
  {
    value: "grades",
    label: "علامات المواد الدراسية",
    description: "إدخال علامات الطلاب حسب التقسيمة المعتمدة لكل مادة",
    icon: BookOpen,
  },
];

const UNIT_DESCRIPTIONS: Record<EntryUnit, string> = {
  grading: "متابعة تسليمات الطلاب وتقييم الواجبات والاختبارات",
  grades: "إدخال علامات الطلاب في عناصر التقسيمة (نشاط، شهري، نصفي...)",
};

export default function TeacherGradeEntryPage() {
  const [unit, setUnit] = useState<EntryUnit | null>(null);

  return (
    <div className="space-y-4">
      <PageHeader
        title="إضافة التقييمات والعلامات للطلاب"
        description={unit ? UNIT_DESCRIPTIONS[unit] : "اختر نوع الإدخال ثم أكمل العمل في الواجهة المخصصة له"}
        className="mb-4"
      />

      <Card className="space-y-4 p-4 sm:p-6">
        <div>
          <h2 className="text-sm font-bold text-p-black">نوع الإدخال</h2>
          <p className="mt-1 text-xs text-p-black/50">
            اختر وحدة واحدة — التقييمات أو علامات المواد — لتظهر الواجهة المناسبة.
          </p>
        </div>

        <div className="rounded-lg border border-brand-teal/25 bg-white px-3 py-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-brand-teal">الخطوة ١</p>
          <p className="mt-0.5 text-sm font-semibold text-p-black">اختر الوحدة</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {ENTRY_UNITS.map((option) => {
            const Icon = option.icon;
            const active = unit === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setUnit(option.value)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-start transition-all sm:px-4 sm:py-4",
                  active
                    ? "border-brand-teal bg-brand-teal/5 shadow-sm"
                    : "border-neutral-200 bg-white hover:border-brand-teal/25"
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    active ? "bg-brand-teal/15 text-brand-teal" : "bg-neutral-50 text-p-black/45"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-p-black">{option.label}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-p-black/50">
                    {option.description}
                  </span>
                </span>
                <span
                  className={cn(
                    "mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                    active ? "border-brand-teal bg-brand-teal" : "border-neutral-300 bg-white"
                  )}
                >
                  {active ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                </span>
              </button>
            );
          })}
        </div>

        {unit ? (
          <p className="rounded-lg bg-brand-teal/5 px-3 py-2 text-xs text-brand-teal">
            الوحدة النشطة: {ENTRY_UNITS.find((item) => item.value === unit)?.label}
          </p>
        ) : (
          <p className="text-xs text-brand-orange">اختر وحدة للمتابعة</p>
        )}
      </Card>

      {unit === "grading" ? <TeacherAssessmentsGradingPanel /> : null}
      {unit === "grades" ? <TeacherGradesPanel mode="entry" /> : null}
    </div>
  );
}
