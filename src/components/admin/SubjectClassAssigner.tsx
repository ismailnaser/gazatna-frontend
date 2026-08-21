"use client";

import { useMemo } from "react";
import { Checkbox } from "@/components/atoms/Checkbox";
import { cn } from "@/lib/utils";
import {
  getClassDisplayLabel,
  groupClassesWithGrades,
} from "@/lib/groupClassesByGrade";
import type { Grade, SchoolClass } from "@/types/teacher";

type SubjectClassAssignerProps = {
  classes: SchoolClass[];
  grades?: Grade[];
  selectedClassIds: string[];
  onChange: (classIds: string[]) => void;
  className?: string;
  emptyMessage?: string;
};

function TriStateCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: (checked: boolean) => void;
}) {
  return <Checkbox checked={checked} indeterminate={indeterminate} onChange={onChange} />;
}

export function SubjectClassAssigner({
  classes,
  grades,
  selectedClassIds,
  onChange,
  className,
  emptyMessage = "لا توجد فصول مسجّلة بعد.",
}: SubjectClassAssignerProps) {
  const groups = useMemo(
    () => groupClassesWithGrades(classes, grades),
    [classes, grades]
  );
  const selected = useMemo(() => new Set(selectedClassIds), [selectedClassIds]);
  const allClassIds = useMemo(() => classes.map((schoolClass) => schoolClass.id), [classes]);

  const allSelected =
    allClassIds.length > 0 && allClassIds.every((classId) => selected.has(classId));
  const someSelected = allClassIds.some((classId) => selected.has(classId));

  if (classes.length === 0 || groups.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-5 text-sm text-neutral-500">
        {emptyMessage}
      </p>
    );
  }

  function toggleClass(classId: string, enabled: boolean) {
    if (enabled) {
      onChange([...new Set([...selectedClassIds, classId])]);
      return;
    }
    onChange(selectedClassIds.filter((id) => id !== classId));
  }

  function toggleAll(enabled: boolean) {
    onChange(enabled ? [...allClassIds] : []);
  }

  function toggleGrade(sections: SchoolClass[], enabled: boolean) {
    const sectionIds = sections.map((schoolClass) => schoolClass.id);
    if (enabled) {
      onChange([...new Set([...selectedClassIds, ...sectionIds])]);
      return;
    }
    onChange(selectedClassIds.filter((id) => !sectionIds.includes(id)));
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-lg border border-brand-teal/25 bg-brand-teal/10 px-3 py-2.5">
        <p className="text-xs leading-relaxed text-p-black/60">
          اختر الفصول والشعب التي تُدرَّس فيها هذه المادة.
        </p>
      </div>

      <label
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5",
          allSelected
            ? "border-brand-teal/40 bg-brand-teal/10"
            : someSelected
              ? "border-brand-teal/25 bg-brand-teal/5"
              : "border-neutral-200 bg-white"
        )}
      >
        <TriStateCheckbox
          checked={allSelected}
          indeterminate={!allSelected && someSelected}
          onChange={toggleAll}
        />
        <span className="font-bold text-p-black">تحديد الكل</span>
        <span className="ms-auto text-xs text-p-black/45">
          {selectedClassIds.length} / {allClassIds.length}
        </span>
      </label>

      {groups.map((group) => {
        const gradeIds = group.sections.map((schoolClass) => schoolClass.id);
        const gradeAllSelected =
          gradeIds.length > 0 && gradeIds.every((classId) => selected.has(classId));
        const gradeSomeSelected = gradeIds.some((classId) => selected.has(classId));

        return (
          <div key={group.grade} className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-50 pb-3">
              <p className="text-sm font-bold text-p-black">{group.grade}</p>
              <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-p-black/75">
                <TriStateCheckbox
                  checked={gradeAllSelected}
                  indeterminate={!gradeAllSelected && gradeSomeSelected}
                  onChange={(checked) => toggleGrade(group.sections, checked)}
                />
                تحديد كل الشعب
              </label>
            </div>
            <div className="space-y-2">
              {group.sections.map((schoolClass) => {
                const enabled = selected.has(schoolClass.id);

                return (
                  <label
                    key={schoolClass.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5",
                      enabled
                        ? "border-brand-teal/30 bg-brand-teal/5"
                        : "border-neutral-200 bg-neutral-50/50"
                    )}
                  >
                    <Checkbox
                      checked={enabled}
                      onChange={(checkedValue) => toggleClass(schoolClass.id, checkedValue)}
                    />
                    <span className="font-semibold text-p-black">
                      {getClassDisplayLabel(schoolClass)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
