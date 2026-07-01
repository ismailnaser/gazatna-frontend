"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/molecules/PageHeader";
import { ParentCertificatesPanel } from "@/components/parent/ParentCertificatesPanel";
import { api } from "@/lib/api";
import type { ParentCertificatesResponse } from "@/types/academic";
import { mapParentCertificatesResponse } from "@/types/academic";

const DEFAULT_SCHOOL_NAME = "مدرسة غَزتنا";

export default function ParentCertificateArchivePage() {
  const [data, setData] = useState<ParentCertificatesResponse | null>(null);
  const [schoolName, setSchoolName] = useState(DEFAULT_SCHOOL_NAME);
  const [loading, setLoading] = useState(true);

  const loadCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const response = mapParentCertificatesResponse(
        (await api.getParentCertificateArchive()) as Record<string, unknown>
      );
      setData(response);
    } catch {
      setData({
        published: false,
        message: "تعذر تحميل أرشيف الشهادات.",
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
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  return (
    <div>
      <PageHeader
        title="أرشيف الشهادات"
        description="شهادات الفصول المنتهية والسنوات المؤرشفة — للقراءة والتحميل فقط"
      />

      <ParentCertificatesPanel
        data={data}
        schoolName={schoolName}
        emptyTitle="لا توجد شهادات مؤرشفة بعد."
        emptyDescription="بعد إغلاق فصل دراسي أو إنهاء سنة دراسية ستظهر الشهادات هنا."
      />
    </div>
  );
}
