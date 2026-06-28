"use client";

import Link from "next/link";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { formatClassLabel } from "@/lib/adminStudents";
import { cn } from "@/lib/utils";
import type { AdminStudent } from "@/types";
import { FileText, KeyRound, Pencil, Power, Trash2 } from "lucide-react";

const STUDENTS_TABLE = "w-full min-w-[960px] border-collapse border border-neutral-200 text-sm";
const STUDENTS_TH =
  "border-b border-e border-neutral-200 bg-neutral-50 px-3 py-3 text-start text-xs font-bold text-p-black/55 last:border-e-0 sm:px-4";
const STUDENTS_TD =
  "border-b border-e border-neutral-200 px-3 py-3 align-top last:border-e-0 sm:px-4";

type AdminStudentsTableProps = {
  students: AdminStudent[];
  hasActiveFilters: boolean;
  togglingId?: string | null;
  onEdit: (student: AdminStudent) => void;
  onResetPassword: (student: AdminStudent) => void;
  onToggleActive: (student: AdminStudent) => void;
  onDelete: (student: AdminStudent) => void;
};

export function AdminStudentsTable({
  students,
  hasActiveFilters,
  togglingId,
  onEdit,
  onResetPassword,
  onToggleActive,
  onDelete,
}: AdminStudentsTableProps) {
  if (students.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-p-black/50">
        {hasActiveFilters ? "لا توجد نتائج مطابقة للبحث أو الفلاتر." : "لا يوجد طلاب مسجّلون."}
      </p>
    );
  }

  return (
    <div className="-mx-3 overflow-x-auto sm:mx-0">
      <table className={STUDENTS_TABLE}>
        <colgroup>
          <col className="w-[10%]" />
          <col className="w-[20%]" />
          <col className="w-[12%]" />
          <col className="w-[14%]" />
          <col className="w-[10%]" />
          <col className="w-[12%]" />
          <col className="w-[22%]" />
        </colgroup>
        <thead>
          <tr>
            <th className={STUDENTS_TH}>رقم الطالب</th>
            <th className={STUDENTS_TH}>اسم الطالب</th>
            <th className={STUDENTS_TH}>رقم هوية الطالب</th>
            <th className={STUDENTS_TH}>الفصل</th>
            <th className={STUDENTS_TH}>الحالة</th>
            <th className={STUDENTS_TH}>الوثائق</th>
            <th className={STUDENTS_TH}>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr
              key={student.id}
              className={cn(
                index % 2 === 1 && "bg-neutral-50/50",
                !student.isActive && "opacity-70"
              )}
            >
              <td className={cn(STUDENTS_TD, "font-medium text-p-black")} dir="ltr">
                {student.studentNumber ? `#${student.studentNumber}` : "—"}
              </td>
              <td className={cn(STUDENTS_TD, "font-semibold leading-snug text-p-black")}>
                {student.name}
              </td>
              <td className={cn(STUDENTS_TD, "text-p-black/75")} dir="ltr">
                {student.nationalId || "—"}
              </td>
              <td className={cn(STUDENTS_TD, "font-medium leading-snug text-p-black/75")}>
                {formatClassLabel(student.grade, student.section)}
              </td>
              <td className={STUDENTS_TD}>
                <Badge variant={student.isActive ? "success" : "default"}>
                  {student.isActive ? "نشط" : "غير نشط"}
                </Badge>
              </td>
              <td className={STUDENTS_TD}>
                <Link
                  href={`/admin/students/${student.id}/documents`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  {student.documents.length > 0
                    ? `${student.documents.length} وثيقة`
                    : "إضافة وثائق"}
                </Link>
              </td>
              <td className={STUDENTS_TD}>
                <div className="flex min-w-[8.5rem] flex-col gap-1.5">
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-1.5 px-2 py-1.5 text-xs"
                    onClick={() => onEdit(student)}
                  >
                    <Pencil className="h-3.5 w-3.5 shrink-0" />
                    تعديل
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-center gap-1.5 px-2 py-1.5 text-xs"
                    onClick={() => onToggleActive(student)}
                    disabled={togglingId === student.id}
                  >
                    <Power className="h-3.5 w-3.5 shrink-0" />
                    {togglingId === student.id
                      ? "جاري..."
                      : student.isActive
                        ? "تعطيل"
                        : "تفعيل"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-center gap-1.5 px-2 py-1.5 text-xs"
                    onClick={() => onResetPassword(student)}
                  >
                    <KeyRound className="h-3.5 w-3.5 shrink-0" />
                    كلمة المرور
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-center gap-1.5 px-2 py-1.5 text-xs text-p-red hover:text-p-red"
                    onClick={() => onDelete(student)}
                  >
                    <Trash2 className="h-3.5 w-3.5 shrink-0" />
                    حذف
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
