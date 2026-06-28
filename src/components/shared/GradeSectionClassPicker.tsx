"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  countSelectedInGrade,
  getClassDisplayLabel,
  groupClassesWithGrades,
} from "@/lib/groupClassesByGrade";
import type { Grade, SchoolClass } from "@/types/teacher";

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
  /** ضيق العرض — عمود واحد داخل القوائم المنسدلة */
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
  variant = "default",
}: GradeSectionClassPickerProps) {
  const isDropdown = variant === "dropdown";
  const groups = useMemo(
    () => groupClassesWithGrades(classes, grades),
    [classes, grades]
  );

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

  function selectAllInGrade(sections: SchoolClass[]) {
    const allowed = sections
      .filter((section) => !isSectionDisabled?.(section))
      .map((section) => section.id);
    onChange(Array.from(new Set([...value, ...allowed])));
  }

  function clearGradeSelection(sections: SchoolClass[]) {
    const sectionIds = new Set(sections.map((section) => section.id));
    onChange(value.filter((id) => !sectionIds.has(id)));
  }

  function selectAll() {
    const allowed = classes
      .filter((section) => !isSectionDisabled?.(section))
      .map((section) => section.id);
    onChange(Array.from(new Set(allowed)));
  }

  function clearAll() {
    onChange([]);
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
          isDropdown ? "border-brand-teal/25 bg-white" : "border-transparent bg-brand-teal/10"
        )}
      >
        <p className="text-xs leading-relaxed text-p-black/60">
          اختر مباشرة من القائمة — مثل: التاسع - أ، التاسع - ب...
        </p>
      </div>

      {showBulkActions && mode === "multiple" ? (
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={selectAll}
            className="rounded-lg border border-neutral-200 px-2.5 py-1 font-semibold text-brand-blue hover:bg-brand-blue/5"
          >
            تحديد الكل
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg border border-neutral-200 px-2.5 py-1 font-semibold text-p-black/50 hover:bg-neutral-50"
          >
            إلغاء الكل
          </button>
        </div>
      ) : null}

      <div className="space-y-4">
        {groups.map((group) => {
          const selectedCount = countSelectedInGrade(group.sections, value);

          return (
            <div key={group.grade} className="rounded-xl border border-neutral-100 bg-white p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-p-black">{group.grade}</p>
                {showBulkActions && mode === "multiple" ? (
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => selectAllInGrade(group.sections)}
                      className="rounded-lg border border-neutral-200 px-2 py-0.5 font-semibold text-brand-blue hover:bg-brand-blue/5"
                    >
                      تحديد الكل
                    </button>
                    {selectedCount > 0 ? (
                      <button
                        type="button"
                        onClick={() => clearGradeSelection(group.sections)}
                        className="rounded-lg border border-neutral-200 px-2 py-0.5 font-semibold text-p-black/50 hover:bg-neutral-50"
                      >
                        إلغاء
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className={cn("grid gap-2", isDropdown ? "grid-cols-1" : "sm:grid-cols-2")}>
                {group.sections.map((section) => {
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
                          {getClassDisplayLabel(section)}
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
          );
        })}
      </div>

      {mode === "multiple" && value.length > 0 ? (
        <p className="rounded-lg bg-brand-teal/5 px-3 py-2 text-xs text-brand-teal">
          {value.length} {value.length === 1 ? "شعبة محددة" : "شعب محددة"}
        </p>
      ) : null}

      {mode === "single" && required && value.length === 0 ? (
        <p className="text-xs text-brand-orange">اختر شعبة واحدة من القائمة</p>
      ) : null}
    </div>
  );
}
