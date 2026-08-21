"use client";

import { HubCard, HubGrid } from "@/components/dashboard/HubCard";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { BookOpen, ClipboardList } from "lucide-react";

export default function TeacherGradeEntryHubPage() {
  return (
    <WorkspacePage
      title="التقييمات والعلامات"
      description="تقييم التسليمات وإدخال علامات المواد."
      breadcrumbs={[
        { label: "فصولي", href: "/teacher" },
        { label: "التقييمات والعلامات" },
      ]}
    >
      <HubGrid>
        <HubCard
          href="/teacher/grade-entry/assessments"
          icon={ClipboardList}
          title="تقييم الواجبات والاختبارات"
          description="متابعة التسليمات وتقييم واجبات واختبارات الطلاب."
        />
        <HubCard
          href="/teacher/grade-entry/grades"
          icon={BookOpen}
          title="علامات المواد الدراسية"
          description="إدخال علامات الطلاب حسب التقسيمة المعتمدة لكل مادة."
          tone="success"
        />
      </HubGrid>
    </WorkspacePage>
  );
}
