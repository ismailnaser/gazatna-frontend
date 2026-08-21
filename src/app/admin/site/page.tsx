"use client";

import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { HubCard, HubGrid } from "@/components/dashboard/HubCard";
import { BookOpen, FileText, Image, Mail, UserRound } from "lucide-react";

export default function AdminSiteHubPage() {
  return (
    <WorkspacePage
      title="إعدادات الموقع"
      description="نصوص الموقع العام وصفحات التعريف."
    >
      <HubGrid>
        <HubCard
          href="/admin/site/hero"
          icon={Image}
          title="الصفحة الرئيسية"
          description="نصوص الهيرو وصورة الخلفية."
        />
        <HubCard
          href="/admin/site/about"
          icon={UserRound}
          title="من نحن"
          description="الوصف والرؤية والرسالة."
        />
        <HubCard
          href="/admin/site/contact"
          icon={Mail}
          title="التواصل والفوتر"
          description="العنوان والهاتف والبريد."
          tone="success"
        />
        <HubCard
          href="/admin/site/registration"
          icon={FileText}
          title="فورم التسجيل"
          description="الحقول الظاهرة في طلب القبول."
          tone="warning"
        />
        <HubCard
          href="/admin/site/programs"
          icon={BookOpen}
          title="البرامج التعليمية"
          description="نبذة كل مرحلة في صفحة البرامج."
        />
      </HubGrid>
    </WorkspacePage>
  );
}
