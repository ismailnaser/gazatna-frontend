"use client";

import Link from "next/link";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Checkbox } from "@/components/atoms/Checkbox";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { useAdminSiteSettings } from "@/hooks/useAdminSiteSettings";
import { useSchool } from "@/context/SchoolContext";
import { Check } from "lucide-react";

export default function AdminSiteRegistrationPage() {
  const { grades } = useSchool();
  const { settings, setSettings, loading, saving, success, error, save } = useAdminSiteSettings();

  function setReg(key: "showNotes" | "showBirthDate", val: boolean) {
    setSettings((prev) =>
      prev ? { ...prev, registration: { ...prev.registration, [key]: val } } : prev
    );
  }

  return (
    <WorkspacePage
      title="فورم التسجيل"
      description="تحكّم بالحقول الظاهرة في طلب القبول العام."
      breadcrumbs={[{ label: "إعدادات الموقع", href: "/admin/site" }, { label: "فورم التسجيل" }]}
      loading={loading}
      loadingMessage="جاري تحميل الإعدادات..."
    >
      {success ? <Alert variant="success" className="mb-4">{success}</Alert> : null}
      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}
      {settings ? (
        <Card className="max-w-xl space-y-5">
          <Checkbox
            checked={settings.registration.showBirthDate}
            onChange={(checked) => setReg("showBirthDate", checked)}
            label="إظهار حقل تاريخ الميلاد"
          />
          <Checkbox
            checked={settings.registration.showNotes}
            onChange={(checked) => setReg("showNotes", checked)}
            label="إظهار حقل الملاحظات الإضافية"
          />
          <div>
            <p className="mb-3 text-sm font-semibold">المراحل المتاحة في الفورم</p>
            {grades.length === 0 ? (
              <p className="text-sm text-p-black/65">
                لا توجد مراحل بعد.{" "}
                <Link href="/admin/classes" className="font-semibold text-brand-blue hover:underline">
                  أضفها من هنا
                </Link>
              </p>
            ) : (
              <div className="space-y-2">
                {grades.map((g) => (
                  <div key={g.id} className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-medium">
                    {g.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button onClick={save} disabled={saving}>
            <Check className="h-4 w-4" />
            {saving ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </Card>
      ) : null}
    </WorkspacePage>
  );
}
