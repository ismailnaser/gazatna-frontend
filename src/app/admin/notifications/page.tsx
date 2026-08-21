"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { HubCard, HubGrid } from "@/components/dashboard/HubCard";
import { CreditCard, UserX } from "lucide-react";

function LegacyTypeRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "fees_blocked") router.replace("/admin/notifications/fees");
    if (type === "students_inactive") router.replace("/admin/notifications/inactive");
  }, [router, searchParams]);

  return null;
}

export default function AdminNotificationsHubPage() {
  return (
    <WorkspacePage
      title="التنبيهات"
      description="تنبيهات حجب الرسوم والحسابات غير النشطة."
    >
      <Suspense fallback={null}>
        <LegacyTypeRedirect />
      </Suspense>
      <HubGrid>
        <HubCard
          href="/admin/notifications/fees"
          icon={CreditCard}
          title="حجب الرسوم"
          description="الطلاب المحجوبون بسبب الدفعة المستحقة."
          tone="danger"
        />
        <HubCard
          href="/admin/notifications/inactive"
          icon={UserX}
          title="حسابات غير نشطة"
          description="الطلاب الجدد بانتظار تفعيل الحساب."
          tone="warning"
        />
      </HubGrid>
    </WorkspacePage>
  );
}
