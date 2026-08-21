"use client";

import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { ParentSchedulesList } from "@/components/parent/ParentSchedulesList";

export default function ParentExamSchedulePage() {
  return (
    <WorkspacePage
      title="جدول الاختبارات"
      description="مواعيد الاختبارات المنشورة للشعبة."
      breadcrumbs={[
        { label: "الرئيسية", href: "/parent" },
        { label: "الجداول", href: "/parent/schedules" },
        { label: "جدول الاختبارات" },
      ]}
    >
      <ParentSchedulesList type="exam" />
    </WorkspacePage>
  );
}
