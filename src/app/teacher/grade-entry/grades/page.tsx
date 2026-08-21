"use client";

import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { TeacherGradesPanel } from "@/components/teacher/TeacherGradesPanel";

export default function TeacherGradesPage() {
  return (
    <WorkspacePage
      title="علامات المواد الدراسية"
      description="إدخال علامات الطلاب في عناصر التقسيمة (نشاط، شهري، نصفي...)."
      breadcrumbs={[
        { label: "فصولي", href: "/teacher" },
        { label: "التقييمات والعلامات", href: "/teacher/grade-entry" },
        { label: "علامات المواد" },
      ]}
    >
      <TeacherGradesPanel />
    </WorkspacePage>
  );
}
