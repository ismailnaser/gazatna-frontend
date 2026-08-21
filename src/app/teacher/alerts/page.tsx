"use client";

import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { TeacherSubmissionAlerts } from "@/components/teacher/TeacherSubmissionAlerts";
import { useTeacherAlerts } from "@/hooks/useTeacherAlerts";

export default function TeacherAlertsPage() {
  const { alerts, loading, refresh } = useTeacherAlerts();

  return (
    <WorkspacePage
      title="تنبيهات التسليم"
      description="تسليمات الواجبات والاختبارات التي تحتاج متابعة."
      breadcrumbs={[
        { label: "فصولي", href: "/teacher" },
        { label: "تنبيهات التسليم" },
      ]}
      loading={loading}
    >
      <TeacherSubmissionAlerts
        alerts={alerts}
        limit={20}
        alwaysShow
        onAlertOpen={refresh}
      />
    </WorkspacePage>
  );
}
