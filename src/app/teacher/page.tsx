"use client";

import { Card } from "@/components/atoms/Card";
import { HubCard, HubGrid } from "@/components/dashboard/HubCard";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { EmptyState } from "@/components/molecules/EmptyState";
import { AcademicPeriodBanner } from "@/components/shared/AcademicPeriodBanner";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import {
  Archive,
  Bell,
  BookOpenCheck,
  CalendarDays,
  ClipboardList,
  FileText,
  FolderOpen,
  GraduationCap,
  PenLine,
  Users,
} from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { getTeacherClassesByUserId, loading } = useSchool();
  const classes = user ? getTeacherClassesByUserId(user.id) : [];

  return (
    <WorkspacePage
      title="فصولي"
      description="فصولك المسندة وأدوات التدريس."
      loading={loading}
    >
      <AcademicPeriodBanner />

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-p-black/70">الفصول المسندة</h2>
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-p-black/50">
            {classes.length}
          </span>
        </div>
        {classes.length === 0 ? (
          <EmptyState
            title="لا توجد فصول مسندة إليك حالياً"
            description="تواصل مع الإدارة لإسناد الفصول والمواد."
          />
        ) : (
          <div className="card-grid">
            {classes.map((cls) => (
              <Card key={cls.id} className="p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10">
                    <GraduationCap className="h-5 w-5 text-brand-teal" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-p-black">{cls.name}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-p-black/55">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      {cls.studentCount ?? 0} {(cls.studentCount ?? 0) === 1 ? "طالب" : "طلاب"}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <HubGrid>
        <HubCard
          href="/teacher/homework"
          icon={PenLine}
          title="الواجبات"
          description="إنشاء الواجبات ومتابعة التسليمات."
          tone="warning"
        />
        <HubCard
          href="/teacher/quizzes"
          icon={ClipboardList}
          title="الاختبارات"
          description="إعداد الاختبارات وإظهار العلامات."
        />
        <HubCard
          href="/teacher/grade-entry"
          icon={BookOpenCheck}
          title="التقييمات والعلامات"
          description="تقييم التسليمات وإدخال علامات المواد."
          tone="success"
        />
        <HubCard
          href="/teacher/announcements"
          icon={Bell}
          title="الإعلانات"
          description="نشر إعلانات تظهر للطلاب ضمن المادة."
        />
        <HubCard
          href="/teacher/materials"
          icon={FolderOpen}
          title="مرفقات المواد"
          description="رفع الكتب والشرائح والمصادر."
        />
        <HubCard
          href="/teacher/alerts"
          icon={Bell}
          title="تنبيهات التسليم"
          description="تسليمات الواجبات والاختبارات الجديدة."
          tone="warning"
        />
        <HubCard
          href="/teacher/schedules"
          icon={CalendarDays}
          title="جدول حصصي"
          description="الحصص الأسبوعية حسب الجداول المنشورة."
        />
        <HubCard
          href="/teacher/archive"
          icon={Archive}
          title="الأرشيف"
          description="علامات الفصول الدراسية المنتهية."
        />
        <HubCard
          href="/teacher/profile"
          icon={FileText}
          title="سيرتي الذاتية"
          description="البيانات الظاهرة في صفحة الكادر."
        />
      </HubGrid>
    </WorkspacePage>
  );
}
