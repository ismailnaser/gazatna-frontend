"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { PageHeader } from "@/components/molecules/PageHeader";
import { api } from "@/lib/api";
import type { Grade } from "@/types/teacher";
import { Check } from "lucide-react";

type SiteSettings = {
  hero: {
    welcome: string;
    schoolName: string;
    tagline: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  about: {
    description: string;
    vision: string;
    mission: string;
  };
  contact: {
    address: string;
    phone: string;
    email: string;
    footerTagline: string;
  };
  registration: {
    showNotes: boolean;
    showBirthDate: boolean;
  };
  programs?: Array<{ grade: string; description: string }>;
};

type Tab = "hero" | "about" | "contact" | "registration" | "programs";

const TABS: { id: Tab; label: string }[] = [
  { id: "hero", label: "الصفحة الرئيسية" },
  { id: "about", label: "من نحن" },
  { id: "contact", label: "التواصل والفوتر" },
  { id: "registration", label: "فورم التسجيل" },
  { id: "programs", label: "البرامج التعليمية" },
];

export default function AdminSitePage() {
  const [tab, setTab] = useState<Tab>("hero");
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.getAdminSiteSettings(),
      api.getAdminGrades(),
    ])
      .then(([settingsRes, gradesRes]) => {
        setSettings(settingsRes as SiteSettings);
        setGrades(gradesRes as Grade[]);
      })
      .catch(() => setError("تعذر تحميل الإعدادات"))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = (await api.updateAdminSiteSettings(settings)) as SiteSettings;
      setSettings(updated);
      setSuccess("تم حفظ الإعدادات بنجاح.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  }

  function setHero(key: keyof SiteSettings["hero"], val: string) {
    setSettings((prev) => prev ? { ...prev, hero: { ...prev.hero, [key]: val } } : prev);
  }
  function setAbout(key: keyof SiteSettings["about"], val: string) {
    setSettings((prev) => prev ? { ...prev, about: { ...prev.about, [key]: val } } : prev);
  }
  function setContact(key: keyof SiteSettings["contact"], val: string) {
    setSettings((prev) => prev ? { ...prev, contact: { ...prev.contact, [key]: val } } : prev);
  }
  function setReg(key: keyof SiteSettings["registration"], val: unknown) {
    setSettings((prev) => prev ? { ...prev, registration: { ...prev.registration, [key]: val } } : prev);
  }

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

  if (loading) return <p className="text-neutral-500">جاري التحميل...</p>;
  if (!settings) return <Alert variant="error">{error || "تعذر تحميل الإعدادات"}</Alert>;

  return (
    <div>
      <PageHeader
        title="إعدادات الموقع"
        description="تحكم في محتوى الصفحة الرئيسية، من نحن، التواصل، وفورم التسجيل"
      />

      {success && <Alert variant="success" className="mb-4">{success}</Alert>}
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-1 border-b border-neutral-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "border-b-2 border-p-green text-p-green"
                : "text-p-black/50 hover:text-p-black"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Hero */}
      {tab === "hero" && (
        <Card className="space-y-4">
          <h3 className="font-bold text-p-black">نصوص الصفحة الرئيسية</h3>
          <Input label="نص الترحيب (السطر الأول)" value={settings.hero.welcome} onChange={(e) => setHero("welcome", e.target.value)} />
          <Input label="اسم المدرسة" value={settings.hero.schoolName} onChange={(e) => setHero("schoolName", e.target.value)} />
          <Input label="الشعار الرئيسي (Tagline)" value={settings.hero.tagline} onChange={(e) => setHero("tagline", e.target.value)} />
          <Textarea label="الوصف الطويل" value={settings.hero.description} onChange={(e) => setHero("description", e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="نص الزر الأول (CTA)" value={settings.hero.ctaPrimary} onChange={(e) => setHero("ctaPrimary", e.target.value)} />
            <Input label="نص الزر الثاني" value={settings.hero.ctaSecondary} onChange={(e) => setHero("ctaSecondary", e.target.value)} />
          </div>
        </Card>
      )}

      {/* About */}
      {tab === "about" && (
        <Card className="space-y-4">
          <h3 className="font-bold text-p-black">صفحة من نحن</h3>
          <Textarea label="وصف المدرسة (مقدمة من نحن)" value={settings.about.description} onChange={(e) => setAbout("description", e.target.value)} />
          <Textarea label="رؤيتنا" value={settings.about.vision} onChange={(e) => setAbout("vision", e.target.value)} />
          <Textarea label="رسالتنا" value={settings.about.mission} onChange={(e) => setAbout("mission", e.target.value)} />
        </Card>
      )}

      {/* Contact / Footer */}
      {tab === "contact" && (
        <Card className="space-y-4">
          <h3 className="font-bold text-p-black">معلومات التواصل والفوتر</h3>
          <Input label="العنوان" value={settings.contact.address} onChange={(e) => setContact("address", e.target.value)} />
          <Input label="رقم الهاتف" value={settings.contact.phone} onChange={(e) => setContact("phone", e.target.value)} />
          <Input label="البريد الإلكتروني" type="email" value={settings.contact.email} onChange={(e) => setContact("email", e.target.value)} />
          <Textarea label="نص الفوتر (وصف المدرسة)" value={settings.contact.footerTagline} onChange={(e) => setContact("footerTagline", e.target.value)} />
        </Card>
      )}

      {/* Registration */}
      {tab === "registration" && (
        <Card className="space-y-5">
          <h3 className="font-bold text-p-black">إعدادات فورم التسجيل</h3>

          <div className="flex flex-col gap-3">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className="rounded text-p-green"
                checked={settings.registration.showBirthDate}
                onChange={(e) => setReg("showBirthDate", e.target.checked)}
              />
              <span className="text-sm font-medium text-p-black">إظهار حقل تاريخ الميلاد</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className="rounded text-p-green"
                checked={settings.registration.showNotes}
                onChange={(e) => setReg("showNotes", e.target.checked)}
              />
              <span className="text-sm font-medium text-p-black">إظهار حقل الملاحظات الإضافية</span>
            </label>
          </div>

          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-p-black">المراحل الدراسية المتاحة في الفورم</p>
              <Link
                href="/admin/classes"
                className="text-xs font-semibold text-p-green hover:underline"
              >
                إدارة الصفوف والمراحل
              </Link>
            </div>
            <p className="mb-3 text-xs text-p-black/50">
              تُجلب المراحل تلقائياً من الصفوف المُضافة في النظام.
            </p>
            <div className="space-y-2">
              {grades.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  لا توجد صفوف مُضافة بعد.{" "}
                  <Link href="/admin/classes" className="font-semibold text-p-green hover:underline">
                    أضف صفوفاً من هنا
                  </Link>
                </p>
              ) : (
                grades.map((g) => (
                  <div
                    key={g.id}
                    className="rounded-lg border border-neutral-100 bg-neutral-50 px-4 py-2.5 text-sm font-medium text-p-black"
                  >
                    {g.name}
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Programs */}
      {tab === "programs" && (
        <Card className="space-y-5">
          <h3 className="font-bold text-p-black">البرامج التعليمية حسب الصفوف</h3>
          <p className="text-sm text-p-black/60">
            هذه البرامج تُعرض في صفحة{" "}
            <Link href="/programs" className="font-semibold text-p-green hover:underline">
              البرامج
            </Link>{" "}
            للجمهور. النبذة اختيارية لكل صف.
          </p>

          {grades.length === 0 ? (
            <Alert variant="warning">
              لا توجد صفوف/مراحل مُضافة بعد. أضف الصفوف من{" "}
              <Link href="/admin/classes" className="font-semibold underline">
                صفحة الفصول
              </Link>
              .
            </Alert>
          ) : (
            <div className="space-y-4">
              {grades.map((g) => {
                const gradeName = g.name;
                const current =
                  settings.programs?.find((p) => p.grade === gradeName)?.description ?? "";
                return (
                  <div key={g.id} className="rounded-xl border border-neutral-100 p-4">
                    <p className="font-semibold text-p-black">{gradeName}</p>
                    <Textarea
                      label="نبذة عن البرنامج (اختياري)"
                      value={current}
                      onChange={(e) => setProgramDescription(gradeName, e.target.value)}
                      className="mt-3"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      <div className="mt-6">
        <Button onClick={save} disabled={saving}>
          <Check className="h-4 w-4" />
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </Button>
      </div>
    </div>
  );
}
