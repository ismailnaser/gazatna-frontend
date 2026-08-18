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
import { BarChart3, Bell, CreditCard, Settings2, Users } from "lucide-react";

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
  const canOpenStudentsAnalytics =
    user && isAdminRole(user.role) && canAccessAdminAnalyticsTab(user.role, "students");

  const growth = data.studentsGrowthPercent;
  const growthLabel =
    growth == null ? "—" : `${growth > 0 ? "+" : ""}${growth}%`;
  const growthClass =
    growth == null
      ? "text-p-black"
      : growth > 0
        ? "text-p-green"
        : growth < 0
          ? "text-p-red"
          : "text-p-black";

  useEffect(() => {
    api.getAdminAnalytics()
      .then((res) => setData(res as AdminAnalytics))
      .catch(() => setData(emptyAdminAnalytics))
      .finally(() => setLoading(false));
  }, []);

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

      <AcademicPeriodBanner
        fromParent
        yearLabel={data.academicYear}
        termLabel={data.academicTerm}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {canOpenStudentsAnalytics ? (
          <Card
            className="flex cursor-pointer items-center gap-4 transition-colors hover:bg-neutral-100"
            onClick={() => router.push("/admin/analytics?tab=students")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") router.push("/admin/analytics?tab=students");
            }}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-p-green/10">
              <Users className="h-6 w-6 text-p-green" />
            </span>
            <div>
              <p className="text-sm text-p-black/50">
                المسجلون خلال السنة
                {data.academicYear ? ` ${data.academicYear}` : ""}
              </p>
              <p className="text-3xl font-bold text-p-black">{loading ? "…" : (data.registeredStudents ?? 0)}</p>
              <p className={`mt-0.5 text-xs font-semibold ${growthClass}`}>
                ازدياد عن السنة السابقة: {growthLabel}
              </p>
            </div>
          </Card>
        ) : (
          <Card className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-p-green/10">
              <Users className="h-6 w-6 text-p-green" />
            </span>
            <div>
              <p className="text-sm text-p-black/50">
                عدد الطلاب المسجلين خلال السنة الدراسية
                {data.academicYear ? ` ${data.academicYear}` : ""}
              </p>
              <p className="text-3xl font-bold text-p-black">{loading ? "…" : (data.registeredStudents ?? 0)}</p>
            </div>
          </Card>
        )}
        {canOpenGradesAnalytics && (
        <Card
          className="flex cursor-pointer items-center gap-4 transition-colors hover:bg-neutral-100"
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
            <p className="text-3xl font-bold text-p-black">{loading ? "…" : `${data.avgGrade}%`}</p>
          </div>
        </Card>
        )}
        {canOpenFeesAnalytics && (
        <Card
          className="flex cursor-pointer items-center gap-4 transition-colors hover:bg-neutral-100"
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
            <p className="text-3xl font-bold text-p-black">{loading ? "…" : `${data.feesCollected}%`}</p>
          </div>
        </Card>
        )}
      </div>

      {canOpenFeesAnalytics && (
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
      )}

      <Card>
        <h3 className="mb-4 flex items-center gap-2 font-bold text-p-black">
          <Bell className="h-5 w-5 text-amber-500" />
          الإشعارات
        </h3>
        {data.urgentTasks.length > 0 ? (
          <ul className="space-y-2">
            {data.urgentTasks.map((task) => {
              const href =
                task.type === "finance"
                  ? "/admin/finance"
                  : task.type === "admissions"
                    ? "/admin/admissions"
                    : task.type === "messages"
                      ? "/admin/messages"
                      : task.type === "fees_blocked"
                        ? "/admin/notifications?type=fees_blocked"
                        : task.type === "students_inactive"
                          ? canOpenNotifications
                            ? "/admin/notifications?type=students_inactive"
                            : "/admin/students"
                          : "";
              const pathForAccess = href.split("?")[0];
              const canOpen =
                Boolean(href) &&
                user &&
                isAdminRole(user.role) &&
                canAccessAdminPath(user.role, pathForAccess);
              return (
              <li key={task.id}>
                {canOpen ? (
                  <Link
                    href={href}
                    className="block rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                  >
                    {task.text}
                  </Link>
                ) : (
                  <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    {task.text}
                  </div>
                )}
              </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500">لا توجد إشعارات مهمة حالياً.</p>
        )}
      </Card>
    </div>
  );
}
