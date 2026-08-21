"use client";

import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { ParentSchedulesList } from "@/components/parent/ParentSchedulesList";

export default function ParentClassSchedulePage() {
  return (
    <WorkspacePage
      title="جدول الحصص"
      description="الحصص الأسبوعية الخاصة بشعبة الطالب."
      breadcrumbs={[
        { label: "الرئيسية", href: "/parent" },
        { label: "الجداول", href: "/parent/schedules" },
        { label: "جدول الحصص" },
      ]}
    >
      <ParentSchedulesList type="class" />
    </WorkspacePage>
  );
}
