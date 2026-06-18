"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Card } from "@/components/atoms/Card";
import { TeacherSubmissionAlerts } from "@/components/teacher/TeacherSubmissionAlerts";
import { useAssignments } from "@/context/AssignmentsContext";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import { useTeacherAlerts } from "@/hooks/useTeacherAlerts";
import {
  BookOpen,
  ChevronLeft,
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
  homeworkCount,
  quizCount,
  href,
}: {
  name: string;
  studentCount: number;
  homeworkCount: number;
  quizCount: number;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <article className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all hover:border-brand-teal/25 hover:shadow-md">
        <div className="h-1 bg-brand-teal/80" />
        <div className="p-3.5 sm:p-4">
          <div className="flex items-start justify-between gap-2">
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
            <ChevronLeft className="mt-1 h-5 w-5 shrink-0 text-p-black/25" />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <DashboardStat
              icon={BookOpen}
              count={homeworkCount}
              label={homeworkCount === 1 ? "واجب" : "واجبات"}
              tone="blue"
            />
            <DashboardStat
              icon={ClipboardList}
              count={quizCount}
              label={quizCount === 1 ? "اختبار" : "اختبارات"}
              tone="orange"
            />
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { getTeacherClassesByUserId } = useSchool();
  const { getHomeworkByClass, getQuizzesByClass, homeworkSubmissions } = useAssignments();
  const classes = user ? getTeacherClassesByUserId(user.id) : [];
  const { alerts, refresh } = useTeacherAlerts();

  useEffect(() => {
    refresh();
  }, [homeworkSubmissions.length, refresh]);

  const totals = useMemo(() => {
    let students = 0;
    let homework = 0;
    let quizzes = 0;
    for (const cls of classes) {
      students += cls.studentCount ?? 0;
      homework += getHomeworkByClass(cls.id).length;
      quizzes += getQuizzesByClass(cls.id).length;
    }
    return { students, homework, quizzes };
  }, [classes, getHomeworkByClass, getQuizzesByClass]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <header>
        <h1 className="text-xl font-bold text-p-green sm:text-2xl">فصولي</h1>
        <p className="mt-1 text-sm text-p-black/55">الفصول المسندة إليك من الإدارة</p>
      </header>

      {classes.length > 0 && (
        <Card className="border-neutral-100 p-3 sm:p-4">
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
        </Card>
      )}

      <TeacherSubmissionAlerts
        alerts={alerts}
        limit={5}
        alwaysShow
        onAlertOpen={refresh}
      />

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
                homeworkCount={getHomeworkByClass(cls.id).length}
                quizCount={getQuizzesByClass(cls.id).length}
                href={`/teacher/classes/${cls.id}`}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
