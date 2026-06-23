"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { PublicPage } from "@/components/molecules/PublicPage";
import { api } from "@/lib/api";
import { nationalIdInputProps, validateNationalId } from "@/lib/nationalId";

type RegSettings = {
  showNotes: boolean;
  showBirthDate: boolean;
  gradeChoices: Array<{ value: string; label: string }>;
};

const DEFAULT_REG: RegSettings = {
  showNotes: true,
  showBirthDate: true,
  gradeChoices: [],
};

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reg, setReg] = useState<RegSettings>(DEFAULT_REG);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getSiteSettings()
      .then((res) => {
        const s = res as { registration?: Partial<RegSettings> };
        if (s.registration) setReg({ ...DEFAULT_REG, ...s.registration });
      })
      .catch(() => {});
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const nationalIdError = validateNationalId(String(form.get("nationalId") ?? ""), {
      required: true,
    });
    if (nationalIdError) {
      setError(nationalIdError);
      return;
    }
    setLoading(true);
    const payload = {
      studentName: String(form.get("studentName") ?? ""),
      nationalId: String(form.get("nationalId") ?? "").trim(),
      birthDate: String(form.get("birthDate") ?? ""),
      grade: String(form.get("grade") ?? ""),
      parentName: String(form.get("parentName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      notes: String(form.get("notes") ?? ""),
    };
    api
      .submitAdmissionApplication(payload)
      .then(() => setSubmitted(true))
      .catch((e) => setError(e instanceof Error ? e.message : "تعذر إرسال الطلب"))
      .finally(() => setLoading(false));
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
        {error && <Alert variant="error">{error}</Alert>}
        <Input label="اسم الطالب" name="studentName" required />
        <Input
          label="رقم هوية الطالب"
          name="nationalId"
          required
          placeholder="9 أرقام"
          {...nationalIdInputProps}
        />
        {reg.showBirthDate && (
          <Input label="تاريخ الميلاد" name="birthDate" type="date" required />
        )}
        <Select
          label="المرحلة الدراسية"
          name="grade"
          required
          options={[
            { value: "", label: "اختر المرحلة" },
            ...reg.gradeChoices,
          ]}
        />
        <Input label="اسم ولي الأمر" name="parentName" required />
        <Input label="رقم الهاتف" name="phone" type="tel" required />
        <Input label="البريد الإلكتروني" name="email" type="email" required />
        {reg.showNotes && (
          <Textarea label="ملاحظات إضافية (اختياري)" name="notes" />
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "جاري الإرسال..." : "إرسال الطلب"}
        </Button>
      </form>
    </PublicPage>
  );
}
