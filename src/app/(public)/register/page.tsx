"use client";

import { useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { PublicPage } from "@/components/molecules/PublicPage";

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  }

  if (submitted) {
    return (
      <PublicPage title="طلب التسجيل" description="">
        <Alert variant="success">
          <p className="font-semibold">تم استلام طلبك بنجاح!</p>
          <p className="mt-1">سيتواصل معك فريق القبول خلال ٣ أيام عمل.</p>
        </Alert>
      </PublicPage>
    );
  }

  return (
    <PublicPage
      title="التسجيل والقبول"
      description="نموذج إلكتروني لحجز مقعد دراسي لابنك/ابنتك."
    >
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-xl space-y-4 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm"
      >
        <Input label="اسم الطالب" name="studentName" required />
        <Input label="تاريخ الميلاد" name="birthDate" type="date" required />
        <Select
          label="المرحلة الدراسية"
          name="grade"
          required
          options={[
            { value: "", label: "اختر المرحلة" },
            { value: "primary", label: "ابتدائي" },
            { value: "middle", label: "إعدادي" },
            { value: "high", label: "ثانوي" },
          ]}
        />
        <Input label="اسم ولي الأمر" name="parentName" required />
        <Input label="رقم الهاتف" name="phone" type="tel" required />
        <Input label="البريد الإلكتروني" name="email" type="email" required />
        <Textarea label="ملاحظات إضافية (اختياري)" name="notes" />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "جاري الإرسال..." : "إرسال الطلب"}
        </Button>
      </form>
    </PublicPage>
  );
}
