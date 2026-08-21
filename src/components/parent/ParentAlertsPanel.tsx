"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/atoms/Card";
import { EmptyState } from "@/components/molecules/EmptyState";
import { InstallmentNotifications } from "@/components/parent/InstallmentPanel";
import { api, peekCachedList } from "@/lib/api";
import type { ParentAlert } from "@/types";
import type { FeeInstallmentNotification } from "@/types/finance";
import {
  Bell,
  BookOpen,
  ChevronLeft,
  ClipboardList,
  CreditCard,
  FolderOpen,
  GraduationCap,
  Megaphone,
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

function mapAlerts(rows: Array<Record<string, unknown>>) {
  const nonInstallment = rows.filter((row) => row.type !== "installment");
  const alerts: ParentAlert[] = nonInstallment.map((row) => ({
    id: String(row.id),
    text: String(row.text),
    type: String(row.type),
    homeworkId: row.homeworkId ? String(row.homeworkId) : undefined,
    quizId: row.quizId ? String(row.quizId) : undefined,
    announcementId: row.announcementId ? String(row.announcementId) : undefined,
    materialId: row.materialId ? String(row.materialId) : undefined,
    subject: row.subject ? String(row.subject) : undefined,
  }));
  const installmentNotices: FeeInstallmentNotification[] = rows
    .filter((row) => row.type === "installment")
    .map((row) => ({
      id: String(row.id),
      order: Number(row.order),
      amount: Number(row.amount),
      remaining: Number(row.remaining),
      startDate: String(row.startDate),
      endDate: String(row.endDate),
      status: row.status as FeeInstallmentNotification["status"],
      type: "installment" as const,
      text: String(row.text),
    }));
  return { alerts, installmentNotices };
}

export function ParentAlertsPanel() {
  const router = useRouter();
  const cached = peekCachedList<Record<string, unknown>>("/parent/alerts/");
  const initial = cached ? mapAlerts(cached) : { alerts: [], installmentNotices: [] };
  const [alerts, setAlerts] = useState<ParentAlert[]>(initial.alerts);
  const [installmentNotices, setInstallmentNotices] = useState<FeeInstallmentNotification[]>(
    initial.installmentNotices
  );
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    let cancelled = false;
    api
      .getParentAlerts()
      .then((data) => {
        if (cancelled) return;
        const mapped = mapAlerts(data as Array<Record<string, unknown>>);
        setAlerts(mapped.alerts);
        setInstallmentNotices(mapped.installmentNotices);
      })
      .catch(() => {
        if (cancelled || cached) return;
        setAlerts([]);
        setInstallmentNotices([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const contentAlerts = alerts.filter((alert) =>
    ["homework", "quiz", "announcement", "material"].includes(alert.type)
  );
  const otherAlerts = alerts.filter(
    (alert) => !["homework", "quiz", "announcement", "material"].includes(alert.type)
  );

  const handleContentAlertClick = useCallback(
    async (alert: ParentAlert) => {
      if (alert.type === "announcement" || alert.type === "material") {
        setAlerts((prev) => prev.filter((row) => row.id !== alert.id));
        try {
          await api.dismissParentAlert(alert.id);
        } catch {
          /* keep hidden locally even if request fails */
        }
      }
      router.push(alertHref(alert));
    },
    [router]
  );

  if (loading) {
    return <p className="text-sm text-p-black/65">جاري تحميل التنبيهات...</p>;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-p-black">
          <BookOpen className="h-5 w-5 text-brand-orange" />
          محتوى المواد
          {contentAlerts.length > 0 ? (
            <span className="rounded-full bg-brand-orange/15 px-2 py-0.5 text-xs font-bold text-brand-orange">
              {contentAlerts.length}
            </span>
          ) : null}
        </h2>
        {contentAlerts.length === 0 ? (
          <EmptyState title="لا توجد إشعارات جديدة في المواد حالياً." />
        ) : (
          <div className="space-y-3">
            {contentAlerts.map((alert) => (
              <button
                key={alert.id}
                type="button"
                onClick={() => handleContentAlertClick(alert)}
                className="block w-full text-start"
              >
                <Card className="flex items-center justify-between gap-3 py-4 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-3">
                    {alert.type === "quiz" ? (
                      <ClipboardList className="h-5 w-5 text-brand-blue" />
                    ) : alert.type === "announcement" ? (
                      <Megaphone className="h-5 w-5 text-amber-600" />
                    ) : alert.type === "material" ? (
                      <FolderOpen className="h-5 w-5 text-brand-blue" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-brand-orange" />
                    )}
                    <div>
                      <p className="font-semibold text-p-black">{alert.text}</p>
                      <p className="text-xs text-p-black/72">
                        {alert.type === "quiz"
                          ? "اختبار — اضغط للمتابعة"
                          : alert.type === "announcement"
                            ? "إعلان جديد — اضغط للعرض"
                            : alert.type === "material"
                              ? "مرفق جديد — اضغط للتحميل"
                              : "واجب — اضغط للعرض"}
                      </p>
                    </div>
                  </div>
                  <ChevronLeft className="h-5 w-5 text-p-black/30" />
                </Card>
              </button>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-p-black">
          <Bell className="h-5 w-5 text-amber-500" />
          تنبيهات أخرى
        </h2>
        {installmentNotices.length > 0 ? (
          <div className="mb-6">
            <InstallmentNotifications notifications={installmentNotices} />
            <Link
              href="/parent/fees"
              prefetch={false}
              className="mt-2 inline-block text-sm font-semibold text-p-green hover:underline"
            >
              الذهاب إلى صفحة المالية
            </Link>
          </div>
        ) : null}
        {otherAlerts.length === 0 && installmentNotices.length === 0 ? (
          <EmptyState title="لا توجد تنبيهات أخرى." />
        ) : (
          <div className="space-y-3">
            {otherAlerts.map((alert) => (
              <Card key={alert.id} className="flex items-center gap-3 py-4">
                {alert.type === "payment" ? <CreditCard className="h-5 w-5 text-p-green" /> : null}
                {alert.type === "note" ? <Bell className="h-5 w-5 text-p-green" /> : null}
                {alert.type === "grade" ? <GraduationCap className="h-5 w-5 text-amber-500" /> : null}
                <p className="text-sm text-p-black/80">{alert.text}</p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
