"use client";

import { Card } from "@/components/atoms/Card";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { EmptyState } from "@/components/molecules/EmptyState";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { ParentNoStudentCard } from "@/components/parent/ParentAccessCards";
import { useParentFees } from "@/hooks/useParentFees";

export default function ParentFeesHistoryPage() {
  const { student, notices, loading } = useParentFees();

  if (!student && !loading) {
    return <ParentNoStudentCard />;
  }

  return (
    <WorkspacePage
      title="سجل الإشعارات"
      description="إشعارات الدفع المرسلة وحالتها."
      breadcrumbs={[
        { label: "الرئيسية", href: "/parent" },
        { label: "المالية", href: "/parent/fees" },
        { label: "سجل الإشعارات" },
      ]}
      loading={loading}
    >
      {notices.length === 0 ? (
        <EmptyState title="لا توجد إشعارات دفع." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-p-cream text-p-black/78">
                <th className="px-4 py-2 text-start">التاريخ</th>
                <th className="px-4 py-2 text-start">المبلغ</th>
                <th className="px-4 py-2 text-start">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((notice) => (
                <tr key={notice.id} className="border-b border-neutral-50">
                  <td className="px-4 py-3">{notice.date}</td>
                  <td className="px-4 py-3">{notice.declaredAmount ?? notice.amount} ₪</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={notice.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </WorkspacePage>
  );
}
