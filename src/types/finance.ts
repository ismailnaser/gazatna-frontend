import type { PaymentStatus } from "@/types";

export type InstallmentStatus =
  | "paid"
  | "partial"
  | "due"
  | "overdue"
  | "upcoming"
  | "unscheduled";

export type FeeInstallmentItem = {
  order: number;
  amount: number;
  startDate: string | null;
  endDate: string | null;
  scheduled?: boolean;
  status?: InstallmentStatus;
  paidToward?: number;
  remaining?: number;
};

export type FeeInstallmentNotification = {
  id: string;
  order: number;
  amount: number;
  remaining: number;
  startDate: string;
  endDate: string;
  status: InstallmentStatus;
  type: "installment";
  text: string;
};

export type FeeStatus = {
  blocked: boolean;
  fullyPaid: boolean;
  requiredAmount: number;
  message: string;
  currentInstallment: FeeInstallmentItem | null;
  installments: FeeInstallmentItem[];
  notifications: FeeInstallmentNotification[];
  accessOverrideUntil: string | null;
};

export type FeePlan = {
  id: string;
  name: string;
  totalAmount: number;
  installmentsCount: number;
  isActive: boolean;
  gradeIds: string[];
  gradeNames: string[];
  installments: FeeInstallmentItem[];
};

export type FinanceNotice = {
  id: string;
  studentId: string;
  studentName: string;
  declaredAmount: number;
  amount: number;
  status: PaymentStatus;
  date: string;
  note?: string;
  receiptUrl?: string | null;
  source?: "parent" | "manual";
  reviewedByName?: string | null;
};

export type ManualPaymentLog = {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  amount: number;
  date: string;
  note: string;
  reviewedByName: string;
};

export function mapFeePlan(raw: Record<string, unknown>): FeePlan {
  const installments = Array.isArray(raw.installments)
    ? raw.installments.map((row) => {
        const inst = row as Record<string, unknown>;
        return {
          order: Number(inst.order),
          amount: Number(inst.amount),
          startDate: inst.startDate != null ? String(inst.startDate) : null,
          endDate: inst.endDate != null ? String(inst.endDate) : null,
        };
      })
    : [];
  return {
    id: String(raw.id),
    name: String(raw.name),
    totalAmount: Number(raw.totalAmount),
    installmentsCount: Number(raw.installmentsCount),
    isActive: Boolean(raw.isActive),
    gradeIds: Array.isArray(raw.gradeIds) ? raw.gradeIds.map(String) : [],
    gradeNames: Array.isArray(raw.gradeNames) ? raw.gradeNames.map(String) : [],
    installments,
  };
}

export function mapFinanceNotice(raw: Record<string, unknown>): FinanceNotice {
  return {
    id: String(raw.id),
    studentId: String(raw.studentId),
    studentName: String(raw.studentName),
    declaredAmount: Number(raw.declaredAmount ?? raw.amount),
    amount: Number(raw.amount),
    status: raw.status as PaymentStatus,
    date: String(raw.date),
    note: raw.note ? String(raw.note) : undefined,
    receiptUrl: raw.receiptUrl ? String(raw.receiptUrl) : null,
    source: raw.source === "manual" ? "manual" : "parent",
    reviewedByName: raw.reviewedByName ? String(raw.reviewedByName) : null,
  };
}

export function mapManualPaymentLog(raw: Record<string, unknown>): ManualPaymentLog {
  return {
    id: String(raw.id),
    studentId: String(raw.studentId),
    studentName: String(raw.studentName),
    studentNumber: String(raw.studentNumber ?? ""),
    amount: Number(raw.amount),
    date: String(raw.date),
    note: String(raw.note ?? ""),
    reviewedByName: String(raw.reviewedByName ?? "—"),
  };
}

export function mapFeeStatus(raw: Record<string, unknown> | null | undefined): FeeStatus | null {
  if (!raw) return null;
  const mapInst = (inst: Record<string, unknown>): FeeInstallmentItem => ({
    order: Number(inst.order),
    amount: Number(inst.amount),
    startDate: inst.startDate != null ? String(inst.startDate) : null,
    endDate: inst.endDate != null ? String(inst.endDate) : null,
    scheduled: inst.scheduled != null ? Boolean(inst.scheduled) : undefined,
    status: inst.status ? (inst.status as InstallmentStatus) : undefined,
    paidToward: inst.paidToward != null ? Number(inst.paidToward) : undefined,
    remaining: inst.remaining != null ? Number(inst.remaining) : undefined,
  });
  const mapNotification = (n: Record<string, unknown>): FeeInstallmentNotification => ({
    id: String(n.id),
    order: Number(n.order),
    amount: Number(n.amount),
    remaining: Number(n.remaining),
    startDate: String(n.startDate),
    endDate: String(n.endDate),
    status: n.status as InstallmentStatus,
    type: "installment",
    text: String(n.text),
  });
  return {
    blocked: Boolean(raw.blocked),
    fullyPaid: Boolean(raw.fullyPaid),
    requiredAmount: Number(raw.requiredAmount ?? 0),
    message: String(raw.message ?? ""),
    currentInstallment: raw.currentInstallment
      ? mapInst(raw.currentInstallment as Record<string, unknown>)
      : null,
    installments: Array.isArray(raw.installments)
      ? raw.installments.map((row) => mapInst(row as Record<string, unknown>))
      : [],
    notifications: Array.isArray(raw.notifications)
      ? raw.notifications.map((row) => mapNotification(row as Record<string, unknown>))
      : [],
    accessOverrideUntil: raw.accessOverrideUntil ? String(raw.accessOverrideUntil) : null,
  };
}
