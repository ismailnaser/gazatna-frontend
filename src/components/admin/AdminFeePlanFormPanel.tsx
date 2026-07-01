"use client";

import { useMemo } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { MultiSelect } from "@/components/atoms/MultiSelect";
import { Select } from "@/components/atoms/Select";
import { NumberFieldWithKeypad } from "@/components/teacher/NumberFieldWithKeypad";
import {
  applyBillingContext,
  applyTotalToInstallments,
  getInstallmentStartMin,
  getOccupiedFeePlanGradeIds,
  installmentsMatchTotal,
  installmentsTotal,
  normalizeInstallmentsCount,
  resolveBillingPeriodBounds,
  syncLastInstallmentAmount,
  updateInstallmentDate,
  updateInstallmentsCount,
  type FeePlanFormState,
} from "@/lib/feePlanForm";
import { cn } from "@/lib/utils";
import type { AcademicYear } from "@/types/academic";
import type { FeePlan } from "@/types/finance";
import { Save, X } from "lucide-react";

type GradeOption = { value: string; label: string };

type AdminFeePlanFormPanelProps = {
  form: FeePlanFormState;
  onChange: (next: FeePlanFormState) => void;
  gradeOptions: GradeOption[];
  plans: FeePlan[];
  academicYears: AcademicYear[];
  saving: boolean;
  validationError?: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
};

