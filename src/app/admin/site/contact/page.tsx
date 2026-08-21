"use client";

import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { useAdminSiteSettings } from "@/hooks/useAdminSiteSettings";
import { Check } from "lucide-react";

export default function AdminSiteContactPage() {
  const { settings, setSettings, loading, saving, success, error, save } = useAdminSiteSettings();

  function setContact(key: "address" | "phone" | "email" | "footerTagline", val: string) {
    setSettings((prev) => (prev ? { ...prev, contact: { ...prev.contact, [key]: val } } : prev));
  }

  return (
    <WorkspacePage
      title="التواصل والفوتر"
      description="بيانات تظهر في صفحة التواصل وتذييل الموقع."
      breadcrumbs={[{ label: "إعدادات الموقع", href: "/admin/site" }, { label: "التواصل" }]}
      loading={loading}
      loadingMessage="جاري تحميل الإعدادات..."
    >
      {success ? <Alert variant="success" className="mb-4">{success}</Alert> : null}
      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}
      {settings ? (
        <Card className="max-w-xl space-y-4">
          <Input label="العنوان" value={settings.contact.address} onChange={(e) => setContact("address", e.target.value)} />
          <Input label="رقم الهاتف" value={settings.contact.phone} onChange={(e) => setContact("phone", e.target.value)} />
          <Input label="البريد الإلكتروني" type="email" value={settings.contact.email} onChange={(e) => setContact("email", e.target.value)} />
          <Textarea label="نص الفوتر" value={settings.contact.footerTagline} onChange={(e) => setContact("footerTagline", e.target.value)} />
          <Button onClick={save} disabled={saving}>
            <Check className="h-4 w-4" />
            {saving ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </Card>
      ) : null}
    </WorkspacePage>
  );
}
