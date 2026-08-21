"use client";

import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Textarea } from "@/components/atoms/Textarea";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { useAdminSiteSettings } from "@/hooks/useAdminSiteSettings";
import { Check } from "lucide-react";

export default function AdminSiteAboutPage() {
  const { settings, setSettings, loading, saving, success, error, save } = useAdminSiteSettings();

  function setAbout(key: "description" | "vision" | "mission", val: string) {
    setSettings((prev) => (prev ? { ...prev, about: { ...prev.about, [key]: val } } : prev));
  }

  return (
    <WorkspacePage
      title="من نحن"
      description="محتوى صفحة التعريف بالمدرسة."
      breadcrumbs={[{ label: "إعدادات الموقع", href: "/admin/site" }, { label: "من نحن" }]}
      loading={loading}
      loadingMessage="جاري تحميل الإعدادات..."
    >
      {success ? <Alert variant="success" className="mb-4">{success}</Alert> : null}
      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}
      {settings ? (
        <Card className="space-y-4">
          <Textarea label="وصف المدرسة" value={settings.about.description} onChange={(e) => setAbout("description", e.target.value)} />
          <Textarea label="رؤيتنا" value={settings.about.vision} onChange={(e) => setAbout("vision", e.target.value)} />
          <Textarea label="رسالتنا" value={settings.about.mission} onChange={(e) => setAbout("mission", e.target.value)} />
          <Button onClick={save} disabled={saving}>
            <Check className="h-4 w-4" />
            {saving ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </Card>
      ) : null}
    </WorkspacePage>
  );
}
