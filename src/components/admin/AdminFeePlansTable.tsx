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
import { formatGregorianDate } from "@/lib/dateDisplay";
import { installmentsMatchTotal, installmentsTotal } from "@/lib/feePlanForm";
import { cn } from "@/lib/utils";
import type { FeePlan } from "@/types/finance";
import { installmentLabel } from "@/types/finance";
import { Calendar, Pencil, Plus, Trash2 } from "lucide-react";

type AdminFeePlansTableProps = {
  plans: FeePlan[];
  activePlanId?: string;
  onCreate: () => void;
  onEdit: (plan: FeePlan) => void;
  onDelete: (plan: FeePlan) => void;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return formatGregorianDate(value);
}

export function AdminFeePlansTable({
  plans,
  activePlanId,
  onCreate,
  onEdit,
  onDelete,
}: AdminFeePlansTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { page, totalPages, pageItems, pageSize, total, next, prev, setPage } =
    useClientPagination(plans, 10);

  if (plans.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
        <p className="font-semibold text-p-black">لا توجد خطط رسوم بعد</p>
        <p className="mt-2 text-sm text-p-black/75">
          أنشئ خطة جديدة وحدّد المراحل الدراسية وجدول الأقساط.
        </p>
        <Button type="button" className="mt-4" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          إنشاء أول خطة
        </Button>
      </div>
    );
  }

  return (
    <div className={TABLE_WRAP}>
      <div className="overflow-x-auto">
        <table className={TABLE_BASE}>
          <thead>
            <tr>
              <th className={TABLE_TH}>اسم الخطة</th>
              <th className={cn(TABLE_TH, "w-36")}>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((plan, index) => {
              const open = expandedId === plan.id;
              const scheduledCount = plan.installments.filter(
                (row) => row.startDate && row.endDate
              ).length;
              const sum = installmentsTotal(plan.installments);
              const totalsMatch = installmentsMatchTotal(plan.installments, plan.totalAmount);

              return (
                <tr
                  key={plan.id}
                  className={cn(
                    index % 2 === 1 && "bg-neutral-50/70",
                    activePlanId === plan.id && "bg-brand-blue/5"
                  )}
                >
                  <td className={TABLE_TD} colSpan={open ? 2 : 1}>
                    {!open ? (
                      <ExpandRowButton
                        open={false}
                        label={plan.name}
                        onClick={() => setExpandedId(plan.id)}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-bold text-p-black">{plan.name}</p>
                            <p className="mt-1 text-sm text-p-black/72">
                              {plan.installmentsCount} دفعات · إجمالي {plan.totalAmount} ₪
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

                        <dl className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <dt className="text-xs font-semibold text-p-black/72">مجموع الأقساط</dt>
                            <dd
                              className={cn(
                                "mt-0.5 font-medium",
                                totalsMatch ? "text-p-black" : "text-amber-700"
                              )}
                            >
                              {sum} ₪
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold text-p-black/72">الجدول</dt>
                            <dd className="mt-0.5 flex items-center gap-1 text-sm font-medium">
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                              {scheduledCount}/{plan.installmentsCount} مجدولة
                            </dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="text-xs font-semibold text-p-black/72">المراحل</dt>
                            <dd className="mt-1 flex flex-wrap gap-1">
                              {plan.gradeNames.length > 0 ? (
                                plan.gradeNames.map((grade) => (
                                  <Badge key={grade} variant="default">
                                    {grade}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-p-black/72">—</span>
                              )}
                            </dd>
                          </div>
                        </dl>

                        <ol className="space-y-2">
                          {[...plan.installments]
                            .sort((a, b) => a.order - b.order)
                            .map((row) => {
                              const isScheduled = Boolean(row.startDate && row.endDate);
                              return (
                                <li
                                  key={row.order}
                                  className="rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                    <span className="font-semibold text-p-black">
                                      {installmentLabel(row)}
                                    </span>
                                    <span className="font-medium text-p-black/78">{row.amount} ₪</span>
                                  </div>
                                  {isScheduled ? (
                                    <p className="mt-1 text-xs leading-relaxed text-p-black/75">
                                      من {formatDate(row.startDate)} إلى {formatDate(row.endDate)}
                                    </p>
                                  ) : (
                                    <p className="mt-1 text-xs font-medium text-amber-700">بدون موعد</p>
                                  )}
                                </li>
                              );
                            })}
                        </ol>

                        <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-1.5 px-3 py-1.5 text-xs"
                            onClick={() => onEdit(plan)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            تعديل
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-1.5 px-3 py-1.5 text-xs text-p-red hover:text-p-red"
                            onClick={() => onDelete(plan)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    )}
                  </td>
                  {!open ? (
                    <td className={TABLE_TD}>
                      <button
                        type="button"
                        className="font-semibold text-p-black"
                        onClick={() => setExpandedId(plan.id)}
                      >
                        {plan.totalAmount} ₪
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
