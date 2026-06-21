"use client";

import { useState } from "react";
import { GradeSectionClassPicker } from "@/components/shared/GradeSectionClassPicker";
import type { Grade, SchoolClass } from "@/types/teacher";

export function ClassSelect({
  classes,
  grades,
  multiple = false,
  defaultValue,
  defaultSelected,
  required = true,
}: {
  classes: SchoolClass[];
  grades?: Grade[];
  multiple?: boolean;
  defaultValue?: string;
  defaultSelected?: string[];
  required?: boolean;
}) {
  const [selected, setSelected] = useState<string[]>(
    defaultSelected ?? (defaultValue ? [defaultValue] : multiple ? classes.map((cls) => cls.id) : [])
  );

  return (
    <GradeSectionClassPicker
      classes={classes}
      grades={grades}
      mode={multiple ? "multiple" : "single"}
      value={selected}
      onChange={setSelected}
      label={multiple ? "الفصول" : "الفصل والشعبة"}
      required={required}
      showBulkActions={multiple}
      formFieldName={multiple ? "classIds" : "classId"}
    />
  );
}

export function getSelectedClassIds(form: FormData): string[] {
  return form.getAll("classIds").map(String).filter(Boolean);
}
