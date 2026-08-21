"use client";

import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { FileUploadField } from "@/components/molecules/FileUploadField";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { useAdminSiteSettings } from "@/hooks/useAdminSiteSettings";
import { HERO_HEIGHT_OPTIONS, HERO_POSITION_OPTIONS } from "@/lib/adminSiteSettings";
import { resolveMediaUrl } from "@/lib/media";
import { Check } from "lucide-react";

export default function AdminSiteHeroPage() {
  const {
    settings,
    setSettings,
    loading,
    saving,
    success,
    error,
    save,
    pendingHeroImage,
    setPendingHeroImage,
    heroImagePreview,
    setHeroImagePreview,
    removeHeroImage,
    setRemoveHeroImage,
  } = useAdminSiteSettings();

  function setHero(key: keyof NonNullable<typeof settings>["hero"], val: string) {
    setSettings((prev) => (prev ? { ...prev, hero: { ...prev.hero, [key]: val } } : prev));
  }

  return (
    <WorkspacePage
      title="الصفحة الرئيسية"
      description="نصوص وصورة قسم الهيرو على الموقع العام."
      breadcrumbs={[{ label: "إعدادات الموقع", href: "/admin/site" }, { label: "الصفحة الرئيسية" }]}
      loading={loading}
      loadingMessage="جاري تحميل الإعدادات..."
    >
      {success ? <Alert variant="success" className="mb-4">{success}</Alert> : null}
      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}
      {settings ? (
        <Card className="space-y-4">
          <Input label="نص الترحيب" value={settings.hero.welcome} onChange={(e) => setHero("welcome", e.target.value)} />
          <Input label="اسم المدرسة" value={settings.hero.schoolName} onChange={(e) => setHero("schoolName", e.target.value)} />
          <Input label="الشعار الرئيسي" value={settings.hero.tagline} onChange={(e) => setHero("tagline", e.target.value)} />
          <Textarea label="الوصف الطويل" value={settings.hero.description} onChange={(e) => setHero("description", e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="نص الزر الأول" value={settings.hero.ctaPrimary} onChange={(e) => setHero("ctaPrimary", e.target.value)} />
            <Input label="نص الزر الثاني" value={settings.hero.ctaSecondary} onChange={(e) => setHero("ctaSecondary", e.target.value)} />
          </div>
          <div className="border-t border-neutral-100 pt-4">
            <h3 className="mb-3 font-bold">صورة الصفحة الرئيسية</h3>
            {(heroImagePreview || (settings.hero.imageUrl && !removeHeroImage)) && (
              <div className="mb-4 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImagePreview || resolveMediaUrl(settings.hero.imageUrl) || ""}
                  alt="معاينة صورة الهيرو"
                  className="max-h-64 w-full"
                  style={{
                    objectFit: settings.hero.imageObjectFit || "cover",
                    objectPosition: settings.hero.imageObjectPosition || "center top",
                  }}
                />
              </div>
            )}
            <FileUploadField
              preset="image"
              label="رفع صورة جديدة"
              selectedFileName={pendingHeroImage?.name}
              onChange={(files) => {
                const file = files?.[0] ?? null;
                setPendingHeroImage(file);
                setRemoveHeroImage(false);
                setHeroImagePreview((prev) => {
                  if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
                  return file ? URL.createObjectURL(file) : null;
                });
              }}
            />
            {(settings.hero.imageUrl || pendingHeroImage) && !removeHeroImage ? (
              <button
                type="button"
                className="mt-2 text-sm font-semibold text-p-red hover:underline"
                onClick={() => {
                  setPendingHeroImage(null);
                  setRemoveHeroImage(true);
                  setHeroImagePreview((prev) => {
                    if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
                    return null;
                  });
                }}
              >
                حذف الصورة والرجوع للافتراضية
              </button>
            ) : null}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Select
                label="ارتفاع قسم الهيرو"
                options={HERO_HEIGHT_OPTIONS}
                value={
                  HERO_HEIGHT_OPTIONS.some((o) => o.value === settings.hero.imageHeight)
                    ? settings.hero.imageHeight
                    : "100dvh"
                }
                onChange={(e) => setHero("imageHeight", e.target.value)}
              />
              <Input
                label="ارتفاع مخصص"
                placeholder="مثال: 750px أو 85vh"
                value={settings.hero.imageHeight}
                onChange={(e) => setHero("imageHeight", e.target.value)}
              />
              <Select
                label="طريقة عرض الصورة"
                options={[
                  { value: "cover", label: "ملء الإطار" },
                  { value: "contain", label: "إظهار الصورة كاملة" },
                ]}
                value={settings.hero.imageObjectFit || "cover"}
                onChange={(e) => setHero("imageObjectFit", e.target.value)}
              />
              <Select
                label="موضع الصورة"
                options={HERO_POSITION_OPTIONS}
                value={settings.hero.imageObjectPosition || "center top"}
                onChange={(e) => setHero("imageObjectPosition", e.target.value)}
              />
            </div>
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
