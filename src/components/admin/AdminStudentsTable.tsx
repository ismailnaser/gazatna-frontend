"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import {
  ExpandRowButton,
  TABLE_BASE,
  TABLE_TD,
  TABLE_TH,
  TABLE_WRAP,
  TablePagination,
  useClientPagination,
} from "@/components/shared/DataTable";
import { formatClassLabel } from "@/lib/adminStudents";
import { cn } from "@/lib/utils";
import type { AdminStudent } from "@/types";
import { FileText, KeyRound, Pencil, Power, Trash2 } from "lucide-react";

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { page, totalPages, pageItems, pageSize, total, next, prev, setPage } =
    useClientPagination(students, 10);

  if (students.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-p-black/72">
        {hasActiveFilters ? "لا توجد نتائج مطابقة للبحث أو الفلاتر." : "لا يوجد طلاب مسجّلون."}
      </p>
    );
  }

  return (
    <div className={TABLE_WRAP}>
      <div className="overflow-x-auto">
        <table className={TABLE_BASE}>
          <thead>
            <tr>
              <th className={TABLE_TH}>اسم الطالب</th>
              <th className={cn(TABLE_TH, "w-36")}>رقم الطالب</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((student, index) => {
              const open = expandedId === student.id;
              return (
                <tr key={student.id} className={cn(index % 2 === 1 && "bg-neutral-50/70")}>
                  <td className={TABLE_TD} colSpan={open ? 2 : 1}>
                    <div className={cn(!open && "contents")}>
                      {!open ? (
                        <ExpandRowButton
                          open={false}
                          label={student.name}
                          onClick={() => setExpandedId(student.id)}
                        />
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-bold text-p-black">{student.name}</p>
                              <p className="mt-1 text-sm text-p-black/72" dir="ltr">
                                #{student.studentNumber || "—"}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              className="px-3 py-1.5 text-xs"
                              onClick={() => setExpandedId(null)}
                            >
                              إغلاق
                            </Button>
                          </div>

                          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                              <dt className="text-xs font-semibold text-p-black/72">رقم الهوية</dt>
                              <dd className="mt-0.5 font-medium" dir="ltr">
                                {student.nationalId || "—"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs font-semibold text-p-black/72">جوال ولي الأمر</dt>
                              <dd className="mt-0.5 font-medium" dir="ltr">
                                {student.parentPhone || "—"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs font-semibold text-p-black/72">الفصل</dt>
                              <dd className="mt-0.5 font-medium">
                                {formatClassLabel(student.grade, student.section)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs font-semibold text-p-black/72">الحالة</dt>
                              <dd className="mt-1">
                                <Badge variant={student.isActive ? "success" : "default"}>
                                  {student.isActive ? "نشط" : "غير نشط"}
                                </Badge>
                              </dd>
                            </div>
                            <div className="sm:col-span-2">
                              <dt className="text-xs font-semibold text-p-black/72">العنوان</dt>
                              <dd className="mt-0.5 font-medium">{student.address || "—"}</dd>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3">
                              <dt className="text-xs font-semibold text-p-black/72">التقييم</dt>
                              <dd className="mt-0.5 whitespace-pre-wrap font-medium">
                                {student.evaluation || "—"}
                              </dd>
                            </div>
                          </dl>

                          <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
                            <Button
                              variant="outline"
                              className="gap-1.5 px-3 py-1.5 text-xs"
                              onClick={() => onEdit(student)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              تعديل
                            </Button>
                            <Button
                              variant="ghost"
                              className="gap-1.5 px-3 py-1.5 text-xs"
                              onClick={() => onToggleActive(student)}
                              disabled={togglingId === student.id}
                            >
                              <Power className="h-3.5 w-3.5" />
                              {togglingId === student.id
                                ? "جاري..."
                                : student.isActive
                                  ? "تعطيل"
                                  : "تفعيل"}
                            </Button>
                            <Button
                              variant="ghost"
                              className="gap-1.5 px-3 py-1.5 text-xs"
                              onClick={() => onResetPassword(student)}
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                              كلمة المرور
                            </Button>
                            <Link
                              href={`/admin/students/${student.id}/documents`}
                              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-brand-blue hover:bg-brand-blue/5"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              {student.documents.length > 0
                                ? `${student.documents.length} وثيقة`
                                : "الوثائق"}
                            </Link>
                            <Button
                              variant="ghost"
                              className="gap-1.5 px-3 py-1.5 text-xs text-p-red hover:text-p-red"
                              onClick={() => onDelete(student)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              حذف
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  {!open ? (
                    <td className={cn(TABLE_TD, "font-medium")} dir="ltr">
                      <button
                        type="button"
                        className="text-start font-semibold text-p-black hover:text-brand-blue"
                        onClick={() => setExpandedId(student.id)}
                      >
                        {student.studentNumber ? `#${student.studentNumber}` : "—"}
                      </button>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPrev={prev}
        onNext={next}
        onPage={setPage}
      />
    </div>
  );
}
