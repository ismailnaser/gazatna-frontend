"use client";

import { Card } from "@/components/atoms/Card";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { EmptyState } from "@/components/molecules/EmptyState";
import { ParentNoStudentCard } from "@/components/parent/ParentAccessCards";
import { InstallmentNotifications, InstallmentSchedule } from "@/components/parent/InstallmentPanel";
import { useParentFees } from "@/hooks/useParentFees";

export default function ParentFeesBalancePage() {
  const { student, feeStatus, loading } = useParentFees();

  if (!student && !loading) {
    return <ParentNoStudentCard />;
  }

  return (
    <WorkspacePage
      title="الرصيد والأقساط"
      description="ملخص الحساب وجدول الأقساط المُعلَن عنها."
      breadcrumbs={[
        { label: "الرئيسية", href: "/parent" },
        { label: "المالية", href: "/parent/fees" },
        { label: "الرصيد والأقساط" },
      ]}
      loading={loading}
    >
      {student ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "الإجمالي", value: `${student.balance.total} ₪` },
            { label: "المدفوع", value: `${student.balance.paid} ₪`, color: "text-p-green" },
            { label: "المتبقي", value: `${student.balance.remaining} ₪`, color: "text-p-red" },
          ].map((item) => (
            <Card key={item.label}>
              <p className="text-sm text-p-black/72">{item.label}</p>
              <p className={`mt-1 text-2xl font-bold ${item.color ?? "text-p-black"}`}>
                {item.value}
              </p>
            </Card>
          ))}
        </div>
      ) : null}

      {feeStatus && feeStatus.notifications.length > 0 ? (
        <div className="mb-8">
          <InstallmentNotifications notifications={feeStatus.notifications} />
        </div>
      ) : null}

      {feeStatus ? (
        <Card>
          <h3 className="mb-4 font-bold text-p-black">جدول الأقساط المُعلَن عنها</h3>
          <InstallmentSchedule installments={feeStatus.installments} />
        </Card>
      ) : (
        <EmptyState title="لا توجد بيانات أقساط حالياً." />
      )}
    </WorkspacePage>
  );
}
