export type BlockedStudent = {
  id: string;
  name: string;
  studentNumber: string;
  nationalId?: string;
  grade: string;
  section: string;
  requiredAmount: number;
  installmentOrder?: number;
  installmentAmount?: number;
  installmentRemaining?: number;
  message: string;
  totalFees: number;
  paidFees: number;
  currentInstallment: {
    order: number;
    name?: string;
    amount: number;
    remaining?: number;
    endDate: string | null;
  } | null;
};

export type InactiveStudent = {
  id: string;
  name: string;
  studentNumber: string;
  nationalId?: string;
  grade: string;
  section: string;
  createdAt: string;
};

export function installmentDue(s: BlockedStudent): number {
  const remaining = s.installmentRemaining ?? s.currentInstallment?.remaining;
  if (remaining != null && remaining > 0) return remaining;
  const instAmount = s.installmentAmount ?? s.currentInstallment?.amount;
  if (instAmount != null && instAmount > 0 && s.requiredAmount >= s.totalFees) return instAmount;
  return s.requiredAmount;
}

export function installmentOrder(s: BlockedStudent): number {
  return s.installmentOrder ?? s.currentInstallment?.order ?? 1;
}

export function installmentOrderLabel(order: number) {
  return order === 1 ? "الأولى" : `رقم ${order}`;
}

export function installmentName(s: BlockedStudent): string {
  const name = s.currentInstallment?.name?.trim();
  if (name) return name;
  const order = installmentOrder(s);
  return `الدفعة ${order}`;
}

export function classLabel(grade: string, section?: string) {
  if (!grade) return "—";
  return section ? `${grade} / ${section}` : grade;
}
