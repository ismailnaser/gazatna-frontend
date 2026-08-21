"use client";

import { HubCard, HubGrid } from "@/components/dashboard/HubCard";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { ClipboardList, CreditCard, Upload } from "lucide-react";

export default function ParentFeesHubPage() {
  return (
    <WorkspacePage
      title="المالية"
      description="الرصيد، الأقساط، وإشعارات الدفع."
      breadcrumbs={[
        { label: "الرئيسية", href: "/parent" },
        { label: "المالية" },
      ]}
    >
      <HubGrid>
        <HubCard
          href="/parent/fees/balance"
          icon={CreditCard}
          title="الرصيد والأقساط"
          description="الإجمالي والمدفوع والمتبقي وجدول الأقساط."
        />
        <HubCard
          href="/parent/fees/pay"
          icon={Upload}
          title="رفع إشعار دفع"
          description="إرسال إيصال أو صورة إشعار لمراجعة الإدارة."
          tone="success"
        />
        <HubCard
          href="/parent/fees/history"
          icon={ClipboardList}
          title="سجل الإشعارات"
          description="حالة إشعارات الدفع المرسلة سابقاً."
        />
      </HubGrid>
    </WorkspacePage>
  );
}
