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

export function buildInstallments(count: number, total: number, existing: FeeInstallmentItem[] = []) {
  const per = Math.ceil(total / count);
  const today = new Date();
  const rows: FeeInstallmentItem[] = [];

  for (let i = 0; i < count; i++) {
    const prev = existing[i];
    let startDate = prev?.startDate ?? "";
    let endDate = prev?.endDate ?? "";

    if (!startDate && !endDate && i === 0) {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      startDate = start.toISOString().slice(0, 10);
      endDate = end.toISOString().slice(0, 10);
    }

    const amount = prev?.amount ?? (i === count - 1 ? total - per * (count - 1) : per);

    rows.push({
      order: i + 1,
      amount,
      startDate,
      endDate,
    });
  }

  return rows;
}

export function feePlanToForm(plan: FeePlan): FeePlanFormState {
  return {
    id: plan.id,
    name: plan.name,
    totalAmount: String(plan.totalAmount),
    installmentsCount: String(plan.installmentsCount),
    gradeIds: plan.gradeIds,
    installments: plan.installments.map((row) => ({ ...row })),
  };
}

export function rebuildInstallmentsForCount(
  prev: FeePlanFormState,
  count: number
): FeePlanFormState {
  const total = Number(prev.totalAmount) || 0;
  if (count < 1) return prev;
  return {
    ...prev,
    installmentsCount: String(count),
    installments: buildInstallments(count, total, prev.installments),
  };
}

export function applyTotalToInstallments(prev: FeePlanFormState, totalAmount: string): FeePlanFormState {
  const total = Number(totalAmount) || 0;
  const count = Number(prev.installmentsCount) || 1;
  const per = Math.ceil(total / count);
  return {
    ...prev,
    totalAmount,
    installments: prev.installments.map((row, index) => ({
      ...row,
      amount: index === count - 1 ? total - per * (count - 1) : per,
    })),
  };
}

export function installmentsTotal(installments: FeeInstallmentItem[]) {
  return installments.reduce((sum, row) => sum + Number(row.amount || 0), 0);
}

export function formatPlanPayload(form: FeePlanFormState) {
  return {
    name: form.name.trim(),
    totalAmount: Number(form.totalAmount),
    installmentsCount: Number(form.installmentsCount),
    isActive: true,
    gradeIds: form.gradeIds.map(Number),
    installments: form.installments.map((row) => ({
      order: row.order,
      amount: Number(row.amount),
      startDate: row.startDate || null,
      endDate: row.endDate || null,
    })),
  };
}
