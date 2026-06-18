"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Subject } from "@/types/teacher";

type TeacherSubjectPickerProps = {
  subjects: Subject[];
  value: string[];
  onChange: (ids: string[]) => void;
};

export function TeacherSubjectPicker({ subjects, value, onChange }: TeacherSubjectPickerProps) {
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
        return (
          <label
            key={subject.id}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
              checked
                ? "border-brand-teal bg-brand-teal/10 text-brand-teal shadow-sm"
                : "border-neutral-200 bg-white text-p-black/70 hover:border-brand-teal/30"
            )}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(subject.id)}
              className="accent-brand-teal"
            />
            {subject.name}
          </label>
        );
      })}
    </div>
  );
}
