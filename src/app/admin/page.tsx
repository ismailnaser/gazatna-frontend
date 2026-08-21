"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { HubCard, HubGrid } from "@/components/dashboard/HubCard";
import { AcademicPeriodBanner } from "@/components/shared/AcademicPeriodBanner";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  canAccessAdminAnalyticsTab,
  canAccessAdminPath,
  isAdminRole,
  isSuperAdmin,
} from "@/lib/adminRoles";
import {
  BarChart3,
  Bell,
  BookMarked,
  CreditCard,
  GraduationCap,
  Layers,
  LineChart,
  Newspaper,
  Settings2,
  Users,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [meta, setMeta] = useState<{ academicYear?: string | null; academicTerm?: string | null }>({});

  useEffect(() => {
    api
      .getAdminAnalytics({ section: "meta" })
      .then((res) => {
        const row = res as { academicYear?: string | null; academicTerm?: string | null };
        setMeta({ academicYear: row.academicYear, academicTerm: row.academicTerm });
      })
      .catch(() => setMeta({}));
  }, []);

  const cards = useMemo(() => {
    if (!user || !isAdminRole(user.role)) return [];
    const role = user.role;
    const all = [
      canAccessAdminAnalyticsTab(role, "students") && {
        href: "/admin/analytics?tab=students",
        icon: Users,
        title: "أعداد الطلاب",
        description: "المسجلون والنشطون خلال السنة.",
      },
      canAccessAdminAnalyticsTab(role, "grades") && {
        href: "/admin/analytics?tab=grades",
        icon: BarChart3,
        title: "نسب النجاح",
        description: "تحليل العلامات حسب المرحلة.",
      },
      canAccessAdminAnalyticsTab(role, "fees") && {
        href: "/admin/analytics?tab=fees",
        icon: CreditCard,
        title: "تحصيل الرسوم",
        description: "نسبة التحصيل والرسم البياني.",
      },
      canAccessAdminPath(role, "/admin/notifications") && {
        href: "/admin/notifications",
        icon: Bell,
        title: "التنبيهات",
        description: "حجب الرسوم والحسابات غير النشطة.",
        tone: "warning" as const,
      },
      canAccessAdminPath(role, "/admin/students") && {
        href: "/admin/students",
        icon: GraduationCap,
        title: "الطلاب",
        description: "الملفات والفصول والحسابات.",
      },
      canAccessAdminPath(role, "/admin/classes") && {
        href: "/admin/classes",
        icon: Layers,
        title: "المراحل الدراسية",
        description: "الفصول والشعب ومربي الصف.",
      },
      canAccessAdminPath(role, "/admin/subjects") && {
        href: "/admin/subjects",
        icon: BookMarked,
        title: "المواد",
        description: "إسناد الفصول والمعلمين.",
      },
      canAccessAdminPath(role, "/admin/finance") && {
        href: "/admin/finance",
        icon: CreditCard,
        title: "المالية",
        description: "الإشعارات والخطط وفتح الوصول.",
      },
      canAccessAdminPath(role, "/admin/content") && {
        href: "/admin/content",
        icon: Newspaper,
        title: "المحتوى",
        description: "الأخبار والبرامج المعروضة.",
      },
      isSuperAdmin(role) && {
        href: "/admin/site",
        icon: Settings2,
        title: "إعدادات الموقع",
        description: "الهيرو وصفحات التعريف.",
      },
      canAccessAdminPath(role, "/admin/analytics") && {
        href: "/admin/analytics",
        icon: LineChart,
        title: "التحليلات",
        description: "التفاصيل الكاملة للأرقام.",
      },
    ];
    return all.filter(Boolean) as Array<{
      href: string;
      icon: typeof Users;
      title: string;
      description: string;
      tone?: "warning";
    }>;
  }, [user]);

  return (
    <WorkspacePage
      title="لوحة الإدارة"
      description="نظرة عامة على أقسام الإدارة."
    >
      <AcademicPeriodBanner
        fromParent
        yearLabel={meta.academicYear}
        termLabel={meta.academicTerm}
      />
      <HubGrid className="mt-4">
        {cards.map((card) => (
          <HubCard
            key={card.href + card.title}
            href={card.href}
            icon={card.icon}
            title={card.title}
            description={card.description}
            tone={card.tone}
          />
        ))}
      </HubGrid>
    </WorkspacePage>
  );
}
