import type { AdminStudent } from "@/types";

export function formatClassLabel(grade: string, section?: string) {
  return section ? `${grade} / ${section}` : grade;
}

export function mapAdminStudent(s: Record<string, unknown>): AdminStudent {
  const balanceRaw = s.balance as Record<string, unknown> | undefined;
  return {
    id: String(s.id),
    name: String(s.name),
    grade: String(s.grade),
    section: s.section ? String(s.section) : undefined,
    classId: s.classId ? String(s.classId) : undefined,
    studentNumber: s.studentNumber ? String(s.studentNumber) : undefined,
    nationalId: s.nationalId ? String(s.nationalId) : undefined,
    username: s.username ? String(s.username) : undefined,
    generatedPassword: s.generatedPassword ? String(s.generatedPassword) : undefined,
    paymentStatus: s.paymentStatus as AdminStudent["paymentStatus"],
    balance: balanceRaw
      ? {
          total: Number(balanceRaw.total ?? 0),
          paid: Number(balanceRaw.paid ?? 0),
          remaining: Number(balanceRaw.remaining ?? 0),
        }
      : { total: 0, paid: 0, remaining: 0 },
    documents: Array.isArray(s.documents)
      ? (s.documents as Array<Record<string, unknown>>).map((d) => ({
          id: d.id ? String(d.id) : null,
          name: String(d.name ?? ""),
          url: d.url ? String(d.url) : null,
        }))
      : [],
    isActive: s.isActive !== undefined ? Boolean(s.isActive) : s.is_active !== false,
  };
}

export const PAYMENT_STATUS_LABELS: Record<AdminStudent["paymentStatus"], string> = {
  unpaid: "لم يُدفع",
  pending: "قيد المراجعة",
  approved: "مُقبول",
  rejected: "مرفوض",
};
