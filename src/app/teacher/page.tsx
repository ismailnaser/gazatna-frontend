"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/atoms/Card";
import { AcademicPeriodBanner } from "@/components/shared/AcademicPeriodBanner";
import { TeacherSubmissionAlerts } from "@/components/teacher/TeacherSubmissionAlerts";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import { useTeacherAlerts } from "@/hooks/useTeacherAlerts";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Homework, Quiz } from "@/types";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Users,
} from "lucide-react";

function DashboardStat({
  icon: Icon,
  count,
  label,
  tone,
}: {
  icon: typeof GraduationCap;
  count: number;
  label: string;
  tone: "teal" | "blue" | "orange" | "neutral";
}) {
  const tones = {
    teal: "bg-p-green/10 text-p-green",
    blue: "bg-brand-blue/10 text-brand-blue",
    orange: "bg-brand-orange/10 text-brand-orange",
    neutral: "bg-neutral-100 text-p-black/70",
  };

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2.5">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none text-p-black">{count}</p>
        <p className="mt-0.5 truncate text-xs text-p-black/55">{label}</p>
      </div>
    </div>
  );
}

function TeacherClassCard({
  name,
  studentCount,
}: {
  name: string;
  studentCount: number;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50 shadow-sm">
      <div className="h-1 bg-brand-teal/80" />
      <div className="p-3.5 sm:p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10">
            <GraduationCap className="h-5 w-5 text-brand-teal" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-p-black sm:text-lg">{name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-p-black/50">
              <Users className="h-3.5 w-3.5 shrink-0" />
              {studentCount} {studentCount === 1 ? "طالب" : "طلاب"}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

type HomeTab = "classes" | "summary" | "alerts";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { getTeacherClassesByUserId } = useSchool();
  const classes = user ? getTeacherClassesByUserId(user.id) : [];
  const [activeTab, setActiveTab] = useState<HomeTab>("classes");
  const [homework, setHomework] = useState<Homework[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryLoaded, setSummaryLoaded] = useState(false);
  const { alerts, refresh } = useTeacherAlerts({ enabled: activeTab === "alerts" });

  useEffect(() => {
    if (activeTab !== "summary" || summaryLoaded) return;
    let cancelled = false;
    setSummaryLoading(true);
    Promise.all([api.getTeacherHomework(), api.getTeacherQuizzes()])
      .then(([hw, quiz]) => {
        if (cancelled) return;
        setHomework(hw as Homework[]);
        setQuizzes(quiz as Quiz[]);
        setSummaryLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setHomework([]);
        setQuizzes([]);
        setSummaryLoaded(true);
      })
      .finally(() => {
        if (!cancelled) setSummaryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, summaryLoaded]);

  const totals = useMemo(() => {
    let students = 0;
    for (const cls of classes) {
      students += cls.studentCount ?? 0;
    }
    const classIds = new Set(classes.map((c) => c.id));
    const hwCount = homework.filter((h) => classIds.has(h.classId)).length;
    const quizCount = quizzes.filter((q) => classIds.has(q.classId)).length;
    return { students, homework: hwCount, quizzes: quizCount };
  }, [classes, homework, quizzes]);

  const tabs: Array<{ id: HomeTab; label: string }> = [
    { id: "classes", label: "فصولي" },
    { id: "summary", label: "الملخص" },
    { id: "alerts", label: "تنبيهات التسليم" },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      <header>
        <h1 className="text-xl font-bold text-p-green sm:text-2xl">فصولي</h1>
        <p className="mt-1 text-sm text-p-black/55">اختر قسماً لعرضه دون تحميل كل البيانات معاً</p>
      </header>

      <AcademicPeriodBanner />

      <div className="flex flex-wrap gap-2 border-b border-neutral-200">
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

      {activeTab === "classes" && (
        <>
          {classes.length === 0 ? (
            <Card className="border-neutral-100 p-6 text-center text-p-black/50">
              لا توجد فصول مسندة إليك حالياً. تواصل مع الإدارة.
            </Card>
          ) : (
            <section>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-p-black/70">قائمة الفصول</h2>
                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-p-black/50">
                  {classes.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {classes.map((cls) => (
                  <TeacherClassCard
                    key={cls.id}
                    name={cls.name}
                    studentCount={cls.studentCount ?? 0}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {activeTab === "summary" && (
        <Card className="border-neutral-100 p-3 sm:p-4">
          {summaryLoading ? (
            <p className="text-sm text-neutral-500">جاري تحميل الملخص...</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <DashboardStat
                icon={GraduationCap}
                count={classes.length}
                label={classes.length === 1 ? "فصل" : "فصول"}
                tone="teal"
              />
              <DashboardStat
                icon={Users}
                count={totals.students}
                label={totals.students === 1 ? "طالب" : "طلاب"}
                tone="blue"
              />
              <DashboardStat
                icon={BookOpen}
                count={totals.homework}
                label={totals.homework === 1 ? "واجب" : "واجبات"}
                tone="orange"
              />
              <DashboardStat
                icon={ClipboardList}
                count={totals.quizzes}
                label={totals.quizzes === 1 ? "اختبار" : "اختبارات"}
                tone="neutral"
              />
            </div>
          )}
        </Card>
      )}

      {activeTab === "alerts" && (
        <TeacherSubmissionAlerts
          alerts={alerts}
          limit={5}
          alwaysShow
          onAlertOpen={refresh}
        />
      )}
    </div>
  );
}
