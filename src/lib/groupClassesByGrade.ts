import type { Grade, SchoolClass } from "@/types/teacher";

export type GradeClassGroup = {
  grade: string;
  sections: SchoolClass[];
};

const NAME_SPLIT = /\s*[-–—]\s*/;

export function getGradeLabel(cls: SchoolClass): string {
  if (cls.gradeLevel?.trim()) return cls.gradeLevel.trim();

  const parts = cls.name.split(NAME_SPLIT).map((part) => part.trim()).filter(Boolean);
  if (parts.length > 1) return parts[0];

  return cls.name.trim();
}

export function getSectionLabel(cls: SchoolClass): string {
  if (cls.section?.trim()) return cls.section.trim();

  const parts = cls.name.split(NAME_SPLIT).map((part) => part.trim()).filter(Boolean);
  if (parts.length > 1) return parts[parts.length - 1];

  return cls.name.trim();
}

export function classBelongsToGrade(cls: SchoolClass, gradeName: string): boolean {
  const target = gradeName.trim();
  if (cls.gradeLevel?.trim() === target) return true;
  return getGradeLabel(cls) === target;
}

export function groupClassesByGrade(classes: SchoolClass[]): GradeClassGroup[] {
  const map = new Map<string, SchoolClass[]>();

  for (const cls of classes) {
    const grade = getGradeLabel(cls);
    const list = map.get(grade) ?? [];
    list.push(cls);
    map.set(grade, list);
  }

  return Array.from(map.entries())
    .map(([grade, sections]) => ({
      grade,
      sections: sections.sort((a, b) =>
        getSectionLabel(a).localeCompare(getSectionLabel(b), "ar")
      ),
    }))
    .sort((a, b) => a.grade.localeCompare(b.grade, "ar"));
}

export function groupClassesWithGrades(
  classes: SchoolClass[],
  grades?: Grade[]
): GradeClassGroup[] {
  const sortedGrades = grades?.length
    ? [...grades].sort(
        (a, b) =>
          (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
          a.name.localeCompare(b.name, "ar")
      )
    : null;

  if (sortedGrades?.length) {
    const fromGrades = sortedGrades
      .map((grade) => ({
        grade: grade.name,
        sections: classes
          .filter((cls) => classBelongsToGrade(cls, grade.name))
          .sort((a, b) => getSectionLabel(a).localeCompare(getSectionLabel(b), "ar")),
      }))
      .filter((group) => group.sections.length > 0);

    if (fromGrades.length > 0) return fromGrades;
  }

  return groupClassesByGrade(classes);
}

export function countSelectedInGrade(sections: SchoolClass[], selectedIds: string[]): number {
  return sections.filter((section) => selectedIds.includes(section.id)).length;
}

export function findGradeForClassId(classes: SchoolClass[], classId: string): string | null {
  const match = classes.find((cls) => cls.id === classId);
  return match ? getGradeLabel(match) : null;
}
