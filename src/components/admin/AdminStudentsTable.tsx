"use client";

import Link from "next/link";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { formatClassLabel, PAYMENT_STATUS_LABELS } from "@/lib/adminStudents";
import { cn } from "@/lib/utils";
import type { AdminStudent } from "@/types";
import { FileText, KeyRound, Pencil, Unlock } from "lucide-react";

const STUDENTS_TABLE = "w-full min-w-[960px] border-collapse border border-neutral-200 text-sm";
const STUDENTS_TH =
  "border-b border-e border-neutral-200 bg-neutral-50 px-3 py-3 text-start text-xs font-bold text-p-black/55 last:border-e-0 sm:px-4";
const STUDENTS_TD =
  "border-b border-e border-neutral-200 px-3 py-3 align-top last:border-e-0 sm:px-4";

function paymentBadgeVariant(
  status: AdminStudent["paymentStatus"]
): "default" | "success" | "warning" | "danger" {
  if (status === "approved") return "success";
  if (status === "pending") return "warning";
  if (status === "rejected") return "danger";
  return "default";
}

type AdminStudentsTableProps = {
  students: AdminStudent[];
  hasActiveFilters: boolean;
  onEdit: (student: AdminStudent) => void;
  onResetPassword: (student: AdminStudent) => void;
  onGrantAccess: (student: AdminStudent) => void;
};

export function AdminStudentsTable({
  students,
  hasActiveFilters,
  onEdit,
  onResetPassword,
  onGrantAccess,
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
          <col className="w-[20%]" />
          <col className="w-[13%]" />
          <col className="w-[14%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[29%]" />
        </colgroup>
        <thead>
          <tr>
            <th className={STUDENTS_TH}>الطالب</th>
            <th className={STUDENTS_TH}>الفصل</th>
            <th className={STUDENTS_TH}>الرسوم</th>
            <th className={STUDENTS_TH}>حالة الدفع</th>
            <th className={STUDENTS_TH}>الوثائق</th>
            <th className={STUDENTS_TH}>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.id} className={cn(index % 2 === 1 && "bg-neutral-50/50")}>
              <td className={STUDENTS_TD}>
                <div className="space-y-1">
                  <p className="font-semibold leading-snug text-p-black">{student.name}</p>
                  <p className="text-xs text-p-black/50" dir="ltr">
                    {student.studentNumber ? `#${student.studentNumber}` : "—"}
                    {student.nationalId ? ` · ${student.nationalId}` : ""}
                  </p>
                  {student.username ? (
                    <p className="text-[11px] text-p-black/40" dir="ltr">
                      @{student.username}
                    </p>
                  ) : null}
                </div>
              </td>
              <td className={cn(STUDENTS_TD, "font-medium leading-snug text-p-black/75")}>
                {formatClassLabel(student.grade, student.section)}
              </td>
              <td className={STUDENTS_TD}>
                {student.balance && (student.balance.total > 0 || student.balance.paid > 0) ? (
                  <div className="space-y-1">
                    <p className="font-bold text-p-green" dir="ltr">
                      {student.balance.paid} ₪
                    </p>
                    <p className="text-xs text-p-black/50">مدفوع</p>
                    <p className="text-xs text-p-black/45" dir="ltr">
                      متبقي {Math.max(0, student.balance.remaining)} ₪
                    </p>
                  </div>
                ) : (
                  <span className="text-p-black/40">—</span>
                )}
              </td>
              <td className={STUDENTS_TD}>
                <Badge variant={paymentBadgeVariant(student.paymentStatus)}>
                  {PAYMENT_STATUS_LABELS[student.paymentStatus]}
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
                    variant="outline"
                    className="w-full justify-center gap-1.5 px-2 py-1.5 text-xs"
                    onClick={() => onGrantAccess(student)}
                  >
                    <Unlock className="h-3.5 w-3.5 shrink-0" />
                    فتح مؤقت
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-center gap-1.5 px-2 py-1.5 text-xs"
                    onClick={() => onResetPassword(student)}
                  >
                    <KeyRound className="h-3.5 w-3.5 shrink-0" />
                    كلمة المرور
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