export function AdminFeePlanFormPanel({
  form,
  onChange,
  gradeOptions,
  plans,
  academicYears,
  saving,
  validationError,
  onSubmit,
  onCancel,
}: AdminFeePlanFormPanelProps) {
  const installmentsSum = installmentsTotal(form.installments);
  const planTotal = Math.max(0, Math.round(Number(form.totalAmount) || 0));
  const expectedCount = Number(form.installmentsCount) || 0;
  const totalsMatch = installmentsMatchTotal(form.installments, planTotal);
  const countMatchesRows = expectedCount > 0 && form.installments.length === expectedCount;
  const period = useMemo(
    () => resolveBillingPeriodBounds(form, academicYears),
    [form, academicYears]
  );

  const selectedYear = useMemo(
    () => academicYears.find((year) => year.id === form.academicYearId) ?? null,
    [academicYears, form.academicYearId]
  );

  const termOptions = useMemo(
    () => [
      { value: "", label: "اختر الفصل" },
      ...(selectedYear?.terms.map((term) => ({ value: term.id, label: term.name })) ?? []),
    ],
    [selectedYear]
  );

  const yearOptions = useMemo(
    () => [
      { value: "", label: "اختر السنة الدراسية" },
      ...academicYears.map((year) => ({ value: year.id, label: year.name })),
    ],
    [academicYears]
  );

  const occupiedGradeIds = useMemo(
    () => getOccupiedFeePlanGradeIds(plans, form.id),
    [plans, form.id]
  );

  const selectableGradeOptions = useMemo(
    () =>
      gradeOptions.map((option) => {
        const planName = occupiedGradeIds.get(option.value);
        return {
          ...option,
          disabled: Boolean(planName),
          hint: planName ? `لها خطة مسبقاً: ${planName}` : undefined,
        };
      }),
    [gradeOptions, occupiedGradeIds]
  );

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-p-black">
            {form.id ? "تعديل خطة الرسوم" : "إنشاء خطة رسوم جديدة"}
          </h3>
          <p className="mt-1 text-sm text-p-black/55">
            حدّد فترة الدفع والبيانات الأساسية، ثم راجع جدول الأقساط قبل الحفظ.
          </p>
        </div>
        <Button type="button" variant="outline" className="text-xs" onClick={onCancel}>
          <X className="h-4 w-4" />
          إلغاء
        </Button>
      </div>

      {validationError ? (
        <p className="rounded-xl border border-p-red/20 bg-p-red/5 px-4 py-3 text-sm text-p-red">
          {validationError}
        </p>
      ) : null}

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
            onChange={(value) => onChange(applyTotalToInstallments(form, value, academicYears))}
            min={1}
            max={999999}
            allowDecimal
            maxDecimalPlaces={2}
            required
          />
          <Select
            label="نطاق الدفع"
            value={form.billingPeriod}
            options={[
              { value: "full_year", label: "السنة الدراسية كاملة" },
              { value: "single_term", label: "فصل دراسي واحد" },
            ]}
            onChange={(event) => {
              const billingPeriod = event.target.value as FeePlanFormState["billingPeriod"];
              const next: FeePlanFormState = {
                ...form,
                billingPeriod,
                academicTermId: billingPeriod === "single_term" ? form.academicTermId : "",
              };
              onChange(applyBillingContext(next, academicYears));
            }}
          />
          <Select
            label="السنة الدراسية"
            value={form.academicYearId}
            options={yearOptions}
            onChange={(event) => {
              const academicYearId = event.target.value;
              const year = academicYears.find((item) => item.id === academicYearId);
              const next: FeePlanFormState = {
                ...form,
                academicYearId,
                academicTermId: year?.terms[0]?.id ?? "",
              };
              onChange(applyBillingContext(next, academicYears));
            }}
          />
          {form.billingPeriod === "single_term" ? (
            <Select
              label="الفصل الدراسي"
              value={form.academicTermId}
              options={termOptions}
              onChange={(event) =>
                onChange(
                  applyBillingContext({ ...form, academicTermId: event.target.value }, academicYears)
                )
              }
            />
          ) : null}
          <MultiSelect
            label="المراحل الدراسية"
            options={selectableGradeOptions}
            value={form.gradeIds}
            onChange={(gradeIds) => onChange({ ...form, gradeIds })}
            countLabel="مراحل"
            placeholder="اختر مرحلة أو أكثر"
          />
          <NumberFieldWithKeypad
            fieldId="installmentsCount"
            label="عدد الدفعات"
            value={form.installmentsCount}
            onChange={(value) => onChange(updateInstallmentsCount(form, value, academicYears))}
            onDeactivate={() => onChange(normalizeInstallmentsCount(form, academicYears))}
            min={1}
            max={12}
            required
          />
        </div>
        {period ? (
          <p className="mt-4 rounded-xl border border-brand-blue/15 bg-white px-4 py-3 text-xs text-p-black/65">
            فترة الدفع المعتمدة: <span className="font-semibold text-p-black">{period.label}</span>
            <span dir="ltr" className="mx-1">
              ({period.start} — {period.end})
            </span>
            — يجب أن تقع كل الدفعات ضمن هذه الفترة وبترتيب زمني متتابع.
          </p>
        ) : (
          <p className="mt-4 text-xs text-amber-700">
            اختر السنة الدراسية {form.billingPeriod === "single_term" ? "والفصل " : ""}
            لتحديد فترة الدفع وإنشاء مواعيد الأقساط.
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-neutral-100">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 bg-white px-4 py-3 sm:px-5">
          <div>
            <h4 className="text-sm font-bold text-p-black">جدول الأقساط</h4>
            <p className="mt-0.5 text-xs text-p-black/50">
              {expectedCount > 0
                ? `يُنشأ تلقائياً ${expectedCount} دفعة — كل دفعة تبدأ بعد انتهاء السابقة.`
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
                  const minStart = getInstallmentStartMin(index, form.installments, period);
                  const minEnd = row.startDate || minStart || period?.start;
                  const maxDate = period?.end;

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
                          onDeactivate={() => onChange(syncLastInstallmentAmount(form))}
                          min={0}
                          max={999999}
                          inputClassName="w-28 py-1.5"
                        />
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <Input
                          label="البداية"
                          type="date"
                          value={row.startDate ?? ""}
                          min={minStart}
                          max={maxDate}
                          onChange={(e) =>
                            onChange(
                              updateInstallmentDate(
                                form,
                                index,
                                "startDate",
                                e.target.value,
                                academicYears
                              )
                            )
                          }
                        />
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <Input
                          label="النهاية"
                          type="date"
                          value={row.endDate ?? ""}
                          min={minEnd}
                          max={maxDate}
                          onChange={(e) =>
                            onChange(
                              updateInstallmentDate(
                                form,
                                index,
                                "endDate",
                                e.target.value,
                                academicYears
                              )
                            )
                          }
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
            !form.academicYearId ||
            (form.billingPeriod === "single_term" && !form.academicTermId) ||
            !form.installmentsCount ||
            Number(form.installmentsCount) < 1 ||
            !countMatchesRows ||
            !totalsMatch ||
            !period
          }
        >
          <Save className="h-4 w-4" />
          {saving ? "جاري الحفظ..." : form.id ? "حفظ التعديلات" : "حفظ الخطة"}
        </Button>
      </div>
    </form>
  );
}
