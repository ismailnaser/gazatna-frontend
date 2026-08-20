"use client";

import { useEffect, useMemo, useState } from "react";
import { Select } from "@/components/atoms/Select";
import {
  getGradeLabel,
  getSectionLabel,
  groupClassesWithGrades,
} from "@/lib/groupClassesByGrade";
import type { Grade, SchoolClass } from "@/types/teacher";

type GradeThenSectionSelectProps = {
  classes: SchoolClass[];
  grades?: Grade[];
  value?: string;
  onChange?: (classId: string) => void;
  name?: string;
  required?: boolean;
  labelGrade?: string;
  labelSection?: string;
  disabled?: boolean;
  emptyMessage?: string;
};

/**
 * Cascading pickers: choose grade first, then only sections in that grade.
 * Writes selected school-class id to a hidden input (default name=classId).
 */
export function GradeThenSectionSelect({
  classes,
  grades,
  value = "",
  onChange,
  name = "classId",
  required = false,
  labelGrade = "الفصل / المرحلة",
  labelSection = "الشعبة",
  disabled = false,
  emptyMessage = "لا توجد فصول مسجّلة بعد.",
}: GradeThenSectionSelectProps) {
  const groups = useMemo(() => groupClassesWithGrades(classes, grades), [classes, grades]);

  const initialGrade = useMemo(() => {
    if (!value) return "";
    const cls = classes.find((c) => c.id === value);
    return cls ? getGradeLabel(cls) : "";
  }, [value, classes]);

  const [gradeName, setGradeName] = useState(initialGrade);
  const [classId, setClassId] = useState(value);

  useEffect(() => {
    setGradeName(initialGrade);
    setClassId(value);
  }, [initialGrade, value]);

  const gradeOptions = useMemo(
    () => [
      { value: "", label: "اختر المرحلة أولاً" },
      ...groups.map((g) => ({
        value: g.grade,
        label: g.grade,
      })),
    ],
    [groups]
  );

  const sectionOptions = useMemo(() => {
    const group = groups.find((g) => g.grade === gradeName);
    const sections = group?.sections ?? [];
    return [
      { value: "", label: gradeName ? "اختر الشعبة" : "اختر المرحلة أولاً" },
      ...sections.map((s) => ({
        value: s.id,
        label: getSectionLabel(s),
      })),
    ];
  }, [groups, gradeName]);

  function handleGradeChange(next: string) {
    setGradeName(next);
    setClassId("");
    onChange?.("");
  }

  function handleSectionChange(next: string) {
    setClassId(next);
    onChange?.(next);
  }

  if (classes.length === 0) {
    return <p className="text-sm text-neutral-700">{emptyMessage}</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name={name} value={classId} />
      <Select
        label={labelGrade}
        options={gradeOptions}
        value={gradeName}
        disabled={disabled}
        required={required}
        onChange={(e) => handleGradeChange(e.target.value)}
      />
      <Select
        label={labelSection}
        options={sectionOptions}
        value={classId}
        disabled={disabled || !gradeName}
        required={required}
        onChange={(e) => handleSectionChange(e.target.value)}
      />
    </div>
  );
}
