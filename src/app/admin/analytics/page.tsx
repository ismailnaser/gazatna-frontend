"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SimpleBarChart } from "@/components/molecules/SimpleBarChart";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
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
  pendingAdmissions?: number;
  registeredStudents: number;
  previousYearRegisteredStudents?: number;
  studentsGrowthPercent?: number | null;
  academicYear?: string | null;
  previousAcademicYear?: string | null;
  activeStudents?: number;
  inactiveStudents?: number;
  totalStudents?: number;
  gradeChart: Array<{ label: string; value: number }>;
  feesChart: Array<{ label: string; value: number }>;
  studentsChart?: Array<{ label: string; value: number }>;
  yearlyStudentsChart?: Array<{ label: string; value: number }>;
};

function formatGrowth(value: number | null | undefined) {
  if (value == null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}%`;
}

function growthTone(value: number | null | undefined) {
  if (value == null) return "text-p-black";
  if (value > 0) return "text-p-green";
  if (value < 0) return "text-p-red";
  return "text-p-black";
}

export default function AdminAnalyticsDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { grades: schoolGrades } = useSchool();

  const allowedTabs = useMemo(() => {
    if (!user || !isAdminRole(user.role)) return [] as AdminAnalyticsTab[];
    return getAdminAnalyticsTabs(user.role);
  }, [user]);

  const requestedTab = (searchParams.get("tab") as AdminAnalyticsTab | null) ?? allowedTabs[0] ?? "students";
  const activeTab = allowedTabs.includes(requestedTab) ? requestedTab : allowedTabs[0] ?? "students";
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
    if (schoolGrades.length) {
      setGrades(schoolGrades);
      return;
    }
    const timer = window.setTimeout(() => {
      api
        .getAdminGrades()
        .then((res) => setGrades((res as Grade[]) ?? []))
        .catch(() => setGrades([]));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [schoolGrades]);

  const gradeOptions = useMemo(() => {
    const names = grades.map((g) => String((g as unknown as { name?: string }).name ?? "")).filter(Boolean);
    return Array.from(new Set(names));
  }, [grades]);

  async function load(next?: { gradeLevel?: string; from?: string; to?: string }) {
    const nextGrade = next?.gradeLevel ?? gradeLevel;
    const nextFrom = next?.from ?? from;
    const nextTo = next?.to ?? to;
    setLoading(true);
    setError("");
    try {
      const res = (await api.getAdminAnalyticsDetails({
        gradeLevel: nextGrade || undefined,
        from: nextFrom || undefined,
        to: nextTo || undefined,
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
      { id: "students", label: "أعداد الطلاب" },
      { id: "grades", label: "نسب النجاح" },
      { id: "fees", label: "تحصيل الرسوم" },
    ] as const satisfies ReadonlyArray<{ id: AdminAnalyticsTab; label: string }>
  ).filter((t) => user && isAdminRole(user.role) && canAccessAdminAnalyticsTab(user.role, t.id));

  const growth = data?.studentsGrowthPercent;

  return (
    <div>
      <PageHeader
        title="تفاصيل التحليلات"
        description="فلترة حسب المرحلة والفترة الزمنية"
      />

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
              void load({ gradeLevel: "", from: "", to: "" });
            }}
          >
            إعادة تعيين
          </button>
        </div>

        {error && <p className="mt-3 text-sm font-semibold text-p-red">{error}</p>}
      </Card>

      {activeTabState === "students" ? (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <p className="text-sm text-p-black/50">
                المسجلون خلال السنة الدراسية
                {data?.academicYear ? ` ${data.academicYear}` : ""}
              </p>
              <p className="mt-1 text-3xl font-bold text-p-black">{data?.registeredStudents ?? 0}</p>
            </Card>
            <Card>
              <p className="text-sm text-p-black/50">
                المسجلون في السنة السابقة
                {data?.previousAcademicYear ? ` ${data.previousAcademicYear}` : ""}
              </p>
              <p className="mt-1 text-3xl font-bold text-p-black">
                {data?.previousYearRegisteredStudents ?? 0}
              </p>
            </Card>
            <Card>
              <p className="text-sm text-p-black/50">نسبة ازدياد الطلاب</p>
              <p className={cn("mt-1 text-3xl font-bold", growthTone(growth))}>
                {formatGrowth(growth)}
              </p>
              {growth == null && (data?.registeredStudents ?? 0) > 0 ? (
                <p className="mt-1 text-xs text-p-black/45">لا توجد تسجيلات في السنة السابقة للمقارنة</p>
              ) : null}
            </Card>
            <Card>
              <p className="text-sm text-p-black/50">إجمالي الطلاب</p>
              <p className="mt-1 text-3xl font-bold text-p-black">{data?.totalStudents ?? 0}</p>
            </Card>
            <Card>
              <p className="text-sm text-p-black/50">الطلاب النشطون</p>
              <p className="mt-1 text-3xl font-bold text-p-black">{data?.activeStudents ?? 0}</p>
            </Card>
            <Card>
              <p className="text-sm text-p-black/50">غير النشطين / طلبات قيد الانتظار</p>
              <p className="mt-1 text-3xl font-bold text-p-black">
                {data?.inactiveStudents ?? 0}
                <span className="mx-1 text-lg font-semibold text-p-black/35">/</span>
                {data?.pendingAdmissions ?? 0}
              </p>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h3 className="mb-4 font-bold text-p-black">التسجيلات حسب المرحلة (السنة الحالية)</h3>
              {loading ? (
                <p className="text-sm text-neutral-500">جاري التحميل...</p>
              ) : data && (data.studentsChart?.length ?? 0) > 0 ? (
                <SimpleBarChart data={data.studentsChart ?? []} color="bg-p-green" unit="" />
              ) : (
                <p className="text-sm text-neutral-500">لا توجد بيانات.</p>
              )}
            </Card>
            <Card>
              <h3 className="mb-4 font-bold text-p-black">مقارنة التسجيلات بين السنوات</h3>
              {loading ? (
                <p className="text-sm text-neutral-500">جاري التحميل...</p>
              ) : data && (data.yearlyStudentsChart?.length ?? 0) > 0 ? (
                <SimpleBarChart data={data.yearlyStudentsChart ?? []} color="bg-brand-blue" unit="" />
              ) : (
                <p className="text-sm text-neutral-500">لا توجد بيانات.</p>
              )}
            </Card>
          </div>
        </>
      ) : (
        <>
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

          {activeTabState === "grades" ? (
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
        </>
      )}
    </div>
  );
}
