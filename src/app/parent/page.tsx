"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { InstallmentNotifications } from "@/components/parent/InstallmentPanel";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { ParentAlert, Student } from "@/types";
import type { FeeInstallmentNotification } from "@/types/finance";
import {
  Bell,
  BookOpen,
  ChevronLeft,
  ClipboardList,
  CreditCard,
  GraduationCap,
  FolderOpen,
  Hash,
  Megaphone,
  Paperclip,
  Users,
} from "lucide-react";

function subjectContentPath(subject?: string) {
  if (!subject) return "/parent/homework";
  return `/parent/homework/subject/${encodeURIComponent(subject)}`;
}

function alertHref(alert: ParentAlert) {
  if (alert.type === "homework" && alert.homeworkId) {
    return `/parent/homework/${alert.homeworkId}`;
  }
  if (alert.type === "quiz" && alert.quizId) {
    return `/parent/quizzes/${alert.quizId}`;
  }
  if (alert.subject) return subjectContentPath(alert.subject);
  return "/parent/homework";
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<ParentAlert[]>([]);
  const [installmentNotices, setInstallmentNotices] = useState<FeeInstallmentNotification[]>([]);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      api.getParentStudent().then((s) => setStudent(s as Student)).catch(() => setStudent(null)),
      api.getParentAlerts()
        .then((data) => {
          const rows = data as Array<Record<string, unknown>>;
          const nonInstallment = rows.filter((a) => a.type !== "installment");
          setAlerts(
            nonInstallment.map((a) => ({
              id: String(a.id),
              text: String(a.text),
              type: String(a.type),
              homeworkId: a.homeworkId ? String(a.homeworkId) : undefined,
              quizId: a.quizId ? String(a.quizId) : undefined,
              announcementId: a.announcementId ? String(a.announcementId) : undefined,
              materialId: a.materialId ? String(a.materialId) : undefined,
              subject: a.subject ? String(a.subject) : undefined,
            }))
          );
          setInstallmentNotices(
            rows
              .filter((a) => a.type === "installment")
              .map((a) => ({
                id: String(a.id),
                order: Number(a.order),
                amount: Number(a.amount),
                remaining: Number(a.remaining),
                startDate: String(a.startDate),
                endDate: String(a.endDate),
                status: a.status as FeeInstallmentNotification["status"],
                type: "installment" as const,
                text: String(a.text),
              }))
          );
        })
        .catch(() => {
          setAlerts([]);
          setInstallmentNotices([]);
        }),
    ]).finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  if (!student) {
    return (
      <Card className="text-center text-neutral-500">
        لا يوجد طالب مرتبط بحسابك. تواصل مع الإدارة.
      </Card>
    );
  }

  const contentAlerts = alerts.filter((a) =>
    ["homework", "quiz", "announcement", "material"].includes(a.type)
  );
  const otherAlerts = alerts.filter(
    (a) => !["homework", "quiz", "announcement", "material"].includes(a.type)
  );

  function alertIcon(type: string) {
    if (type === "quiz") return <ClipboardList className="h-5 w-5 text-brand-blue" />;
    if (type === "announcement") return <Megaphone className="h-5 w-5 text-amber-600" />;
    if (type === "material") return <FolderOpen className="h-5 w-5 text-brand-blue" />;
    return <BookOpen className="h-5 w-5 text-brand-orange" />;
  }

  function alertHint(type: string) {
    if (type === "quiz") return "اختبار — اضغط للمتابعة";
    if (type === "announcement") return "إعلان جديد — اضغط للعرض";
    if (type === "material") return "مرفق جديد — اضغط للتحميل";
    return "واجب — اضغط للعرض";
  }

  async function handleContentAlertClick(alert: ParentAlert) {
    if (alert.type === "announcement" || alert.type === "material") {
      setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
      try {
        await api.dismissParentAlert(alert.id);
      } catch {
        /* keep hidden locally even if request fails */
      }
    }
    router.push(alertHref(alert));
  }

  return (
    <div>
      <PageHeader
        title="الرئيسية"
        description="متابعة ابنك/ابنتك — محتوى المواد، الاختبارات، والنتائج"
      />

      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="col-span-2 flex min-w-0 items-center gap-2 p-4 sm:gap-3 sm:p-6 lg:col-span-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-p-green/10 sm:h-10 sm:w-10">
            <GraduationCap className="h-4 w-4 text-p-green sm:h-5 sm:w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-p-black/50 sm:text-xs">اسم الطالب</p>
            <p className="text-sm font-semibold leading-snug text-p-black sm:text-base">{student.name}</p>
          </div>
        </Card>
        {[
          { icon: Users, label: "الصف", value: student.grade },
          { icon: Hash, label: "الشعبة", value: student.section },
        ].map((item) => (
          <Card key={item.label} className="flex min-w-0 items-center gap-2 p-4 sm:gap-3 sm:p-6">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-p-green/10 sm:h-10 sm:w-10">
              <item.icon className="h-4 w-4 text-p-green sm:h-5 sm:w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] text-p-black/50 sm:text-xs">{item.label}</p>
              <p className="truncate text-sm font-semibold text-p-black sm:text-base">{item.value}</p>
            </div>
          </Card>
        ))}
        <Card className="col-span-2 flex min-w-0 items-center gap-2 p-4 sm:gap-3 sm:p-6 lg:col-span-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-p-green/10 sm:h-10 sm:w-10">
            <Hash className="h-4 w-4 text-p-green sm:h-5 sm:w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-p-black/50 sm:text-xs">رقم الطالب</p>
            <p className="text-sm font-semibold text-p-black sm:text-base">{student.studentNumber}</p>
          </div>
        </Card>
      </div>

      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-p-black">
        <BookOpen className="h-5 w-5 text-brand-orange" />
        محتوى المواد
        {contentAlerts.length > 0 && (
          <span className="rounded-full bg-brand-orange/15 px-2 py-0.5 text-xs font-bold text-brand-orange">
            {contentAlerts.length}
          </span>
        )}
      </h2>

      {contentAlerts.length === 0 ? (
        <Card className="mb-6 text-center text-neutral-500">
          لا توجد إشعارات جديدة في المواد حالياً.
        </Card>
      ) : (
        <div className="mb-6 space-y-3">
          {contentAlerts.map((alert) => (
            <button
              key={alert.id}
              type="button"
              onClick={() => handleContentAlertClick(alert)}
              className="block w-full text-start"
            >
              <Card className="flex items-center justify-between gap-3 py-4 transition-shadow hover:shadow-md">
                <div className="flex items-center gap-3">
                  {alertIcon(alert.type)}
                  <div>
                    <p className="font-semibold text-p-black">{alert.text}</p>
                    <p className="text-xs text-p-black/50">{alertHint(alert.type)}</p>
                  </div>
                </div>
                <ChevronLeft className="h-5 w-5 text-p-black/30" />
              </Card>
            </button>
          ))}
        </div>
      )}

      <Link href="/parent/homework" className="mb-8 block">
        <Card className="transition-shadow hover:shadow-md">
          <BookOpen className="mb-2 h-7 w-7 text-brand-orange" />
          <h3 className="font-bold text-neutral-950">فتح محتوى المواد</h3>
          <p className="mt-1 text-sm text-neutral-600">
            تصفّح المواد — واجبات، اختبارات، إعلانات، ومرفقات المعلم
          </p>
        </Card>
      </Link>

      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-p-black">
        <Bell className="h-5 w-5 text-amber-500" />
        تنبيهات أخرى
      </h2>

      {installmentNotices.length > 0 && (
        <div className="mb-6">
          <InstallmentNotifications notifications={installmentNotices} />
          <Link href="/parent/fees" className="mt-2 inline-block text-sm font-semibold text-p-green hover:underline">
            الذهاب إلى صفحة المالية
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {otherAlerts.length === 0 && installmentNotices.length === 0 ? (
          <Card className="text-center text-neutral-500">لا توجد تنبيهات أخرى.</Card>
        ) : (
          otherAlerts.map((alert) => (
            <Card key={alert.id} className="flex items-center gap-3 py-4">
              {alert.type === "payment" && <CreditCard className="h-5 w-5 text-p-green" />}
              {alert.type === "note" && <Bell className="h-5 w-5 text-p-green" />}
              {alert.type === "grade" && <GraduationCap className="h-5 w-5 text-amber-500" />}
              <p className="text-sm text-p-black/80">{alert.text}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
