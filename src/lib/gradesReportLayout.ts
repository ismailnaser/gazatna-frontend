import type { Grade, GradeComponent } from "@/types";

export type GradeReportColumn = {
  key: string;
  name: string;
};

export function componentColumnKey(component: GradeComponent) {
  return component.name.trim() || component.id;
}

export function collectGradeReportColumns(grades: Grade[]): GradeReportColumn[] {
  const seen = new Set<string>();
  const columns: GradeReportColumn[] = [];

  for (const grade of grades) {
    for (const component of grade.components ?? []) {
      const key = componentColumnKey(component);
      if (seen.has(key)) continue;
      seen.add(key);
      columns.push({ key, name: component.name || "—" });
    }
  }

  return columns;
}

export function findGradeComponent(grade: Grade, columnKey: string) {
  return (grade.components ?? []).find((component) => componentColumnKey(component) === columnKey);
}
