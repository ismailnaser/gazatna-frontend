"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { OccupiedPair } from "@/lib/adminTeacherAssignments";
import { findSubjectConflict } from "@/lib/adminTeacherAssignments";
import type { Subject } from "@/types/teacher";

type TeacherSubjectPickerProps = {
  subjects: Subject[];
  value: string[];
  onChange: (ids: string[]) => void;
  classIds?: string[];
  occupiedPairs?: Map<string, OccupiedPair>;
};

export function TeacherSubjectPicker({
  subjects,
  value,
  onChange,
  classIds = [],
  occupiedPairs,
}: TeacherSubjectPickerProps) {
  function toggle(subjectId: string) {
    onChange(value.includes(subjectId) ? value.filter((id) => id !== subjectId) : [...value, subjectId]);
  }

  if (subjects.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-5 text-sm text-neutral-500">
        لا توجد مواد مسجّلة.{" "}
        <Link href="/admin/subjects" className="font-semibold text-brand-blue hover:underline">
          أضف المواد أولاً
        </Link>
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {subjects.map((subject) => {
        const checked = value.includes(subject.id);
        const conflict =
          !checked && classIds.length > 0 && occupiedPairs
            ? findSubjectConflict(occupiedPairs, classIds, subject.id)
            : undefined;
        const disabled = Boolean(conflict);

        return (
          <label
            key={subject.id}
            title={
              conflict
                ? `مسندة للمعلم ${conflict.teacherName} — لا يمكن إسناد نفس المادة والفصل لمعلم آخر`
                : undefined
            }
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
              disabled
                ? "cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400 opacity-70"
                : "cursor-pointer",
              !disabled && checked
                ? "border-brand-teal bg-brand-teal/10 text-brand-teal shadow-sm"
                : !disabled && "border-neutral-200 bg-white text-p-black/70 hover:border-brand-teal/30"
            )}
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={() => {
                if (!disabled) toggle(subject.id);
              }}
              className="accent-brand-teal disabled:cursor-not-allowed"
            />
            {subject.name}
          </label>
        );
      })}
    </div>
  );
}
