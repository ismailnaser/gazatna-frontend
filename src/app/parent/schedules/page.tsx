"use client";

import { HubCard, HubGrid } from "@/components/dashboard/HubCard";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { CalendarDays, ClipboardList } from "lucide-react";

export default function ParentSchedulesHubPage() {
  return (
    <WorkspacePage
      title="جدول يومي"
      description="الحصص والاختبارات على شكل رحلة الأسبوع."
      breadcrumbs={[
        { label: "الرئيسية", href: "/parent" },
        { label: "الجداول" },
      ]}
    >
      <HubGrid>
        <HubCard
          href="/parent/schedules/class"
          icon={CalendarDays}
          title="جدول الحصص"
          description="الحصص الأسبوعية الخاصة بشعبة الطالب."
        />
        <HubCard
          href="/parent/schedules/exam"
          icon={ClipboardList}
          title="جدول الاختبارات"
          description="مواعيد الاختبارات المنشورة للشعبة."
        />
      </HubGrid>
    </WorkspacePage>
  );
}
