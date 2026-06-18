"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { ExpandableText } from "@/components/molecules/ExpandableText";
import { formatMetaDate } from "@/lib/dateDisplay";
import { cn } from "@/lib/utils";
import { Check, Eye, RotateCcw, Trash2 } from "lucide-react";

export type AdminAdmissionRow = {
  id: string;
  studentName: string;
  birthDate: string | null;
  grade: string;
  parentName: string;
  phone: string;
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
  onApprove: (row: AdminAdmissionRow) => void;
  onUnapprove: (row: AdminAdmissionRow) => void;
  onDelete: (row: AdminAdmissionRow) => void;
  onView: (row: AdminAdmissionRow) => void;
};

function statusBadge(status: AdminAdmissionRow["status"]) {
  if (status === "approved") return <Badge variant="success">معتمد</Badge>;
  if (status === "rejected") return <Badge variant="danger">مرفوض</Badge>;
  return <Badge variant="warning">قيد المراجعة</Badge>;
}

function DateCell({ value }: { value: string | null | undefined }) {
  const { date, time } = formatMetaDate(value);
  return (
    <>
      <p>{date}</p>
      {time ? (
        <p className="mt-0.5 text-p-black/45" dir="ltr">
          {time}
        </p>
      ) : null}
    </>
  );
}

export function AdminAdmissionsTable({
  rows,
  variant,
  hasActiveFilters,
  onApprove,
  onUnapprove,
  onDelete,
  onView,
}: AdminAdmissionsTableProps) {
  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-p-black/50">
        {hasActiveFilters ? "لا توجد نتائج مطابقة للبحث." : "لا توجد طلبات في هذا القسم."}
      </p>
    );
  }

  const showStatus = variant === "all";

  return (
    <div className="-mx-3 overflow-x-auto sm:mx-0">
      <table className="w-full min-w-[960px] text-sm">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50 text-p-black/55">
            <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4 sm:py-3">الطالب</th>
            <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4 sm:py-3">ولي الأمر</th>
            <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4 sm:py-3">التواصل</th>
            <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4 sm:py-3">المرحلة</th>
            <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4 sm:py-3">تاريخ الطلب</th>
            {variant === "approved" || showStatus ? (
              <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4 sm:py-3">الاعتماد</th>
            ) : null}
            {showStatus ? (
              <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4 sm:py-3">الحالة</th>
            ) : null}
            <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4 sm:py-3">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.id}
              className={cn(
                "border-b border-neutral-50 align-top last:border-0",
                index % 2 === 1 && "bg-neutral-50/40"
              )}
            >
              <td className="px-3 py-3 sm:px-4">
                <p className="font-semibold text-p-black">{row.studentName}</p>
                {row.birthDate ? (
                  <p className="mt-1 text-xs text-p-black/50">ميلاد: {row.birthDate}</p>
                ) : null}
                {row.notes ? (
                  <ExpandableText maxLines={2} className="mt-1 text-[11px] text-p-black/45">
                    {row.notes}
                  </ExpandableText>
                ) : null}
              </td>
              <td className="px-3 py-3 text-p-black/75 sm:px-4">{row.parentName}</td>
              <td className="px-3 py-3 sm:px-4">
                <p dir="ltr" className="text-p-black/75">
                  {row.phone || "—"}
                </p>
                {row.email ? (
                  <p dir="ltr" className="mt-0.5 text-xs text-p-black/45">
                    {row.email}
                  </p>
                ) : null}
              </td>
              <td className="px-3 py-3 text-p-black/75 sm:px-4">{row.grade || "—"}</td>
              <td className="px-3 py-3 text-xs text-p-black/60 sm:px-4">
                <DateCell value={row.createdAt} />
              </td>
              {variant === "approved" || showStatus ? (
                <td className="px-3 py-3 sm:px-4">
                  {row.status === "approved" ? (
                    <div>
                      <p className="font-medium text-p-black">{row.approvedByName ?? "—"}</p>
                      {row.approvedAt ? (
                        <div className="mt-0.5 text-xs text-p-black/45">
                          <DateCell value={row.approvedAt} />
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-p-black/35">—</span>
                  )}
                </td>
              ) : null}
              {showStatus ? (
                <td className="px-3 py-3 sm:px-4">{statusBadge(row.status)}</td>
              ) : null}
              <td className="px-3 py-3 sm:px-4">
                <div className="flex flex-wrap gap-1.5">
                  {row.status === "pending" ? (
                    <Button type="button" className="h-8 px-2.5 text-xs" onClick={() => onApprove(row)}>
                      <Check className="h-3.5 w-3.5" />
                      اعتماد
                    </Button>
                  ) : null}
                  {row.status === "approved" ? (
                    <>
                      {row.approvedStudentId ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 px-2.5 text-xs"
                          onClick={() => onView(row)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          عرض
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 px-2.5 text-xs text-amber-700 hover:text-amber-800"
                        onClick={() => onUnapprove(row)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        تراجع
                      </Button>
                    </>
                  ) : null}
                  {row.status === "pending" ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 px-2.5 text-xs text-p-red hover:text-p-red"
                      onClick={() => onDelete(row)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      حذف
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
