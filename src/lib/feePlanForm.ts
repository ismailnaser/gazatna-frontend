import type { AcademicYear } from "@/types/academic";
import type { FeeInstallmentItem, FeePlan } from "@/types/finance";

export type FeePlanBillingPeriod = "full_year" | "single_term";

export type FeePlanFormState = {
  id: string;
  name: string;
  totalAmount: string;
  installmentsCount: string;
  billingPeriod: FeePlanBillingPeriod;
  academicYearId: string;
  academicTermId: string;
  gradeIds: string[];
  installments: FeeInstallmentItem[];
};

export const DEFAULT_FEE_PLAN_FORM: FeePlanFormState = {
  id: "",
  name: "",
  totalAmount: "2500",
  installmentsCount: "3",
  billingPeriod: "full_year",
  academicYearId: "",
  academicTermId: "",
  gradeIds: [],
  installments: buildInstallments(3, 2500),
};

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function splitTotalAmount(total: number, count: number): number[] {
  if (count <= 0) return [];
  const safeTotal = Math.max(0, Math.round(total));
  const base = Math.floor(safeTotal / count);
  const remainder = safeTotal - base * count;
  const amounts = Array.from({ length: count }, () => base);
  amounts[count - 1] = base + remainder;
  return amounts;
}

function dayAfter(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function resolveBillingPeriodBounds(
  form: Pick<FeePlanFormState, "billingPeriod" | "academicYearId" | "academicTermId">,
  years: AcademicYear[]
): { start: string; end: string; label: string } | null {
  const year = years.find((item) => item.id === form.academicYearId);
  if (!year) return null;

  if (form.billingPeriod === "single_term") {
    const term = year.terms.find((item) => item.id === form.academicTermId);
    if (!term) return null;
    return {
      start: term.startDate,
      end: term.endDate,
      label: `${year.name} — ${term.name}`,
    };
  }

  return {
    start: year.startDate,
    end: year.endDate,
    label: year.name,
  };
}

export function splitPeriodIntoInstallmentWindows(
  count: number,
  start: string,
  end: string
): Array<{ startDate: string; endDate: string }> {
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs || count < 1) {
    return [];
  }

  const totalDays = Math.floor((endMs - startMs) / 86400000) + 1;
  const baseDays = Math.floor(totalDays / count);
  let remainder = totalDays - baseDays * count;
  const windows: Array<{ startDate: string; endDate: string }> = [];
  let cursor = startMs;

  for (let index = 0; index < count; index += 1) {
    const span = baseDays + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    const windowStart = new Date(cursor);
    const windowEnd = new Date(cursor + (span - 1) * 86400000);
    windows.push({
      startDate: windowStart.toISOString().slice(0, 10),
      endDate: windowEnd.toISOString().slice(0, 10),
    });
    cursor = windowEnd.getTime() + 86400000;
  }

  return windows;
}

