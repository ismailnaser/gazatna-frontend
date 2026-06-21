import type { Grade, SchoolClass } from "@/types/teacher";

export function mapSchoolClass(raw: Record<string, unknown>): SchoolClass {
  const gradeLevelRaw = raw.gradeLevel ?? raw.grade_level;
  const sectionRaw = raw.section;
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    gradeLevel: gradeLevelRaw ? String(gradeLevelRaw).trim() : undefined,
    section: sectionRaw ? String(sectionRaw).trim() : undefined,
    studentCount: Number(raw.studentCount ?? raw.student_count ?? 0),
    homeroomTeacherId:
      raw.homeroomTeacherId != null
        ? String(raw.homeroomTeacherId)
        : raw.homeroom_teacher != null
          ? String(raw.homeroom_teacher)
          : null,
    homeroomTeacherName:
      raw.homeroomTeacherName != null
        ? String(raw.homeroomTeacherName)
        : raw.homeroom_teacher_name != null
          ? String(raw.homeroom_teacher_name)
          : null,
  };
}

export function mapSchoolClasses(rows: unknown[]): SchoolClass[] {
  return rows.map((row) => mapSchoolClass(row as Record<string, unknown>));
}

export function mapGrade(raw: Record<string, unknown>): Grade {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    sectionsCount: Number(raw.sectionsCount ?? raw.sections_count ?? 0),
    sortOrder: Number(raw.sortOrder ?? raw.sort_order ?? 0),
  };
}

export function mapGrades(rows: unknown[]): Grade[] {
  return rows.map((row) => mapGrade(row as Record<string, unknown>));
}
