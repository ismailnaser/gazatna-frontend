"use client";

import { useCallback, useEffect, useState } from "react";
import { PageBusy, PageHeader } from "@/components/molecules/PageHeader";
import { ParentCertificatesPanel } from "@/components/parent/ParentCertificatesPanel";
import { api } from "@/lib/api";
import type { ParentCertificatesResponse } from "@/types/academic";
import { mapParentCertificatesResponse } from "@/types/academic";

const DEFAULT_SCHOOL_NAME = "مدرسة غَزتنا";

export default function ParentCertificatesPage() {
  const [data, setData] = useState<ParentCertificatesResponse | null>(null);
  const [schoolName, setSchoolName] = useState(DEFAULT_SCHOOL_NAME);
  const [loading, setLoading] = useState(true);

  const loadCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const response = mapParentCertificatesResponse(
        (await api.getParentCertificates()) as Record<string, unknown>
      );
      setData(response);
    } catch {
      setData({
        published: false,
        message: "تعذر تحميل الشهادات.",
        config: null,
        certificate: null,
        certificates: [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCertificates();
    api
      .getSiteSettings()
      .then((res) => {
        const hero = (res as { hero?: { schoolName?: string } }).hero;
        if (hero?.schoolName?.trim()) setSchoolName(hero.schoolName.trim());
      })
      .catch(() => {});
  }, [loadCertificates]);

  if (loading) {
    return <PageBusy title="الشهادات" description="شهادات الفصل الدراسي الحالي" />;
  }

  return (
    <div>
      <PageHeader
        title="الشهادات"
        description="شهادات الفصل الحالي والفصول المنتهية مؤخراً (أسبوعان) — ثم تنتقل إلى أرشيف الشهادات"
      />

      <ParentCertificatesPanel
        data={data}
        schoolName={schoolName}
        emptyDescription="بعد إغلاق الفصل تبقى شهادته هنا أسبوعين ثم تنتقل إلى أرشيف الشهادات."
      />
    </div>
  );
}
