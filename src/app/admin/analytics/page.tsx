"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SimpleBarChart } from "@/components/molecules/SimpleBarChart";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  canAccessAdminAnalyticsTab,
  getAdminAnalyticsTabs,
  isAdminRole,
  type AdminAnalyticsTab,
} from "@/lib/adminRoles";
import type { Grade } from "@/types/teacher";
import { cn } from "@/lib/utils";

type AnalyticsDetails = {
  avgGrade: number;
  feesCollected: number;
  gradeChart: Array<{ label: string; value: number }>;
  feesChart: Array<{ label: string; value: number }>;
};

export default function AdminAnalyticsDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const allowedTabs = useMemo(() => {
    if (!user || !isAdminRole(user.role)) return [] as AdminAnalyticsTab[];
    return getAdminAnalyticsTabs(user.role);
  }, [user]);

  const requestedTab = (searchParams.get("tab") as AdminAnalyticsTab | null) ?? allowedTabs[0] ?? "grades";
  const activeTab = allowedTabs.includes(requestedTab) ? requestedTab : allowedTabs[0] ?? "grades";
  const [activeTabState, setActiveTabState] = useState<AdminAnalyticsTab>(activeTab);

  useEffect(() => {
    setActiveTabState(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (!user || !isAdminRole(user.role)) return;
    if (allowedTabs.length === 0) {
      router.replace("/admin");
      return;
    }
    if (!allowedTabs.includes(requestedTab)) {
      router.replace(`/admin/analytics?tab=${allowedTabs[0]}`);
    }
  }, [user, allowedTabs, requestedTab, router]);

  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<AnalyticsDetails | null>(null);

  const gradeSelectId = "admin-analytics-grade";
  const fromId = "admin-analytics-from";
  const toId = "admin-analytics-to";

  const [gradeLevel, setGradeLevel] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  useEffect(() => {
    api
      .getAdminGrades()
      .then((res) => setGrades((res as Grade[]) ?? []))
      .catch(() => setGrades([]));
  }, []);

  const gradeOptions = useMemo(() => {
    const names = grades.map((g) => String((g as unknown as { name?: string }).name ?? "")).filter(Boolean);
    return Array.from(new Set(names));
  }, [grades]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = (await api.getAdminAnalyticsDetails({
        gradeLevel: gradeLevel || undefined,
        from: from || undefined,
        to: to || undefined,
      })) as AnalyticsDetails;
      setData(res);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "تعذر تحميل التحليلات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchTab(tab: AdminAnalyticsTab) {
    if (!user || !isAdminRole(user.role) || !canAccessAdminAnalyticsTab(user.role, tab)) return;
    setActiveTabState(tab);
    router.replace(`/admin/analytics?tab=${tab}`);
  }

  const tabs = (
    [
      { id: "grades", label: "نسب النجاح" },
      { id: "fees", label: "تحصيل الرسوم" },
    ] as const satisfies ReadonlyArray<{ id: AdminAnalyticsTab; label: string }>
  ).filter((t) => user && isAdminRole(user.role) && canAccessAdminAnalyticsTab(user.role, t.id));

  return (
    <div>
      <PageHeader
        title="تفاصيل التحليلات"
        description="فلترة حسب المرحلة والفترة الزمنية"
      />

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-neutral-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => switchTab(t.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-semibold transition-colors",
              activeTabState === t.id
                ? "border-b-2 border-p-green text-p-green"
                : "text-p-black/50 hover:text-p-black"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={gradeSelectId} className="text-sm font-medium text-p-black/80">
              المرحلة
            </label>
            <select
              id={gradeSelectId}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-p-black focus:border-p-green focus:outline-none focus:ring-2 focus:ring-p-green/20"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
            >
              <option value="">كل المراحل</option>
              {gradeOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {activeTabState === "fees" && (
            <>
              <Input
                id={fromId}
                label="من تاريخ"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
              <Input
                id={toId}
                label="إلى تاريخ"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-xl bg-p-green px-4 py-2 text-sm font-semibold text-white hover:bg-p-green/90"
            onClick={load}
          >
            تطبيق الفلتر
          </button>
          <button
            type="button"
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-p-black hover:bg-neutral-50"
            onClick={() => {
              setGradeLevel("");
              setFrom("");
              setTo("");
              setTimeout(load, 0);
            }}
          >
            إعادة تعيين
          </button>
        </div>

        {error && <p className="mt-3 text-sm font-semibold text-p-red">{error}</p>}
      </Card>

      {/* Summary tile */}
      <div className="mb-6">
        {activeTabState === "grades" ? (
          <Card className="flex items-center gap-4">
            <div>
              <p className="text-sm text-p-black/50">متوسط الدرجات</p>
              <p className="text-3xl font-bold text-p-black">{data?.avgGrade ?? 0}%</p>
            </div>
          </Card>
        ) : (
          <Card className="flex items-center gap-4">
            <div>
              <p className="text-sm text-p-black/50">نسبة الرسوم المحصلة</p>
              <p className="text-3xl font-bold text-p-black">{data?.feesCollected ?? 0}%</p>
            </div>
          </Card>
        )}
      </div>

      {/* Chart */}
      {activeTab === "grades" ? (
        <Card>
          <h3 className="mb-4 font-bold text-p-black">نسب النجاح حسب المرحلة</h3>
          {loading ? (
            <p className="text-sm text-neutral-500">جاري التحميل...</p>
          ) : data && data.gradeChart.length > 0 ? (
            <SimpleBarChart data={data.gradeChart} color="bg-p-green" />
          ) : (
            <p className="text-sm text-neutral-500">لا توجد بيانات.</p>
          )}
        </Card>
      ) : (
        <Card>
          <h3 className="mb-4 font-bold text-p-black">نسبة الرسوم المحصلة حسب المرحلة</h3>
          {loading ? (
            <p className="text-sm text-neutral-500">جاري التحميل...</p>
          ) : data && data.feesChart.length > 0 ? (
            <SimpleBarChart data={data.feesChart} color="bg-p-red" />
          ) : (
            <p className="text-sm text-neutral-500">لا توجد بيانات.</p>
          )}
        </Card>
      )}
    </div>
  );
}

