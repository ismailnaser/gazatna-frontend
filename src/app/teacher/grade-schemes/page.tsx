"use client";

import { PageHeader } from "@/components/molecules/PageHeader";
import { TeacherGradesPanel } from "@/components/teacher/TeacherGradesPanel";

export default function TeacherGradeSchemesPage() {
  return (
    <div>
      <PageHeader
        title="تقسيمة العلامات والتقييمات"
        description="تحديد العلامة الكاملة وتقسيمتها (نشاط، شهري، نصفي، نهائي...) للفصول والمواد المختارة"
        className="mb-4"
      />
      <TeacherGradesPanel mode="scheme" />
    </div>
  );
}