function monthWindow(base: Date, offset: number): { startDate: string; endDate: string } {
  const start = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  const end = new Date(base.getFullYear(), base.getMonth() + offset + 1, 0);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export function buildInstallments(
  count: number,
  total: number,
  existing: FeeInstallmentItem[] = [],
  period?: { start: string; end: string } | null
) {
  const safeCount = Math.min(12, Math.max(1, count));
  const amounts = splitTotalAmount(total, safeCount);
  const windows = period ? splitPeriodIntoInstallmentWindows(safeCount, period.start, period.end) : [];
  const today = new Date();
  const rows: FeeInstallmentItem[] = [];

  for (let index = 0; index < safeCount; index += 1) {
    const prev = existing[index];
    let startDate = prev?.startDate ?? "";
    let endDate = prev?.endDate ?? "";

    if (windows[index]) {
      startDate = windows[index].startDate;
      endDate = windows[index].endDate;
    } else if (!startDate && !endDate) {
      ({ startDate, endDate } = monthWindow(today, index));
    }

    rows.push({
      order: index + 1,
      amount: amounts[index] ?? 0,
      startDate,
      endDate,
    });
  }

  return rows;
}

export function feePlanToForm(plan: FeePlan, years: AcademicYear[] = []): FeePlanFormState {
  const count = plan.installmentsCount || plan.installments.length || 1;
  const draft: FeePlanFormState = {
    id: plan.id,
    name: plan.name,
    totalAmount: String(plan.totalAmount),
    installmentsCount: String(count),
    billingPeriod: plan.billingPeriod ?? "full_year",
    academicYearId: plan.academicYearId ?? "",
    academicTermId: plan.academicTermId ?? "",
    gradeIds: plan.gradeIds,
    installments:
      plan.installments.length === count
        ? plan.installments.map((row) => ({ ...row }))
        : buildInstallments(count, plan.totalAmount, plan.installments),
  };
  const period = resolveBillingPeriodBounds(draft, years);
  return {
    ...draft,
    installments:
      plan.installments.length === count && plan.installments.every((row) => row.startDate && row.endDate)
        ? draft.installments
        : buildInstallments(count, plan.totalAmount, draft.installments, period),
  };
}

export function rebuildInstallmentsForCount(
  prev: FeePlanFormState,
  count: number,
  years: AcademicYear[] = []
): FeePlanFormState {
  const total = Number(prev.totalAmount) || 0;
  const safeCount = Math.min(12, Math.max(1, count));
  const period = resolveBillingPeriodBounds(prev, years);
  return {
    ...prev,
    installmentsCount: String(safeCount),
    installments: buildInstallments(safeCount, total, prev.installments, period),
  };
}

export function applyBillingContext(prev: FeePlanFormState, years: AcademicYear[]): FeePlanFormState {
  const count = Number(prev.installmentsCount);
  if (!prev.installmentsCount || !Number.isFinite(count) || count < 1) {
    return prev;
  }
  return rebuildInstallmentsForCount(prev, count, years);
}

export function updateInstallmentsCount(
  prev: FeePlanFormState,
  raw: string,
  years: AcademicYear[] = [],
  max = 12
): FeePlanFormState {
  if (raw === "") {
    return { ...prev, installmentsCount: "", installments: [] };
  }

  const count = Number(raw);
  if (!Number.isFinite(count) || count < 1 || count > max) {
    return { ...prev, installmentsCount: raw, installments: [] };
  }

  return rebuildInstallmentsForCount(prev, count, years);
}

export function normalizeInstallmentsCount(prev: FeePlanFormState, years: AcademicYear[] = []): FeePlanFormState {
  const parsed = Number(prev.installmentsCount);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return rebuildInstallmentsForCount(prev, 1, years);
  }
  return rebuildInstallmentsForCount(prev, parsed, years);
}

export function applyTotalToInstallments(
  prev: FeePlanFormState,
  totalAmount: string,
  years: AcademicYear[] = []
): FeePlanFormState {
  const count = Number(prev.installmentsCount);
  if (!prev.installmentsCount || !Number.isFinite(count) || count < 1) {
    return { ...prev, totalAmount };
  }
  return rebuildInstallmentsForCount({ ...prev, totalAmount }, count, years);
}

export function installmentsTotal(installments: FeeInstallmentItem[]) {
  return installments.reduce((sum, row) => sum + Math.round(Number(row.amount || 0)), 0);
}

export function installmentsMatchTotal(installments: FeeInstallmentItem[], total: number) {
  const target = Math.max(0, Math.round(total));
  return installmentsTotal(installments) === target;
}

export function syncLastInstallmentAmount(form: FeePlanFormState): FeePlanFormState {
  const target = Math.max(0, Math.round(Number(form.totalAmount) || 0));
  if (form.installments.length <= 1) return form;

  const sumExceptLast = form.installments
    .slice(0, -1)
    .reduce((sum, row) => sum + Math.round(Number(row.amount) || 0), 0);
  const lastIndex = form.installments.length - 1;
  const installments = [...form.installments];
  installments[lastIndex] = {
    ...installments[lastIndex],
    amount: Math.max(0, target - sumExceptLast),
  };
  return { ...form, installments };
}

export function getInstallmentStartMin(
  index: number,
  installments: FeeInstallmentItem[],
  period: { start: string; end: string } | null
): string | undefined {
  if (!period) return undefined;
  if (index === 0) return period.start;
  const previousEnd = installments[index - 1]?.endDate;
  if (!previousEnd) return period.start;
  return dayAfter(previousEnd);
}

export function normalizeInstallmentDates(
  installments: FeeInstallmentItem[],
  period: { start: string; end: string } | null
): FeeInstallmentItem[] {
  if (!period) return installments;

  const next = installments.map((row) => ({ ...row }));
  for (let index = 0; index < next.length; index += 1) {
    const minStart = getInstallmentStartMin(index, next, period) ?? period.start;
    if (next[index].startDate && next[index].startDate < minStart) {
      next[index].startDate = minStart;
    }
    if (next[index].endDate && next[index].startDate && next[index].endDate < next[index].startDate) {
      next[index].endDate = next[index].startDate;
    }
    if (next[index].endDate && next[index].endDate > period.end) {
      next[index].endDate = period.end;
    }
    if (next[index].startDate && next[index].startDate > period.end) {
      next[index].startDate = period.end;
    }
  }
  return next;
}

