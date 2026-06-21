"use client";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { MultiSelect } from "@/components/atoms/MultiSelect";
import { NumberFieldWithKeypad } from "@/components/teacher/NumberFieldWithKeypad";
import {
  applyTotalToInstallments,
  installmentsMatchTotal,
  installmentsTotal,
  normalizeInstallmentsCount,
  syncLastInstallmentAmount,
  updateInstallmentsCount,
  type FeePlanFormState,
} from "@/lib/feePlanForm";
import { cn } from "@/lib/utils";
import { Save, X } from "lucide-react";

type GradeOption = { value: string; label: string };

type AdminFeePlanFormPanelProps = {
  form: FeePlanFormState;
  onChange: (next: FeePlanFormState) => void;
  gradeOptions: GradeOption[];
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
};

export function AdminFeePlanFormPanel({
  form,
  onChange,
  gradeOptions,
  saving,
  onSubmit,
  onCancel,
}: AdminFeePlanFormPanelProps) {
  const installmentsSum = installmentsTotal(form.installments);
  const planTotal = Math.max(0, Math.round(Number(form.totalAmount) || 0));
  const expectedCount = Number(form.installmentsCount) || 0;
  const totalsMatch = installmentsMatchTotal(form.installments, planTotal);
  const countMatchesRows = expectedCount > 0 && form.installments.length === expectedCount;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-p-black">
            {form.id ? "تعديل خطة الرسوم" : "إنشاء خطة رسوم جديدة"}
          </h3>
          <p className="mt-1 text-sm text-p-black/55">
            حدّد البيانات الأساسية ثم راجع جدول الأقساط قبل الحفظ.
          </p>
        </div>
        <Button type="button" variant="outline" className="text-xs" onClick={onCancel}>
          <X className="h-4 w-4" />
          إلغاء
        </Button>
      </div>

      <section className="rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4 sm:p-5">
        <h4 className="mb-4 text-sm font-bold text-p-black">البيانات الأساسية</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="اسم الخطة"
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            placeholder="مثال: رسوم الصف التاسع 2025-2026"
            required
          />
          <NumberFieldWithKeypad
            fieldId="planTotalAmount"
            label="إجمالي القسط (₪)"
            value={form.totalAmount}
            onChange={(value) => onChange(applyTotalToInstallments(form, value))}
            min={1}
            max={999999}
            allowDecimal
            maxDecimalPlaces={2}
            required
          />
          <MultiSelect
            label="المراحل الدراسية"
            options={gradeOptions}
            value={form.gradeIds}
            onChange={(gradeIds) => onChange({ ...form, gradeIds })}
            countLabel="مراحل"
            placeholder="اختر مرحلة أو أكثر"
          />
          <NumberFieldWithKeypad
            fieldId="installmentsCount"
            label="عدد الدفعات"
            value={form.installmentsCount}
            onChange={(value) => onChange(updateInstallmentsCount(form, value))}
            onDeactivate={() => onChange(normalizeInstallmentsCount(form))}
            min={1}
            max={12}
            required
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-neutral-100">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 bg-white px-4 py-3 sm:px-5">
          <div>
            <h4 className="text-sm font-bold text-p-black">جدول الأقساط</h4>
            <p className="mt-0.5 text-xs text-p-black/50">
              {expectedCount > 0
                ? `يُنشأ تلقائياً ${expectedCount} دفعة — يمكن تعديل المبالغ والمواعيد أدناه.`
                : "حدّد عدد الدفعات أولاً لعرض جدول الأقساط."}
            </p>
          </div>
          <p
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              totalsMatch ? "bg-p-green/10 text-p-green" : "bg-amber-50 text-amber-700"
            )}
          >
            مجموع الأقساط: {installmentsSum} ₪ / {planTotal} ₪
          </p>
        </div>

        <div className="overflow-x-auto">
          {expectedCount === 0 || form.installments.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-p-black/50 sm:px-5">
              أدخل عدد الدفعات في البيانات الأساسية لإنشاء جدول الأقساط تلقائياً.
            </p>
          ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50 text-p-black/55">
                <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4">الدفعة</th>
                <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4">المبلغ (₪)</th>
                <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4">بداية الدفع</th>
                <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4">آخر موعد</th>
                <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {form.installments.map((row, index) => {
                const isScheduled = Boolean(row.startDate && row.endDate);
                return (
                  <tr key={row.order} className="border-b border-neutral-50 align-top last:border-0">
                    <td className="px-3 py-3 font-semibold text-p-black sm:px-4">دفعة {row.order}</td>
                    <td className="px-3 py-3 sm:px-4">
                      <NumberFieldWithKeypad
                        compact
                        fieldId={`installment-amount-${row.order}`}
                        label={`مبلغ دفعة ${row.order}`}
                        value={String(row.amount)}
                        onChange={(value) => {
                          const installments = [...form.installments];
                          const parsed = value === "" ? 0 : Math.round(Number(value));
                          installments[index] = {
                            ...row,
                            amount: Number.isFinite(parsed) ? parsed : 0,
                          };
                          onChange({ ...form, installments });
                        }}
                        onDeactivate={() =>
                          onChange(syncLastInstallmentAmount(form))
                        }
                        min={0}
                        max={999999}
                        inputClassName="w-28 py-1.5"
                      />
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      <Input
                        label={index === 0 ? "البداية" : "البداية (اختياري)"}
                        type="date"
                        value={row.startDate ?? ""}
                        onChange={(e) => {
                          const installments = [...form.installments];
                          installments[index] = { ...row, startDate: e.target.value };
                          onChange({ ...form, installments });
                        }}
                      />
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      <Input
                        label={index === 0 ? "النهاية" : "النهاية (اختياري)"}
                        type="date"
                        value={row.endDate ?? ""}
                        onChange={(e) => {
                          const installments = [...form.installments];
                          installments[index] = { ...row, endDate: e.target.value };
                          onChange({ ...form, installments });
                        }}
                      />
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          isScheduled
                            ? "bg-p-green/10 text-p-green"
                            : "bg-amber-50 text-amber-700"
                        )}
                      >
                        {isScheduled ? "مجدولة" : "بدون موعد"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-2 border-t border-neutral-100 pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          إلغاء
        </Button>
        <Button
          type="submit"
          disabled={
            saving ||
            !form.name.trim() ||
            !form.installmentsCount ||
            Number(form.installmentsCount) < 1 ||
            !countMatchesRows ||
            !totalsMatch
          }
        >
          <Save className="h-4 w-4" />
          {saving ? "جاري الحفظ..." : form.id ? "حفظ التعديلات" : "حفظ الخطة"}
        </Button>
      </div>
    </form>
  );
}
