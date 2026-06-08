"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { mockFinanceNotices } from "@/data/mock";
import type { FinanceNotice, PaymentStatus } from "@/types";
import { Check, Image, X } from "lucide-react";

export default function AdminFinancePage() {
  const [notices, setNotices] = useState(mockFinanceNotices);

  function updateStatus(id: string, status: PaymentStatus) {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status } : n))
    );
  }

  return (
    <div>
      <PageHeader
        title="مراجعة المالية"
        description="إشعارات الدفع الواردة من أولياء الأمور"
      />

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-p-cream text-p-black/60">
              <th className="px-4 py-3 text-start font-semibold">الطالب</th>
              <th className="px-4 py-3 text-start font-semibold">المبلغ</th>
              <th className="px-4 py-3 text-start font-semibold">التاريخ</th>
              <th className="px-4 py-3 text-start font-semibold">الإشعار</th>
              <th className="px-4 py-3 text-start font-semibold">الحالة</th>
              <th className="px-4 py-3 text-start font-semibold">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {notices.map((n) => (
              <tr key={n.id} className="border-b border-neutral-50">
                <td className="px-4 py-3 font-medium text-p-black">{n.studentName}</td>
                <td className="px-4 py-3">{n.amount} ₪</td>
                <td className="px-4 py-3">{n.date}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-p-black/50">
                    <Image className="h-4 w-4" />
                    صورة
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={n.status} />
                </td>
                <td className="px-4 py-3">
                  {n.status === "pending" && (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        className="px-2 py-1 text-xs"
                        onClick={() => updateStatus(n.id, "approved")}
                      >
                        <Check className="h-3 w-3" />
                        موافقة
                      </Button>
                      <Button
                        variant="danger"
                        className="px-2 py-1 text-xs"
                        onClick={() => updateStatus(n.id, "rejected")}
                      >
                        <X className="h-3 w-3" />
                        رفض
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
