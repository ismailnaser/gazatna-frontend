"use client";

import { PageHeader } from "@/components/molecules/PageHeader";
import { AdminGradeSchemePanel } from "@/components/admin/AdminGradeSchemePanel";

export default function AdminGradeSchemesPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="تقسيمة العلامات"
        description="تحديد التقسيمة الموحّدة (نشاط، شهري، نصفي، نهائي...) لكل المراحل والشعب والمواد"
        className="mb-4"
      />
      <AdminGradeSchemePanel />
    </div>
  );
}
