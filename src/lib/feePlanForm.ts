import type { FeeInstallmentItem, FeePlan } from "@/types/finance";

export type FeePlanFormState = {
  id: string;
  name: string;
  totalAmount: string;
  installmentsCount: string;
  gradeIds: string[];
  installments: FeeInstallmentItem[];
};

export const DEFAULT_FEE_PLAN_FORM: FeePlanFormState = {
  id: "",
  name: "",
  totalAmount: "2500",
  installmentsCount: "3",
  gradeIds: [],
  installments: buildInstallments(3, 2500),
};

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** يقسّم الإجمالي إلى أعداد صحيحة؛ الفرق يُضاف للدفعة الأخيرة. */
export function splitTotalAmount(total: number, count: number): number[] {
  if (count <= 0) return [];
  const safeTotal = Math.max(0, Math.round(total));
  const base = Math.floor(safeTotal / count);
  const remainder = safeTotal - base * count;
  const amounts = Array.from({ length: count }, () => base);
  amounts[count - 1] = base + remainder;
  return amounts;
}

function monthWindow(base: Date, offset: number): { startDate: string; endDate: string } {
  const start = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  const end = new Date(base.getFullYear(), base.getMonth() + offset + 1, 0);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export function buildInstallments(count: number, total: number, existing: FeeInstallmentItem[] = []) {
  const safeCount = Math.min(12, Math.max(1, count));
  const amounts = splitTotalAmount(total, safeCount);
  const today = new Date();
  const rows: FeeInstallmentItem[] = [];

  for (let i = 0; i < safeCount; i++) {
    const prev = existing[i];
    let startDate = prev?.startDate ?? "";
    let endDate = prev?.endDate ?? "";

    if (!startDate && !endDate) {
      ({ startDate, endDate } = monthWindow(today, i));
    }

    rows.push({
      order: i + 1,
      amount: amounts[i] ?? 0,
      startDate,
      endDate,
    });
  }

  return rows;
}

export function feePlanToForm(plan: FeePlan): FeePlanFormState {
  const count = plan.installmentsCount || plan.installments.length || 1;
  const installments =
    plan.installments.length === count
      ? plan.installments.map((row) => ({ ...row }))
      : buildInstallments(count, plan.totalAmount, plan.installments);

  return {
    id: plan.id,
    name: plan.name,
    totalAmount: String(plan.totalAmount),
    installmentsCount: String(count),
    gradeIds: plan.gradeIds,
    installments,
  };
}

export function rebuildInstallmentsForCount(
  prev: FeePlanFormState,
  count: number
): FeePlanFormState {
  const total = Number(prev.totalAmount) || 0;
  const safeCount = Math.min(12, Math.max(1, count));
  return {
    ...prev,
    installmentsCount: String(safeCount),
    installments: buildInstallments(safeCount, total, prev.installments),
  };
}

export function updateInstallmentsCount(
  prev: FeePlanFormState,
  raw: string,
  max = 12
): FeePlanFormState {
  if (raw === "") {
    return { ...prev, installmentsCount: "", installments: [] };
  }

  const count = Number(raw);
  if (!Number.isFinite(count) || count < 1 || count > max) {
    return { ...prev, installmentsCount: raw, installments: [] };
  }

  return rebuildInstallmentsForCount(prev, count);
}

export function normalizeInstallmentsCount(prev: FeePlanFormState): FeePlanFormState {
  const parsed = Number(prev.installmentsCount);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return rebuildInstallmentsForCount(prev, 1);
  }
  return rebuildInstallmentsForCount(prev, parsed);
}

export function applyTotalToInstallments(prev: FeePlanFormState, totalAmount: string): FeePlanFormState {
  const count = Number(prev.installmentsCount);
  if (!prev.installmentsCount || !Number.isFinite(count) || count < 1) {
    return { ...prev, totalAmount };
  }
  return rebuildInstallmentsForCount({ ...prev, totalAmount }, count);
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
    isActive: true,
    gradeIds: form.gradeIds.map(Number),
    installments,
  };
}
