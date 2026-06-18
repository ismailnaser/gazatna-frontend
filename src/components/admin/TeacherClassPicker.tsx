"use client";

import { cn } from "@/lib/utils";
import type { SchoolClass } from "@/types/teacher";
import { Users } from "lucide-react";

type TeacherClassPickerProps = {
  classes: SchoolClass[];
  value: string[];
  onChange: (ids: string[]) => void;
};

export function TeacherClassPicker({ classes, value, onChange }: TeacherClassPickerProps) {
  function toggle(classId: string) {
    onChange(value.includes(classId) ? value.filter((id) => id !== classId) : [...value, classId]);
  }

  if (classes.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-5 text-sm text-neutral-500">
        لا توجد فصول مسجّلة بعد.
      </p>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {classes.map((schoolClass) => {
        const checked = value.includes(schoolClass.id);
        return (
          <label
            key={schoolClass.id}
            className={cn(
              "flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all",
              checked
                ? "border-brand-teal bg-brand-teal/5 shadow-sm"
                : "border-neutral-200 bg-white hover:border-brand-teal/25"
            )}
          >
            <div className="min-w-0">
              <p className="font-semibold text-p-black">{schoolClass.name}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-p-black/50">
                <Users className="h-3.5 w-3.5" />
                {schoolClass.studentCount} طالب
              </p>
            </div>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(schoolClass.id)}
              className="h-4 w-4 shrink-0 rounded accent-brand-teal"
            />
          </label>
        );
      })}
    </div>
  );
}
