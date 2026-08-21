import type { AdminAdmissionRow } from "@/components/admin/AdminAdmissionsTable";
import type { AdminStudent } from "@/types";

export function mapAdmission(row: Record<string, unknown>): AdminAdmissionRow {
  return {
    id: String(row.id),
    studentName: String(row.studentName ?? ""),
    nationalId: row.nationalId ? String(row.nationalId) : "",
    birthDate: row.birthDate ? String(row.birthDate) : null,
    grade: String(row.grade ?? ""),
    parentName: String(row.parentName ?? ""),
    phone: String(row.phone ?? ""),
    address: row.address ? String(row.address) : "",
    email: String(row.email ?? ""),
    notes: String(row.notes ?? ""),
    status: (row.status as AdminAdmissionRow["status"]) ?? "pending",
    createdAt: String(row.createdAt ?? ""),
    approvedStudentId: row.approvedStudentId ? String(row.approvedStudentId) : null,
    approvedByName: row.approvedByName ? String(row.approvedByName) : null,
    approvedAt: row.approvedAt ? String(row.approvedAt) : null,
  };
}

export function guessClassId(
  grade: string,
  classes: Array<{ id: string; name: string; gradeLevel: string; section: string }>
) {
  const normalized = grade.trim().toLowerCase();
  if (!normalized) return "";

  const exact = classes.find(
    (cls) =>
      cls.name === grade ||
      cls.gradeLevel === grade ||
      cls.name.startsWith(grade) ||
      `${cls.gradeLevel} - ${cls.section}` === grade
  );
  if (exact) return exact.id;

  const partial = classes.find((cls) => {
    const haystack = [cls.name, cls.gradeLevel, cls.section].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(normalized) || normalized.includes(haystack);
  });
  return partial?.id ?? "";
}

export function formatAdmissionClassLabel(grade: string, section?: string) {
  return section ? `${grade} - ${section}` : grade;
}

export function mapAdmissionStudent(s: Record<string, unknown>): AdminStudent {
  return {
    id: String(s.id),
    name: String(s.name),
    grade: String(s.grade),
    section: s.section ? String(s.section) : undefined,
    classId: s.classId ? String(s.classId) : undefined,
    studentNumber: s.studentNumber ? String(s.studentNumber) : undefined,
    nationalId: s.nationalId ? String(s.nationalId) : undefined,
    username: s.username ? String(s.username) : undefined,
    generatedPassword: s.generatedPassword ? String(s.generatedPassword) : undefined,
    isActive: s.isActive !== undefined ? Boolean(s.isActive) : s.is_active !== false,
    paymentStatus: s.paymentStatus as AdminStudent["paymentStatus"],
    documents: Array.isArray(s.documents)
      ? (s.documents as Array<Record<string, unknown>>).map((d) => ({
          id: d.id ? String(d.id) : null,
          name: String(d.name ?? ""),
          url: d.url ? String(d.url) : null,
        }))
      : [],
  };
}
