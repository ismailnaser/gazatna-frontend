"use client";

import { PageHeader } from "@/components/molecules/PageHeader";
import { AcademicArchivePanel } from "@/components/admin/academic/panels/AcademicArchivePanel";

export default function AdminAcademicArchivePage() {
  return (
    <div>
      <PageHeader
        title="أرشيف السنوات الدراسية"
        description="استعراض السنوات المنتهية والمؤرشفة — الفصول الدراسية وسجل الشهادات"
      />
      <AcademicArchivePanel />
    </div>
  );
}
