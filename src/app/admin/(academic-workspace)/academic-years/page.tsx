"use client";

import { PageHeader } from "@/components/molecules/PageHeader";
import { AcademicYearsPanel } from "@/components/admin/academic/panels/AcademicYearsPanel";

export default function AdminAcademicYearsPage() {
  return (
    <div>
      <PageHeader
        title="السنوات الدراسية"
        description="إدارة السنوات الدراسية، تفعيل السنة النشطة، وإنشاء سنوات جديدة"
      />
      <AcademicYearsPanel />
    </div>
  );
}
