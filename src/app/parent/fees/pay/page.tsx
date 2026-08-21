"use client";

import { useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Textarea } from "@/components/atoms/Textarea";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { FileUploadField } from "@/components/molecules/FileUploadField";
import { ParentNoStudentCard } from "@/components/parent/ParentAccessCards";
import { NumberFieldWithKeypad } from "@/components/teacher/NumberFieldWithKeypad";
import { useParentFees } from "@/hooks/useParentFees";
import { api } from "@/lib/api";
import { Upload } from "lucide-react";

export default function ParentFeesPayPage() {
  const { student, loading, reload } = useParentFees();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");

  if (!student && !loading) {
    return <ParentNoStudentCard />;
  }

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault();
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
      await reload();
    } catch {
      setError("تعذر إرسال إشعار الدفع");
    } finally {
      setUploading(false);
    }
  }

  return (
    <WorkspacePage
      title="رفع إشعار دفع"
      description="أرسل صورة الإيصال ليُراجع من الإدارة."
      breadcrumbs={[
        { label: "الرئيسية", href: "/parent" },
        { label: "المالية", href: "/parent/fees" },
        { label: "رفع إشعار دفع" },
      ]}
      loading={loading}
    >
      <Card>
        <h3 className="mb-4 flex items-center gap-2 font-bold text-p-black">
          <Upload className="h-5 w-5 text-p-green" />
          رفع إشعار دفع
        </h3>
        {uploaded ? (
          <Alert variant="success" className="mb-4">
            تم إرسال الإشعار بنجاح. سيتم مراجعته من الإدارة وخصم المبلغ بعد الاعتماد.
          </Alert>
        ) : null}
        {error ? (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        ) : null}
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
    </WorkspacePage>
  );
}
