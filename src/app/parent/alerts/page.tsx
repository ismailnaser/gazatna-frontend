"use client";

import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { ParentAlertsPanel } from "@/components/parent/ParentAlertsPanel";

export default function ParentAlertsPage() {
  return (
    <WorkspacePage
      title="إشعارات"
      description="رسائل المعلّم والتنبيهات الحلوة."
      breadcrumbs={[
        { label: "الرئيسية", href: "/parent" },
        { label: "إشعارات" },
      ]}
    >
      <ParentAlertsPanel />
    </WorkspacePage>
  );
}
