import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import type { FeeInstallmentItem, FeeInstallmentNotification, InstallmentStatus } from "@/types/finance";
import { Calendar, CreditCard } from "lucide-react";

const statusLabels: Record<InstallmentStatus, string> = {
  paid: "مدفوعة",
  partial: "مدفوعة جزئياً",
  due: "مستحقة الآن",
  overdue: "متأخرة",
  upcoming: "قادمة",
  unscheduled: "لم يُحدَّد موعدها",
};

const statusVariants: Record<InstallmentStatus, "success" | "warning" | "danger" | "info"> = {
  paid: "success",
  partial: "warning",
  due: "warning",
  overdue: "danger",
  upcoming: "info",
  unscheduled: "info",
};

export function InstallmentNotifications({
  notifications,
}: {
  notifications: FeeInstallmentNotification[];
}) {
  if (notifications.length === 0) return null;

  return (
    <div className="space-y-3">
      {notifications.map((notice) => (
        <Alert
          key={notice.id}
          variant={notice.status === "overdue" ? "error" : "warning"}
        >
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold text-p-black">
                إشعار دفعة {notice.order} — {notice.remaining} ₪
              </p>
              <p className="mt-1 text-sm text-p-black/70">
                المبلغ الكلي: {notice.amount} ₪ — من {notice.startDate} إلى {notice.endDate}
              </p>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}

export function InstallmentSchedule({
  installments,
}: {
  installments: FeeInstallmentItem[];
}) {
  const scheduled = installments.filter((inst) => inst.scheduled);
  if (scheduled.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        لم تُحدَّد مواعيد الدفعات بعد. ستظهر هنا عند إعلانها من الإدارة.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {scheduled.map((inst) => (
        <div
          key={inst.order}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-100 px-4 py-3"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-p-green/10">
              <Calendar className="h-4 w-4 text-p-green" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-p-black">الدفعة {inst.order}</p>
                {inst.status && (
                  <Badge variant={statusVariants[inst.status]}>{statusLabels[inst.status]}</Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-p-black/60">
                بداية الدفع: {inst.startDate} — آخر موعد: {inst.endDate}
              </p>
            </div>
          </div>
          <div className="text-end text-sm">
            <p className="font-medium text-p-black">{inst.amount} ₪</p>
            {(inst.paidToward ?? 0) > 0 && (
              <p className="text-p-green">مدفوع: {inst.paidToward} ₪</p>
            )}
            {(inst.remaining ?? 0) > 0 && (
              <p className="text-p-red">متبقي: {inst.remaining} ₪</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
