"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { formatMetaDate } from "@/lib/dateDisplay";
import { installmentsMatchTotal, installmentsTotal } from "@/lib/feePlanForm";
import { cn } from "@/lib/utils";
import type { FeePlan } from "@/types/finance";
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
  return formatMetaDate(value).date;
}

export function AdminFeePlansTable({
  plans,
  activePlanId,
  onCreate,
  onEdit,
  onDelete,
}: AdminFeePlansTableProps) {
  if (plans.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
        <p className="font-semibold text-p-black">لا توجد خطط رسوم بعد</p>
        <p className="mt-2 text-sm text-p-black/55">
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
    <div className="-mx-3 overflow-x-auto sm:mx-0">
      <table className="w-full min-w-[920px] text-sm">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50 text-p-black/55">
            <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4 sm:py-3">الخطة</th>
            <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4 sm:py-3">الإجمالي</th>
            <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4 sm:py-3">الدفعات</th>
            <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4 sm:py-3">المراحل</th>
            <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4 sm:py-3">الجدول</th>
            <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4 sm:py-3">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan, index) => {
            const scheduledCount = plan.installments.filter(
              (row) => row.startDate && row.endDate
            ).length;
            const sum = installmentsTotal(plan.installments);
            const totalsMatch = installmentsMatchTotal(plan.installments, plan.totalAmount);

            return (
              <tr
                key={plan.id}
                className={cn(
                  "border-b border-neutral-50 align-top last:border-0",
                  index % 2 === 1 && "bg-neutral-50/40",
                  activePlanId === plan.id && "bg-brand-blue/5"
                )}
              >
                <td className="px-3 py-3 sm:px-4">
                  <p className="font-semibold text-p-black">{plan.name}</p>
                  {activePlanId === plan.id ? (
                    <p className="mt-1 text-[11px] font-medium text-brand-blue">قيد التعديل</p>
                  ) : null}
                </td>
                <td className="px-3 py-3 font-semibold text-p-black sm:px-4">
                  {plan.totalAmount} ₪
                </td>
                <td className="px-3 py-3 sm:px-4">
                  <p className="text-p-black/75">{plan.installmentsCount} دفعات</p>
                  <p
                    className={cn(
                      "mt-0.5 text-xs",
                      totalsMatch ? "text-p-black/45" : "text-amber-700"
                    )}
                  >
                    مجموع الأقساط: {sum} ₪
                  </p>
                </td>
                <td className="px-3 py-3 sm:px-4">
                  {plan.gradeNames.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {plan.gradeNames.map((grade) => (
                        <Badge key={grade} variant="default">
                          {grade}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-p-black/35">—</span>
                  )}
                </td>
                <td className="px-3 py-3 sm:px-4">
                  <p className="flex items-center gap-1 text-xs text-p-black/60">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    {scheduledCount}/{plan.installmentsCount} مجدولة
                  </p>
                  <ul className="mt-2 space-y-1">
                    {plan.installments.slice(0, 3).map((row) => (
                      <li key={row.order} className="text-[11px] text-p-black/50">
                        دفعة {row.order}: {row.amount} ₪
                        {row.startDate && row.endDate
                          ? ` — ${formatDate(row.startDate)} → ${formatDate(row.endDate)}`
                          : " — بدون موعد"}
                      </li>
                    ))}
                    {plan.installments.length > 3 ? (
                      <li className="text-[11px] text-p-black/40">
                        +{plan.installments.length - 3} دفعات أخرى
                      </li>
                    ) : null}
                  </ul>
                </td>
                <td className="px-3 py-3 sm:px-4">
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 px-2.5 text-xs"
                      onClick={() => onEdit(plan)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      تعديل
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 px-2.5 text-xs text-p-red hover:text-p-red"
                      onClick={() => onDelete(plan)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      حذف
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
