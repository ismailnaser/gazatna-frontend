"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { AcademicPeriodBanner } from "@/components/shared/AcademicPeriodBanner";
import { SimpleBarChart } from "@/components/molecules/SimpleBarChart";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  canAccessAdminAnalyticsTab,
  canAccessAdminPath,
  isAdminRole,
  isSuperAdmin,
} from "@/lib/adminRoles";
import type { AdminAnalytics } from "@/types/news";
import { emptyAdminAnalytics } from "@/types/news";
import { BarChart3, Bell, CreditCard, Settings2 } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<AdminAnalytics>(emptyAdminAnalytics);
  const [loading, setLoading] = useState(true);

  const canOpenSite = user && isSuperAdmin(user.role);
  const canOpenNotifications =
    user && isAdminRole(user.role) && canAccessAdminPath(user.role, "/admin/notifications");
  const canOpenGradesAnalytics =
    user && isAdminRole(user.role) && canAccessAdminAnalyticsTab(user.role, "grades");
  const canOpenFeesAnalytics =
    user && isAdminRole(user.role) && canAccessAdminAnalyticsTab(user.role, "fees");

  useEffect(() => {
    api.getAdminAnalytics()
      .then((res) => setData(res as AdminAnalytics))
      .catch(() => setData(emptyAdminAnalytics))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <PageHeader title="لوحة التحليلات" description="نظرة عامة على الأداء والمالية" />
        {canOpenSite && (
          <Link
            href="/admin/site"
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-p-black transition-colors hover:bg-neutral-50"
          >
            <Settings2 className="h-4 w-4 text-p-black/60" />
            إعدادات الموقع
          </Link>
        )}
      </div>

      <AcademicPeriodBanner />

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {canOpenGradesAnalytics && (
        <Card
          className="flex cursor-pointer items-center gap-4 transition-colors hover:bg-neutral-50"
          onClick={() => router.push("/admin/analytics?tab=grades")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") router.push("/admin/analytics?tab=grades");
          }}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-p-green/10">
            <BarChart3 className="h-6 w-6 text-p-green" />
          </span>
          <div>
            <p className="text-sm text-p-black/50">معدل درجات المدرسة</p>
            <p className="text-3xl font-bold text-p-black">{data.avgGrade}%</p>
          </div>
        </Card>
        )}
        {canOpenFeesAnalytics && (
        <Card
          className="flex cursor-pointer items-center gap-4 transition-colors hover:bg-neutral-50"
          onClick={() => router.push("/admin/analytics?tab=fees")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") router.push("/admin/analytics?tab=fees");
          }}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-p-green/10">
            <CreditCard className="h-6 w-6 text-p-green" />
          </span>
          <div>
            <p className="text-sm text-p-black/50">نسبة الرسوم المحصلة</p>
            <p className="text-3xl font-bold text-p-black">{data.feesCollected}%</p>
          </div>
        </Card>
        )}
      </div>

      <div className="mb-8">
        <Card>
          <h3 className="mb-4 font-bold text-p-black">تحصيل الرسوم الشهري</h3>
          {data.feesChart.length > 0 ? (
            <SimpleBarChart data={data.feesChart} color="bg-p-red" />
          ) : (
            <p className="text-sm text-neutral-500">لا توجد بيانات بعد.</p>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 flex items-center gap-2 font-bold text-p-black">
          <Bell className="h-5 w-5 text-amber-500" />
          الإشعارات
        </h3>
        {data.urgentTasks.length > 0 ? (
          <ul className="space-y-2">
            {data.urgentTasks.map((task) => (
              <li key={task.id}>
                {task.type === "finance" ? (
                  <Link
                    href="/admin/finance"
                    className="block rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                  >
                    {task.text}
                  </Link>
                ) : task.type === "admissions" ? (
                  <Link
                    href="/admin/admissions"
                    className="block rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                  >
                    {task.text}
                  </Link>
                ) : task.type === "messages" ? (
                  <Link
                    href="/admin/messages"
                    className="block rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                  >
                    {task.text}
                  </Link>
                ) : task.type === "fees_blocked" ? (
                  canOpenNotifications ? (
                  <Link
                    href="/admin/notifications?type=fees_blocked"
                    className="block rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                  >
                    {task.text}
                  </Link>
                  ) : (
                  <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    {task.text}
                  </div>
                  )
                ) : task.type === "students_inactive" ? (
                  canOpenNotifications ? (
                  <Link
                    href="/admin/notifications?type=students_inactive"
                    className="block rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                  >
                    {task.text}
                  </Link>
                  ) : (
                  <Link
                    href="/admin/students"
                    className="block rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                  >
                    {task.text}
                  </Link>
                  )
                ) : (
                  <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    {task.text}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500">لا توجد إشعارات مهمة حالياً.</p>
        )}
      </Card>
    </div>
  );
}
