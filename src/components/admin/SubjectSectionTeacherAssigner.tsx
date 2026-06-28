"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  getClassDisplayLabel,
  groupClassesWithGrades,
} from "@/lib/groupClassesByGrade";
import type { Grade, SchoolClass, TeacherProfile } from "@/types/teacher";

export type SubjectSectionDraft = {
  enabled: boolean;
  teacherId: string;
};

export type SubjectSectionTeacherAssignerProps = {
  classes: SchoolClass[];
  grades?: Grade[];
  teachers: TeacherProfile[];
  sectionDrafts: Record<string, SubjectSectionDraft>;
  onChange: (classId: string, patch: Partial<SubjectSectionDraft>) => void;
  className?: string;
  emptyMessage?: string;
};

export function buildSubjectSectionDrafts(
  allClasses: SchoolClass[],
  subjectClassIds: string[],
  teachers: TeacherProfile[],
  subjectName: string
): Record<string, SubjectSectionDraft> {
  const classTeacherMap: Record<string, string> = {};
  for (const teacher of teachers) {
    const classIds = teacher.subjectClassIds?.[subjectName] ?? [];
    for (const classId of classIds) {
      classTeacherMap[classId] = teacher.id;
    }
  }

  const enabledSet = new Set(subjectClassIds);
  const drafts: Record<string, SubjectSectionDraft> = {};
  for (const schoolClass of allClasses) {
    drafts[schoolClass.id] = {
      enabled: enabledSet.has(schoolClass.id),
      teacherId: classTeacherMap[schoolClass.id] ?? "",
    };
  }
  return drafts;
}

export function sectionDraftsToPayload(
  drafts: Record<string, SubjectSectionDraft>
): Array<{ classId: string; teacherId: string | null }> {
  return Object.entries(drafts)
    .filter(([, draft]) => draft.enabled)
    .map(([classId, draft]) => ({
      classId,
      teacherId: draft.teacherId.trim() ? draft.teacherId : null,
    }));
}

export function SubjectSectionTeacherAssigner({
  classes,
  grades,
  teachers,
  sectionDrafts,
  onChange,
  className,
  emptyMessage = "لا توجد فصول مسجّلة بعد.",
}: SubjectSectionTeacherAssignerProps) {
  const groups = useMemo(
    () => groupClassesWithGrades(classes, grades),
    [classes, grades]
  );

  const sortedTeachers = useMemo(
    () => [...teachers].sort((a, b) => a.name.localeCompare(b.name, "ar")),
    [teachers]
  );

  if (classes.length === 0 || groups.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-5 text-sm text-neutral-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-lg border border-brand-teal/25 bg-brand-teal/10 px-3 py-2.5">
        <p className="text-xs leading-relaxed text-p-black/60">
          فعّل الشعب التي تُدرَّس فيها المادة، ثم اختر المعلم من القائمة بجانب كل شعبة.
        </p>
      </div>

      {groups.map((group) => (
        <div key={group.grade} className="rounded-xl border border-neutral-100 bg-white p-3">
          <p className="mb-3 text-sm font-bold text-p-black">{group.grade}</p>
          <div className="space-y-2">
            {group.sections.map((schoolClass) => {
              const draft = sectionDrafts[schoolClass.id] ?? { enabled: false, teacherId: "" };

              return (
                <div
                  key={schoolClass.id}
                  className={cn(
                    "flex flex-col gap-2 rounded-xl border px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3",
                    draft.enabled
                      ? "border-brand-teal/30 bg-brand-teal/5"
                      : "border-neutral-200 bg-neutral-50/50"
                  )}
                >
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={draft.enabled}
                      onChange={(event) =>
                        onChange(schoolClass.id, {
                          enabled: event.target.checked,
                          ...(event.target.checked ? {} : { teacherId: "" }),
                        })
                      }
                      className="h-4 w-4 shrink-0 accent-brand-teal"
                    />
                    <span className="font-semibold text-p-black">
                      {getClassDisplayLabel(schoolClass)}
                    </span>
                  </label>

                  <div className="w-full sm:max-w-[14rem] sm:shrink-0">
                    <select
                      value={draft.teacherId}
                      disabled={!draft.enabled || sortedTeachers.length === 0}
                      aria-label={`المعلم — ${getClassDisplayLabel(schoolClass)}`}
                      onChange={(event) =>
                        onChange(schoolClass.id, { teacherId: event.target.value })
                      }
                      className={cn(
                        "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-p-black",
                        "focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20",
                        "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-p-black/45"
                      )}
                    >
                      <option value="">
                        {sortedTeachers.length === 0 ? "لا يوجد معلمون" : "اختر المعلم..."}
                      </option>
                      {sortedTeachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
