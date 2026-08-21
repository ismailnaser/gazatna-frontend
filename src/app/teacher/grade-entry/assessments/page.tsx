"use client";

import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { TeacherAssessmentsGradingPanel } from "@/components/teacher/TeacherAssessmentsGradingPanel";

export default function TeacherAssessmentsPage() {
  return (
    <WorkspacePage
      title="تقييم الواجبات والاختبارات"
      description="متابعة تسليمات الطلاب وتقييم الواجبات والاختبارات."
      breadcrumbs={[
        { label: "فصولي", href: "/teacher" },
        { label: "التقييمات والعلامات", href: "/teacher/grade-entry" },
        { label: "تقييم التسليمات" },
      ]}
    >
      <TeacherAssessmentsGradingPanel />
    </WorkspacePage>
  );
}
