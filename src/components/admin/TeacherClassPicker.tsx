"use client";

import { GradeSectionClassPicker } from "@/components/shared/GradeSectionClassPicker";
import type { OccupiedPair } from "@/lib/adminTeacherAssignments";
import { findClassConflict } from "@/lib/adminTeacherAssignments";
import type { Grade, SchoolClass } from "@/types/teacher";

type TeacherClassPickerProps = {
  classes: SchoolClass[];
  grades?: Grade[];
  value: string[];
  onChange: (ids: string[]) => void;
  subjectIds?: string[];
  occupiedPairs?: Map<string, OccupiedPair>;
};

export function TeacherClassPicker({
  classes,
  grades,
  value,
  onChange,
  subjectIds = [],
  occupiedPairs,
}: TeacherClassPickerProps) {
  return (
    <GradeSectionClassPicker
      classes={classes}
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
