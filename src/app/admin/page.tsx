"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  type AdminAnalyticsTab,
} from "@/lib/adminRoles";
import type { AdminAnalytics } from "@/types/news";
import { emptyAdminAnalytics } from "@/types/news";
import { cn } from "@/lib/utils";
import { BarChart3, Bell, CreditCard, Settings2, Users } from "lucide-react";

type HomeTab = AdminAnalyticsTab | "alerts";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [meta, setMeta] = useState<{ academicYear?: string | null; academicTerm?: string | null }>({});
  const [cache, setCache] = useState<Partial<Record<HomeTab, AdminAnalytics>>>({});
  const loadedRef = useRef<Partial<Record<HomeTab, true>>>({});
  const [loadingTab, setLoadingTab] = useState(false);
  const [activeTab, setActiveTab] = useState<HomeTab | null>(null);

  const canOpenSite = user && isSuperAdmin(user.role);
  const canOpenNotifications =
    user && isAdminRole(user.role) && canAccessAdminPath(user.role, "/admin/notifications");
  const canOpenGrades =
    user && isAdminRole(user.role) && canAccessAdminAnalyticsTab(user.role, "grades");
  const canOpenFees =
    user && isAdminRole(user.role) && canAccessAdminAnalyticsTab(user.role, "fees");
  const canOpenStudents =
    user && isAdminRole(user.role) && canAccessAdminAnalyticsTab(user.role, "students");

  const tabs = useMemo(() => {
    const rows: Array<{ id: HomeTab; label: string }> = [];
    if (canOpenStudents) rows.push({ id: "students", label: "أعداد الطلاب" });
    if (canOpenGrades) rows.push({ id: "grades", label: "نسب النجاح" });
    if (canOpenFees) rows.push({ id: "fees", label: "تحصيل الرسوم" });
    rows.push({ id: "alerts", label: "الإشعارات" });
    return rows;
  }, [canOpenStudents, canOpenGrades, canOpenFees]);

  useEffect(() => {
    api
      .getAdminAnalytics({ section: "meta" })
      .then((res) => {
        const row = res as AdminAnalytics;
        setMeta({ academicYear: row.academicYear, academicTerm: row.academicTerm });
      })
      .catch(() => setMeta({}));
  }, []);

  useEffect(() => {
    if (!activeTab && tabs.length) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  const loadSection = useCallback(async (tab: HomeTab) => {
    if (loadedRef.current[tab]) return;
    loadedRef.current[tab] = true;
    setLoadingTab(true);
    try {
      const res = (await api.getAdminAnalytics({ section: tab })) as AdminAnalytics;
      setCache((prev) => ({ ...prev, [tab]: res }));
      if (res.academicYear || res.academicTerm) {
        setMeta((prev) => ({
          academicYear: res.academicYear ?? prev.academicYear,
          academicTerm: res.academicTerm ?? prev.academicTerm,
        }));
      }
    } catch {
      setCache((prev) => ({ ...prev, [tab]: emptyAdminAnalytics }));
    } finally {
      setLoadingTab(false);
    }
  }, []);

  useEffect(() => {
    if (!activeTab) return;
    void loadSection(activeTab);
  }, [activeTab, loadSection]);

  const data = (activeTab && cache[activeTab]) || emptyAdminAnalytics;
  const growth = data.studentsGrowthPercent;
  const growthLabel = growth == null ? "—" : `${growth > 0 ? "+" : ""}${growth}%`;
  const growthClass =
    growth == null
      ? "text-p-black"
      : growth > 0
        ? "text-p-green"
        : growth < 0
          ? "text-p-red"
          : "text-p-black";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <PageHeader title="لوحة التحليلات" description="اختر قسماً لعرض بياناته دون تحميل الكل معاً" />
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
        yearLabel={meta.academicYear}
        termLabel={meta.academicTerm}
      />

      <div className="mb-6 flex flex-wrap gap-2 border-b border-neutral-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-semibold transition-colors",
              activeTab === t.id
                ? "border-b-2 border-p-green text-p-green"
                : "text-p-black/50 hover:text-p-black"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loadingTab && !(activeTab && cache[activeTab]) ? (
        <Card>
          <p className="text-sm text-neutral-500">جاري تحميل القسم...</p>
        </Card>
      ) : null}

      {activeTab === "students" && cache.students && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Card className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-p-green/10">
              <Users className="h-6 w-6 text-p-green" />
            </span>
            <div>
              <p className="text-sm text-p-black/50">
                المسجلون خلال السنة
                {data.academicYear ? ` ${data.academicYear}` : ""}
              </p>
              <p className="text-3xl font-bold text-p-black">{data.registeredStudents ?? 0}</p>
              <p className={`mt-0.5 text-xs font-semibold ${growthClass}`}>
                ازدياد عن السنة السابقة: {growthLabel}
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-p-green/10">
              <Users className="h-6 w-6 text-p-green" />
            </span>
            <div>
              <p className="text-sm text-p-black/50">الطلاب النشطون / الإجمالي</p>
              <p className="text-3xl font-bold text-p-black">
                {data.activeStudents ?? 0}
                <span className="mx-1 text-lg font-semibold text-p-black/35">/</span>
                {data.totalStudents ?? 0}
              </p>
              <Link
                href="/admin/analytics?tab=students"
                className="mt-1 inline-block text-xs font-semibold text-p-green hover:underline"
              >
                تفاصيل أكثر
              </Link>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "grades" && cache.grades && (
        <div className="mb-8">
          <Card className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-p-green/10">
              <BarChart3 className="h-6 w-6 text-p-green" />
            </span>
            <div>
              <p className="text-sm text-p-black/50">معدل درجات المدرسة</p>
              <p className="text-3xl font-bold text-p-black">{data.avgGrade}%</p>
              <Link
                href="/admin/analytics?tab=grades"
                className="mt-1 inline-block text-xs font-semibold text-p-green hover:underline"
              >
                تفاصيل أكثر
              </Link>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "fees" && cache.fees && (
        <div className="mb-8 space-y-4">
          <Card className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-p-green/10">
              <CreditCard className="h-6 w-6 text-p-green" />
            </span>
            <div>
              <p className="text-sm text-p-black/50">نسبة الرسوم المحصلة</p>
              <p className="text-3xl font-bold text-p-black">{data.feesCollected}%</p>
              <Link
                href="/admin/analytics?tab=fees"
                className="mt-1 inline-block text-xs font-semibold text-p-green hover:underline"
              >
                تفاصيل أكثر
              </Link>
            </div>
          </Card>
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

      {activeTab === "alerts" && cache.alerts && (
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
      )}
    </div>
  );
}
