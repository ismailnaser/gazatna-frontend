"use client";

import Link from "next/link";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Textarea } from "@/components/atoms/Textarea";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { useAdminSiteSettings } from "@/hooks/useAdminSiteSettings";
import { useSchool } from "@/context/SchoolContext";
import { Check } from "lucide-react";

export default function AdminSiteProgramsPage() {
  const { grades } = useSchool();
  const { settings, setSettings, loading, saving, success, error, save } = useAdminSiteSettings();

  function setProgramDescription(gradeName: string, description: string) {
    setSettings((prev) => {
      if (!prev) return prev;
      const existing = prev.programs ?? [];
      const idx = existing.findIndex((p) => p.grade === gradeName);
      const next =
        idx >= 0
          ? existing.map((p, i) => (i === idx ? { ...p, description } : p))
          : [...existing, { grade: gradeName, description }];
      return { ...prev, programs: next };
    });
  }

  return (
    <WorkspacePage
      title="البرامج التعليمية"
      description="النبذة الاختيارية لكل مرحلة في صفحة البرامج العامة."
      breadcrumbs={[{ label: "إعدادات الموقع", href: "/admin/site" }, { label: "البرامج" }]}
      loading={loading}
      loadingMessage="جاري تحميل الإعدادات..."
    >
      {success ? <Alert variant="success" className="mb-4">{success}</Alert> : null}
      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}
      {settings ? (
        <Card className="space-y-5">
          {grades.length === 0 ? (
            <Alert variant="warning">
              لا توجد مراحل بعد. أضفها من{" "}
              <Link href="/admin/classes" className="font-semibold underline">
                صفحة المراحل
              </Link>
              .
            </Alert>
          ) : (
            grades.map((g) => {
              const current = settings.programs?.find((p) => p.grade === g.name)?.description ?? "";
              return (
                <div key={g.id} className="rounded-xl border border-neutral-200 p-4">
                  <p className="font-semibold">{g.name}</p>
                  <Textarea
                    label="نبذة عن البرنامج (اختياري)"
                    value={current}
                    onChange={(e) => setProgramDescription(g.name, e.target.value)}
                    className="mt-3"
                  />
                </div>
              );
            })
          )}
          <Button onClick={save} disabled={saving}>
            <Check className="h-4 w-4" />
            {saving ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </Card>
      ) : null}
    </WorkspacePage>
  );
}
