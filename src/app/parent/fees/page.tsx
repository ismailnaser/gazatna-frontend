"use client";

import { useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { mockPaymentNotices, mockStudent } from "@/data/mock";
import type { PaymentNotice } from "@/types";
import { Upload } from "lucide-react";

export default function ParentFeesPage() {
  const student = mockStudent;
  const [notices, setNotices] = useState(mockPaymentNotices);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    setTimeout(() => {
      const newNotice: PaymentNotice = {
        id: `p${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        amount: 500,
        status: "pending",
        note: "تم الإرسال — قيد المراجعة",
      };
      setNotices((prev) => [newNotice, ...prev]);
      setUploading(false);
      setUploaded(true);
    }, 1000);
  }

  return (
    <div>
      <PageHeader title="المالية" description="رصيد الحساب وإشعارات الدفع" />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "الإجمالي", value: `${student.balance.total} ₪` },
          { label: "المدفوع", value: `${student.balance.paid} ₪`, color: "text-p-green" },
          { label: "المتبقي", value: `${student.balance.remaining} ₪`, color: "text-p-red" },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-p-black/50">{item.label}</p>
            <p className={`mt-1 text-2xl font-bold ${item.color ?? "text-p-black"}`}>
              {item.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-bold text-p-black">
            <Upload className="h-5 w-5 text-p-green" />
            رفع إشعار دفع
          </h3>
          {uploaded && (
            <Alert variant="success" className="mb-4">
              تم إرسال الإشعار بنجاح. سيتم مراجعته من الإدارة.
            </Alert>
          )}
          <form onSubmit={handleUpload} className="space-y-4">
            <Input label="المبلغ (₪)" type="number" defaultValue="500" required />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-p-black/80">
                صورة الإشعار
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full text-sm text-p-black/60"
                required
              />
            </div>
            <Textarea label="ملاحظات" placeholder="اختياري" />
            <Button type="submit" disabled={uploading} className="w-full">
              {uploading ? "جاري الإرسال..." : "إرسال الإشعار"}
            </Button>
          </form>
        </Card>

        <Card className="overflow-x-auto p-0">
          <div className="border-b border-neutral-100 px-4 py-3">
            <h3 className="font-bold text-p-black">سجل الإشعارات</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-p-cream text-p-black/60">
                <th className="px-4 py-2 text-start">التاريخ</th>
                <th className="px-4 py-2 text-start">المبلغ</th>
                <th className="px-4 py-2 text-start">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((n) => (
                <tr key={n.id} className="border-b border-neutral-50">
                  <td className="px-4 py-3">{n.date}</td>
                  <td className="px-4 py-3">{n.amount} ₪</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={n.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
