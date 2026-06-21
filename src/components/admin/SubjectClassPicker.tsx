"use client";

import { GradeSectionClassPicker } from "@/components/shared/GradeSectionClassPicker";
import type { Grade, SchoolClass } from "@/types/teacher";

type SubjectClassPickerProps = {
  classes: SchoolClass[];
  grades?: Grade[];
  value: string[];
  onChange: (ids: string[]) => void;
  resetKey?: string;
};

export function SubjectClassPicker({
  classes,
  grades,
  value,
  onChange,
  resetKey,
}: SubjectClassPickerProps) {
  return (
    <GradeSectionClassPicker
      classes={classes}
      grades={grades}
      mode="multiple"
      value={value}
      onChange={onChange}
      showBulkActions
      resetKey={resetKey}
    />
  );
}
