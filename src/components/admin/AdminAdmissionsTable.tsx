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
import { formatMetaDate } from "@/lib/dateDisplay";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

export type AdminAdmissionRow = {
  id: string;
  studentName: string;
  nationalId: string;
  birthDate: string | null;
  grade: string;
  parentName: string;
  phone: string;
  address: string;
  email: string;
  notes: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedStudentId: string | null;
  approvedByName: string | null;
  approvedAt: string | null;
};

type AdminAdmissionsTableProps = {
  rows: AdminAdmissionRow[];
  variant: "pending" | "approved" | "all";
  hasActiveFilters: boolean;
};

function statusBadge(status: AdminAdmissionRow["status"]) {
  if (status === "approved") return <Badge variant="success">معتمد</Badge>;
  if (status === "rejected") return <Badge variant="danger">مرفوض</Badge>;
  return <Badge variant="warning">قيد المراجعة</Badge>;
}

export function AdminAdmissionsTable({
  rows,
  variant,
  hasActiveFilters,
}: AdminAdmissionsTableProps) {
  const { page, totalPages, pageItems, pageSize, total, next, prev, setPage } =
    useClientPagination(rows, 10);

  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-p-black/70">
        {hasActiveFilters ? "لا توجد نتائج مطابقة للبحث." : "لا توجد طلبات في هذا القسم."}
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
              <th className={TABLE_TH}>ولي الأمر</th>
              <th className={TABLE_TH}>المرحلة</th>
              {variant === "all" ? <th className={TABLE_TH}>الحالة</th> : null}
              <th className={TABLE_TH}>التاريخ</th>
              <th className={TABLE_TH}></th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((row, index) => {
              const { date } = formatMetaDate(row.createdAt);
              return (
                <tr key={row.id} className={cn(index % 2 === 1 && "bg-neutral-50/70", "hover:bg-neutral-50")}>
                  <td className={TABLE_TD}>
                    <Link
                      href={`/admin/admissions/${row.id}`}
                      prefetch={false}
                      className="font-semibold text-p-black hover:text-brand-blue"
                    >
                      {row.studentName}
                    </Link>
                    {row.nationalId ? (
                      <p className="mt-0.5 text-xs text-p-black/50" dir="ltr">
                        {row.nationalId}
                      </p>
                    ) : null}
                  </td>
                  <td className={TABLE_TD}>{row.parentName}</td>
                  <td className={TABLE_TD}>{row.grade || "—"}</td>
                  {variant === "all" ? <td className={TABLE_TD}>{statusBadge(row.status)}</td> : null}
                  <td className={TABLE_TD}>{date}</td>
                  <td className={TABLE_TD}>
                    <Link
                      href={`/admin/admissions/${row.id}`}
                      prefetch={false}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
                    >
                      فتح
                      <ChevronLeft className="h-4 w-4" />
                    </Link>
                  </td>
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