export function updateInstallmentDate(
  form: FeePlanFormState,
  index: number,
  field: "startDate" | "endDate",
  value: string,
  years: AcademicYear[]
): FeePlanFormState {
  const installments = [...form.installments];
  installments[index] = { ...installments[index], [field]: value };

  if (field === "endDate" && installments[index + 1] && value) {
    const nextStart = dayAfter(value);
    if (!installments[index + 1].startDate || installments[index + 1].startDate <= value) {
      installments[index + 1] = { ...installments[index + 1], startDate: nextStart };
    }
  }

  const period = resolveBillingPeriodBounds(form, years);
  return {
    ...form,
    installments: normalizeInstallmentDates(installments, period),
  };
}

export function getOccupiedFeePlanGradeIds(
  plans: FeePlan[],
  excludePlanId = ""
): Map<string, string> {
  const occupied = new Map<string, string>();
  for (const plan of plans) {
    if (excludePlanId && plan.id === excludePlanId) continue;
    for (const gradeId of plan.gradeIds) {
      if (!occupied.has(gradeId)) {
        occupied.set(gradeId, plan.name);
      }
    }
  }
  return occupied;
}

export function validateFeePlanForm(
  form: FeePlanFormState,
  years: AcademicYear[],
  plans: FeePlan[] = []
): string | null {
  if (!form.name.trim()) return "يرجى إدخال اسم الخطة";
  if (!form.academicYearId) return "يرجى اختيار السنة الدراسية";
  if (form.billingPeriod === "single_term" && !form.academicTermId) {
    return "يرجى اختيار الفصل الدراسي";
  }

  const occupiedGrades = getOccupiedFeePlanGradeIds(plans, form.id);
  for (const gradeId of form.gradeIds) {
    const planName = occupiedGrades.get(gradeId);
    if (planName) {
      return `لا يمكن إسناد نفس المرحلة لأكثر من خطة — المرحلة مضافة مسبقاً في «${planName}»`;
    }
  }

  const period = resolveBillingPeriodBounds(form, years);
  if (!period) return "تعذر تحديد فترة الدفع من السنة أو الفصل المحدد";

  const count = Number(form.installmentsCount) || form.installments.length;
  if (!count || count < 1) return "يرجى تحديد عدد الدفعات";

  const rows = form.installments.slice(0, count);
  let previousEnd: string | null = null;

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const label = `الدفعة ${index + 1}`;

    if (!row.startDate || !row.endDate) {
      return `يجب تحديد بداية ونهاية ${label}`;
    }

    if (row.endDate < row.startDate) {
      return `تاريخ نهاية ${label} يجب أن يكون بعد تاريخ البداية`;
    }

    if (row.startDate < period.start || row.endDate > period.end) {
      return `مواعيد ${label} يجب أن تقع ضمن فترة ${period.label} (${period.start} — ${period.end})`;
    }

    if (previousEnd) {
      const minStart = dayAfter(previousEnd);
      if (row.startDate < minStart) {
        return `بداية ${label} يجب أن تكون بعد انتهاء الدفعة السابقة (${previousEnd})`;
      }
    }

    previousEnd = row.endDate;
  }

  if (!installmentsMatchTotal(rows, Number(form.totalAmount))) {
    return "مجموع مبالغ الدفعات يجب أن يساوي إجمالي القسط";
  }

  return null;
}

export function formatPlanPayload(form: FeePlanFormState) {
  const count = Number(form.installmentsCount) || form.installments.length || 1;
  const installments = form.installments.slice(0, count).map((row, index) => ({
    order: index + 1,
    amount: Math.round(Number(row.amount)),
    startDate: row.startDate || null,
    endDate: row.endDate || null,
  }));

  return {
    name: form.name.trim(),
    totalAmount: Math.max(0, Math.round(Number(form.totalAmount))),
    installmentsCount: count,
    billingPeriod: form.billingPeriod,
    academicYearId: form.academicYearId ? Number(form.academicYearId) : null,
    academicTermId:
      form.billingPeriod === "single_term" && form.academicTermId
        ? Number(form.academicTermId)
        : null,
    isActive: true,
    gradeIds: form.gradeIds.map(Number),
    installments,
  };
}

export function createDefaultFeePlanForm(years: AcademicYear[]): FeePlanFormState {
  const activeYear = years.find((year) => year.isActive) ?? years[0];
  const base: FeePlanFormState = {
    ...DEFAULT_FEE_PLAN_FORM,
    academicYearId: activeYear?.id ?? "",
    academicTermId: activeYear?.terms[0]?.id ?? "",
  };
  return applyBillingContext(base, years);
}
