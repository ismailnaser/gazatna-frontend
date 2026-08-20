"use client";

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
import { ExpandableText } from "@/components/molecules/ExpandableText";
import { formatMetaDate } from "@/lib/dateDisplay";
import { cn } from "@/lib/utils";
import { Check, Eye, RotateCcw, Trash2 } from "lucide-react";

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
        <p className="mt-0.5 text-p-black/72" dir="ltr">
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { page, totalPages, pageItems, pageSize, total, next, prev, setPage } =
    useClientPagination(rows, 10);

  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-p-black/72">
        {hasActiveFilters ? "لا توجد نتائج مطابقة للبحث." : "لا توجد طلبات في هذا القسم."}
      </p>
    );
  }

  const showStatus = variant === "all";

  return (
    <div className={TABLE_WRAP}>
      <div className="overflow-x-auto">
        <table className={TABLE_BASE}>
          <thead>
            <tr>
              <th className={TABLE_TH}>اسم الطالب</th>
              <th className={cn(TABLE_TH, "w-40")}>رقم الهوية</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((row, index) => {
              const open = expandedId === row.id;
              return (
                <tr key={row.id} className={cn(index % 2 === 1 && "bg-neutral-50/70")}>
                  <td className={TABLE_TD} colSpan={open ? 2 : 1}>
                    {!open ? (
                      <ExpandRowButton
                        open={false}
                        label={row.studentName}
                        onClick={() => setExpandedId(row.id)}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-bold text-p-black">{row.studentName}</p>
                            {row.nationalId ? (
                              <p className="mt-1 text-sm text-p-black/72" dir="ltr">
                                هوية: {row.nationalId}
                              </p>
                            ) : null}
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
                            <dt className="text-xs font-semibold text-p-black/72">ولي الأمر</dt>
                            <dd className="mt-0.5 font-medium">{row.parentName}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold text-p-black/72">الجوال</dt>
                            <dd className="mt-0.5 font-medium" dir="ltr">
                              {row.phone || "—"}
                            </dd>
                          </div>
                          {row.email ? (
                            <div>
                              <dt className="text-xs font-semibold text-p-black/72">البريد</dt>
                              <dd className="mt-0.5 font-medium" dir="ltr">
                                {row.email}
                              </dd>
                            </div>
                          ) : null}
                          <div>
                            <dt className="text-xs font-semibold text-p-black/72">المرحلة المطلوبة</dt>
                            <dd className="mt-0.5 font-medium">{row.grade || "—"}</dd>
                          </div>
                          {row.birthDate ? (
                            <div>
                              <dt className="text-xs font-semibold text-p-black/72">تاريخ الميلاد</dt>
                              <dd className="mt-0.5 font-medium">{row.birthDate}</dd>
                            </div>
                          ) : null}
                          {row.address ? (
                            <div className="sm:col-span-2">
                              <dt className="text-xs font-semibold text-p-black/72">العنوان</dt>
                              <dd className="mt-0.5 font-medium">{row.address}</dd>
                            </div>
                          ) : null}
                          <div>
                            <dt className="text-xs font-semibold text-p-black/72">تاريخ الطلب</dt>
                            <dd className="mt-0.5 text-sm">
                              <DateCell value={row.createdAt} />
                            </dd>
                          </div>
                          {showStatus ? (
                            <div>
                              <dt className="text-xs font-semibold text-p-black/72">الحالة</dt>
                              <dd className="mt-1">{statusBadge(row.status)}</dd>
                            </div>
                          ) : null}
                          {(variant === "approved" || showStatus) && row.status === "approved" ? (
                            <div>
                              <dt className="text-xs font-semibold text-p-black/72">الاعتماد</dt>
                              <dd className="mt-0.5">
                                <p className="font-medium">{row.approvedByName ?? "—"}</p>
                                {row.approvedAt ? (
                                  <div className="mt-0.5 text-xs text-p-black/72">
                                    <DateCell value={row.approvedAt} />
                                  </div>
                                ) : null}
                              </dd>
                            </div>
                          ) : null}
                          {row.notes ? (
                            <div className="sm:col-span-2 lg:col-span-3">
                              <dt className="text-xs font-semibold text-p-black/72">ملاحظات</dt>
                              <dd className="mt-1">
                                <ExpandableText maxLines={3} className="text-sm text-p-black/78">
                                  {row.notes}
                                </ExpandableText>
                              </dd>
                            </div>
                          ) : null}
                        </dl>

                        <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
                          {row.status === "pending" ? (
                            <Button
                              type="button"
                              className="gap-1.5 px-3 py-1.5 text-xs"
                              onClick={() => onApprove(row)}
                            >
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
                                  className="gap-1.5 px-3 py-1.5 text-xs"
                                  onClick={() => onView(row)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  عرض
                                </Button>
                              ) : null}
                              <Button
                                type="button"
                                variant="outline"
                                className="gap-1.5 px-3 py-1.5 text-xs text-amber-700 hover:text-amber-800"
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
                              className="gap-1.5 px-3 py-1.5 text-xs text-p-red hover:text-p-red"
                              onClick={() => onDelete(row)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              حذف
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </td>
                  {!open ? (
                    <td className={TABLE_TD}>
                      <button
                        type="button"
                        className="font-mono text-sm text-p-black/80"
                        dir="ltr"
                        onClick={() => setExpandedId(row.id)}
                      >
                        {row.nationalId || "—"}
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
