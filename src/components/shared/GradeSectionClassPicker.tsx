"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  countSelectedInGrade,
  getSectionLabel,
  groupClassesWithGrades,
} from "@/lib/groupClassesByGrade";
import type { Grade, SchoolClass } from "@/types/teacher";
import { ChevronRight, GraduationCap } from "lucide-react";

export type GradeSectionClassPickerProps = {
  classes: SchoolClass[];
  grades?: Grade[];
  mode?: "multiple" | "single";
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  required?: boolean;
  emptyMessage?: string;
  isSectionDisabled?: (schoolClass: SchoolClass) => boolean;
  getSectionHint?: (schoolClass: SchoolClass) => string | undefined;
  showBulkActions?: boolean;
  formFieldName?: string;
  className?: string;
  resetKey?: string;
  /** ضيق العرض — عمود واحد ونص واضح داخل القوائم المنسدلة */
  variant?: "default" | "dropdown";
};

export function GradeSectionClassPicker({
  classes,
  grades,
  mode = "multiple",
  value,
  onChange,
  label,
  required = false,
  emptyMessage = "لا توجد فصول مسجّلة بعد.",
  isSectionDisabled,
  getSectionHint,
  showBulkActions = mode === "multiple",
  formFieldName,
  className,
  resetKey,
  variant = "default",
}: GradeSectionClassPickerProps) {
  const isDropdown = variant === "dropdown";
  const groups = useMemo(
    () => groupClassesWithGrades(classes, grades),
    [classes, grades]
  );

  const [step, setStep] = useState<"grades" | "sections">("grades");
  const [activeGrade, setActiveGrade] = useState<string | null>(null);

  useEffect(() => {
    setStep("grades");
    setActiveGrade(null);
  }, [resetKey]);

  const activeGroup = useMemo(
    () => (activeGrade ? groups.find((group) => group.grade === activeGrade) ?? null : null),
    [activeGrade, groups]
  );

  function openGrade(gradeName: string) {
    setActiveGrade(gradeName);
    setStep("sections");
  }

  function backToGrades() {
    setStep("grades");
    setActiveGrade(null);
  }

  function toggleSection(classId: string) {
    const section = classes.find((cls) => cls.id === classId);
    if (!section || isSectionDisabled?.(section)) return;

    if (mode === "single") {
      onChange([classId]);
      return;
    }

    onChange(
      value.includes(classId) ? value.filter((id) => id !== classId) : [...value, classId]
    );
  }

  function selectAllInGrade() {
    if (!activeGroup) return;
    const allowed = activeGroup.sections
      .filter((section) => !isSectionDisabled?.(section))
      .map((section) => section.id);
    onChange(Array.from(new Set([...value, ...allowed])));
  }

  function clearGradeSelection() {
    if (!activeGroup) return;
    const sectionIds = new Set(activeGroup.sections.map((section) => section.id));
    onChange(value.filter((id) => !sectionIds.has(id)));
  }

  if (classes.length === 0 || groups.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-5 text-sm text-neutral-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {label ? (
        <p className="text-sm font-medium text-p-black/80">
          {label}
          {required ? <span className="text-brand-orange"> *</span> : null}
        </p>
      ) : null}

      {formFieldName === "classId" ? (
        <input type="hidden" name="classId" value={value[0] ?? ""} />
      ) : null}
      {formFieldName === "classIds"
        ? value.map((id) => <input key={id} type="hidden" name="classIds" value={id} />)
        : null}

      <div
        className={cn(
          "rounded-lg border px-3 py-2.5",
          isDropdown
            ? "border-brand-teal/25 bg-white"
            : "border-transparent bg-brand-teal/10"
        )}
      >
        <p className="text-[11px] font-bold uppercase tracking-wide text-brand-teal">
          {step === "grades" ? "الخطوة ١" : "الخطوة ٢"}
        </p>
        <p
          className={cn(
            "mt-0.5 font-semibold leading-snug text-p-black",
            isDropdown ? "text-sm" : "text-xs text-brand-teal"
          )}
        >
          {step === "grades"
            ? "اختر الفصل الدراسي"
            : `اختر الشعبة — ${activeGrade}`}
        </p>
        {step === "grades" && isDropdown ? (
          <p className="mt-1 text-xs leading-relaxed text-p-black/55">
            مثال: الصف التاسع، الصف الأول...
          </p>
        ) : null}
      </div>

      {step === "grades" ? (
        <div className={cn("grid gap-2", isDropdown ? "grid-cols-1" : "sm:grid-cols-2")}>
          {groups.map((group) => {
            const selectedCount = countSelectedInGrade(group.sections, value);
            return (
              <button
                key={group.grade}
                type="button"
                onClick={() => openGrade(group.grade)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-start transition-all sm:px-4 sm:py-3",
                  selectedCount > 0
                    ? "border-brand-teal bg-brand-teal/5 shadow-sm"
                    : "border-neutral-200 bg-white hover:border-brand-teal/25"
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="flex items-start gap-2 font-semibold text-p-black">
                    <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal" />
                    <span className={cn(isDropdown ? "leading-snug" : "truncate")}>{group.grade}</span>
                  </p>
                  <p className="mt-1 ps-6 text-xs leading-relaxed text-p-black/60">
                    {group.sections.length}{" "}
                    {group.sections.length === 1 ? "شعبة" : "شعب"}
                    {selectedCount > 0 ? ` · ${selectedCount} محددة` : ""}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-p-black/30" />
              </button>
            );
          })}
        </div>
      ) : activeGroup ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={backToGrades}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
          >
            <ChevronRight className="h-4 w-4" />
            العودة لقائمة الفصول
          </button>

          <div className="rounded-xl border border-neutral-100 bg-white p-3">
            {showBulkActions && mode === "multiple" ? (
              <div className="mb-3 flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectAllInGrade}
                  className="rounded-lg border border-neutral-200 px-2.5 py-1 font-semibold text-brand-blue hover:bg-brand-blue/5"
                >
                  تحديد كل الشعب
                </button>
                <button
                  type="button"
                  onClick={clearGradeSelection}
                  className="rounded-lg border border-neutral-200 px-2.5 py-1 font-semibold text-p-black/50 hover:bg-neutral-50"
                >
                  إلغاء تحديد الشعب
                </button>
              </div>
            ) : null}

            <div className={cn("grid gap-2", isDropdown ? "grid-cols-1" : "sm:grid-cols-2")}>
              {activeGroup.sections.map((section) => {
                const checked = value.includes(section.id);
                const disabled = Boolean(isSectionDisabled?.(section));
                const hint = getSectionHint?.(section);

                return (
                  <label
                    key={section.id}
                    title={hint}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-all sm:px-4 sm:py-3",
                      disabled
                        ? "cursor-not-allowed border-neutral-200 bg-neutral-50 opacity-60"
                        : "cursor-pointer",
                      !disabled && checked
                        ? "border-brand-teal bg-brand-teal/5 shadow-sm"
                        : !disabled && "border-neutral-200 bg-white hover:border-brand-teal/25"
                    )}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-p-black">
                        شعبة {getSectionLabel(section)}
                      </p>
                      {hint ? <p className="mt-1 text-xs text-p-red">{hint}</p> : null}
                    </div>
                    <input
                      type={mode === "single" ? "radio" : "checkbox"}
                      name={mode === "single" ? formFieldName ?? "classId" : undefined}
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleSection(section.id)}
                      className="h-4 w-4 shrink-0 accent-brand-teal disabled:cursor-not-allowed"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {mode === "multiple" && value.length > 0 ? (
        <p className="rounded-lg bg-brand-teal/5 px-3 py-2 text-xs text-brand-teal">
          {value.length} {value.length === 1 ? "شعبة محددة" : "شعب محددة"}
        </p>
      ) : null}

      {mode === "single" && required && value.length === 0 ? (
        <p className="text-xs text-brand-orange">اختر الفصل ثم الشعبة</p>
      ) : null}
    </div>
  );
}
