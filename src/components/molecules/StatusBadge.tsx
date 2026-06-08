import { Badge } from "@/components/atoms/Badge";
import type { PaymentStatus } from "@/types";

const labels: Record<PaymentStatus, string> = {
  pending: "قيد المراجعة",
  approved: "تم القبول",
  rejected: "مرفوض",
};

const variants: Record<PaymentStatus, "warning" | "success" | "danger"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export function StatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
