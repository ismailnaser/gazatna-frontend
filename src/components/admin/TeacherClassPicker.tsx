"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { GradeSectionClassPicker } from "@/components/shared/GradeSectionClassPicker";
import type { OccupiedPair } from "@/lib/adminTeacherAssignments";
import {
  eligibleClassIdsForSubjects,
  findClassConflict,
} from "@/lib/adminTeacherAssignments";
import type { Grade, SchoolClass, Subject } from "@/types/teacher";

type TeacherClassPickerProps = {
  classes: SchoolClass[];
  grades?: Grade[];
  subjects: Subject[];
  value: string[];
  onChange: (ids: string[]) => void;
  subjectIds?: string[];
  occupiedPairs?: Map<string, OccupiedPair>;
};

export function TeacherClassPicker({
  classes,
  grades,
  subjects,
  value,
  onChange,
  subjectIds = [],
  occupiedPairs,
}: TeacherClassPickerProps) {
  const eligibleClassIds = useMemo(
    () => eligibleClassIdsForSubjects(subjects, subjectIds),
    [subjects, subjectIds]
  );

  const eligibleClasses = useMemo(
    () => classes.filter((schoolClass) => eligibleClassIds.has(schoolClass.id)),
    [classes, eligibleClassIds]
  );

  useEffect(() => {
    const pruned = value.filter((classId) => eligibleClassIds.has(classId));
    if (pruned.length !== value.length) {
      onChange(pruned);
    }
  }, [eligibleClassIds, onChange, value]);

  if (subjectIds.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-5 text-sm text-neutral-500">
        اختر المواد الدراسية أولاً لعرض الفصول والشعب المرتبطة بها.
      </p>
    );
  }

  if (eligibleClasses.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-5 text-sm text-neutral-500">
        لا توجد فصول مسندة للمواد المحددة.{" "}
        <Link href="/admin/subjects" className="font-semibold text-brand-blue hover:underline">
          اسند المواد للفصول من صفحة «المواد الدراسية»
        </Link>
      </p>
    );
  }

  return (
    <GradeSectionClassPicker
      classes={eligibleClasses}
      grades={grades}
      mode="multiple"
      value={value}
      onChange={onChange}
      showBulkActions
      isSectionDisabled={(schoolClass) => {
        if (value.includes(schoolClass.id)) return false;
        if (!subjectIds.length || !occupiedPairs) return false;
        return Boolean(findClassConflict(occupiedPairs, subjectIds, schoolClass.id));
      }}
      getSectionHint={(schoolClass) => {
        if (value.includes(schoolClass.id) || !subjectIds.length || !occupiedPairs) return undefined;
        const conflict = findClassConflict(occupiedPairs, subjectIds, schoolClass.id);
        return conflict ? `مسند للمعلم ${conflict.teacherName}` : undefined;
      }}
    />
  );
}
