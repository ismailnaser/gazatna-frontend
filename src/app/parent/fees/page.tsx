"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { NumberFieldWithKeypad } from "@/components/teacher/NumberFieldWithKeypad";
import { Textarea } from "@/components/atoms/Textarea";
import { PageHeader } from "@/components/molecules/PageHeader";
import { FileUploadField } from "@/components/molecules/FileUploadField";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { InstallmentNotifications, InstallmentSchedule } from "@/components/parent/InstallmentPanel";
import { api } from "@/lib/api";
import type { PaymentNotice, PaymentStatus, Student } from "@/types";
import { mapFeeStatus, type FeeStatus } from "@/types/finance";
import { Upload } from "lucide-react";

export default function ParentFeesPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [notices, setNotices] = useState<PaymentNotice[]>([]);
  const [feeStatus, setFeeStatus] = useState<FeeStatus | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function loadFees() {
    return api.getParentFees().then((data) => {
      setStudent(data.student as Student);
      setNotices(
        (data.notices as Array<Record<string, unknown>>).map((n) => ({
          id: String(n.id),
          date: String(n.date),
          declaredAmount: Number(n.declaredAmount ?? n.amount),
          amount: Number(n.amount),
          status: n.status as PaymentStatus,
          note: n.note ? String(n.note) : undefined,
          receiptUrl: n.receiptUrl ? String(n.receiptUrl) : null,
        }))
      );
      setFeeStatus(mapFeeStatus(data.feeStatus as Record<string, unknown>));
    });
  }

  useEffect(() => {
    loadFees()
      .catch(() => {
        setStudent(null);
        setNotices([]);
        setFeeStatus(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!receipt) {
      setError("يرجى إرفاق صورة الإشعار");
      return;
    }
    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("amount", amount);
    form.append("note", note);
    form.append("receipt", receipt);
    try {
      await api.submitParentPayment(form);
      setUploaded(true);
      setAmount("");
      setNote("");
      setReceipt(null);
      await loadFees();
    } catch {
      setError("تعذر إرسال إشعار الدفع");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  if (!student) {
    return (
      <Card className="text-center text-neutral-500">
        لا يوجد طالب مرتبط بحسابك.
      </Card>
    );
  }

  return (
    <div>
      <PageHeader title="المالية" description="رصيد الحساب، جدول الأقساط، وإشعارات الدفع" />

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

      {feeStatus && feeStatus.notifications.length > 0 && (
        <div className="mb-8">
          <InstallmentNotifications notifications={feeStatus.notifications} />
        </div>
      )}

      {feeStatus && (
        <Card className="mb-8">
          <h3 className="mb-4 font-bold text-p-black">جدول الأقساط المُعلَن عنها</h3>
          <InstallmentSchedule installments={feeStatus.installments} />
        </Card>
      )}

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-bold text-p-black">
            <Upload className="h-5 w-5 text-p-green" />
            رفع إشعار دفع
          </h3>
          {uploaded && (
            <Alert variant="success" className="mb-4">
              تم إرسال الإشعار بنجاح. سيتم مراجعته من الإدارة وخصم المبلغ بعد الاعتماد.
            </Alert>
          )}
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}
          <form onSubmit={handleUpload} className="space-y-4">
            <NumberFieldWithKeypad
              fieldId="feeAmount"
              label="المبلغ (₪)"
              value={amount}
              onChange={setAmount}
              min={1}
              max={999999}
              allowDecimal
              maxDecimalPlaces={2}
              required
            />
            <FileUploadField
              label="صورة إشعار الدفع"
              preset="image"
              buttonText="اضغط لرفع صورة الإشعار"
              hint="صورة واضحة لإيصال أو إشعار الدفع"
              required
              selectedFileName={receipt?.name ?? null}
              onChange={(files) => setReceipt(files?.[0] ?? null)}
            />
            <Textarea
              label="ملاحظات"
              placeholder="اختياري"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button type="submit" disabled={uploading} className="w-full">
              {uploading ? "جاري الإرسال..." : "إرسال الإشعار"}
            </Button>
          </form>
        </Card>

        <Card className="overflow-x-auto p-0">
          <div className="border-b border-neutral-100 px-4 py-3">
            <h3 className="font-bold text-p-black">سجل الإشعارات</h3>
          </div>
          {notices.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-neutral-500">لا توجد إشعارات دفع.</p>
          ) : (
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
                    <td className="px-4 py-3">{n.declaredAmount ?? n.amount} ₪</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={n.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
