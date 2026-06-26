"use client";

import { PageHeader } from "@/components/molecules/PageHeader";
import { AcademicTermsPanel } from "@/components/admin/academic/panels/AcademicTermsPanel";

export default function AdminAcademicTermsPage() {
  return (
    <div>
      <PageHeader
        title="الفصول الدراسية"
        description="تحديد عدد الفصول وأسمائها وتواريخها، وتعيين الفصل الحالي"
      />
      <AcademicTermsPanel />
    </div>
  );
}
