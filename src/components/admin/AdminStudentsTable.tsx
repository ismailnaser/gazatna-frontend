"use client";

import Link from "next/link";
import { Badge } from "@/components/atoms/Badge";
import {
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
import { ChevronLeft } from "lucide-react";

type AdminStudentsTableProps = {
  students: AdminStudent[];
  hasActiveFilters: boolean;
};

export function AdminStudentsTable({ students, hasActiveFilters }: AdminStudentsTableProps) {
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
              <th className={TABLE_TH}>الفصل</th>
              <th className={cn(TABLE_TH, "w-28")}>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((student, index) => (
              <tr key={student.id} className={cn(index % 2 === 1 && "bg-neutral-50/70")}>
                <td className={TABLE_TD}>
                  <Link
                    href={`/admin/students/${student.id}`}
                    prefetch={false}
                    className="group flex items-center justify-between gap-2 font-semibold text-p-black hover:text-brand-blue"
                  >
                    <span className="min-w-0 truncate">{student.name}</span>
                    <ChevronLeft className="h-4 w-4 shrink-0 text-neutral-300 group-hover:text-brand-blue" />
                  </Link>
                </td>
                <td className={cn(TABLE_TD, "font-medium")} dir="ltr">
                  {student.studentNumber ? `#${student.studentNumber}` : "—"}
                </td>
                <td className={TABLE_TD}>
                  {formatClassLabel(student.grade, student.section)}
                </td>
                <td className={TABLE_TD}>
                  <Badge variant={student.isActive ? "success" : "default"}>
                    {student.isActive ? "نشط" : "غير نشط"}
                  </Badge>
                </td>
              </tr>
            ))}
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
