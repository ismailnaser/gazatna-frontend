"use client";

import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { HubCard, HubGrid } from "@/components/dashboard/HubCard";
import { ClipboardList, CreditCard, Unlock, Wallet } from "lucide-react";

export default function AdminFinanceHubPage() {
  return (
    <WorkspacePage
      title="المالية"
      description="إشعارات الدفع، الخطط، والدفع اليدوي."
    >
      <HubGrid>
        <HubCard
          href="/admin/finance/payments"
          icon={CreditCard}
          title="إشعارات الدفع"
          description="مراجعة إيصالات أولياء الأمور واعتماد المبالغ."
          tone="warning"
        />
        <HubCard
          href="/admin/finance/manual"
          icon={Wallet}
          title="دفع يدوي"
          description="تسجيل دفعة نقدية أو تحويل خارج المنصة."
        />
        <HubCard
          href="/admin/finance/plans"
          icon={ClipboardList}
          title="خطط الرسوم"
          description="إنشاء وتعديل خطط الأقساط حسب المرحلة."
          tone="success"
        />
        <HubCard
          href="/admin/finance/access"
          icon={Unlock}
          title="فتح الوصول"
          description="سماح مؤقت لطالب غير مسدّد بالدخول إلى المنصة."
        />
      </HubGrid>
    </WorkspacePage>
  );
}
