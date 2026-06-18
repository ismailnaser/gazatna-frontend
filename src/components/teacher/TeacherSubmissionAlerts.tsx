"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { api } from "@/lib/api";
import {
  countUnreadTeacherAlerts,
  isTeacherAlertOpened,
  sortTeacherAlerts,
  teacherAlertHref,
  teacherAlertKey,
} from "@/lib/teacherAlerts";
import { cn } from "@/lib/utils";
import type { TeacherAlert } from "@/types";
import { Bell, ChevronDown, ClipboardList, PenLine } from "lucide-react";

function formatAlertDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return {
    date: parsed.toLocaleDateString("ar-PS", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    time: parsed.toLocaleTimeString("ar-PS", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function alertTitle(alert: TeacherAlert) {
  if (alert.type === "quiz_submission") {
    return alert.quizTitle ?? "اختبار";
  }
  return alert.homeworkTitle ?? "واجب";
}

function alertTypeLabel(alert: TeacherAlert) {
  return alert.type === "quiz_submission" ? "اختبار" : "واجب";
}

function statusBadge(alert: TeacherAlert, opened: boolean) {
  if (opened) return <Badge variant="default">مفتوح</Badge>;
  if (alert.needsGrading) return <Badge variant="warning">يحتاج تقييم</Badge>;
  return <Badge variant="success">جديد</Badge>;
}

function TeacherAlertItem({
  alert,
  opened,
  onOpen,
}: {
  alert: TeacherAlert;
  opened: boolean;
  onOpen: () => void;
}) {
  const isQuiz = alert.type === "quiz_submission";
  const Icon = isQuiz ? ClipboardList : PenLine;
  const when = formatAlertDate(alert.submittedAt);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex w-full overflow-hidden rounded-xl border text-start transition-colors",
        opened
          ? "border-neutral-200 bg-neutral-50 hover:bg-neutral-100"
          : alert.needsGrading
            ? "border-amber-200 bg-white hover:bg-amber-50/50"
            : "border-neutral-100 bg-white hover:bg-neutral-50"
      )}
    >
      <div
        className={cn(
          "w-1 shrink-0",
          isQuiz ? "bg-brand-blue" : "bg-brand-orange",
          alert.needsGrading && !opened && "bg-amber-500"
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1 p-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                isQuiz ? "bg-brand-blue/10 text-brand-blue" : "bg-brand-orange/10 text-brand-orange"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold text-p-black/55">{alertTypeLabel(alert)}</span>
          </div>
          {statusBadge(alert, opened)}
        </div>

        <p className="truncate text-sm font-bold text-p-black">{alert.studentName}</p>
        <p className="mt-0.5 text-sm text-p-black/75">{alertTitle(alert)}</p>
        <p className="mt-1 text-xs text-p-black/45">{alert.className}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-p-black/40">
          <span>{when.date}</span>
          <span aria-hidden>•</span>
          <span>{when.time}</span>
        </div>
      </div>
    </button>
  );
}

export function TeacherSubmissionAlerts({
  alerts,
  limit = 6,
  title = "الإشعارات",
  viewAllHref,
  onAlertOpen,
  alwaysShow = false,
}: {
  alerts: TeacherAlert[];
  limit?: number;
  title?: string;
  viewAllHref?: string;
  onAlertOpen?: () => void;
  alwaysShow?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [openedKeys, setOpenedKeys] = useState<Set<string>>(new Set());

  if (alerts.length === 0 && !alwaysShow) return null;

  const sorted = sortTeacherAlerts(alerts);
  const unreadCount = countUnreadTeacherAlerts(
    sorted.map((alert) => ({
      ...alert,
      opened: isTeacherAlertOpened(alert) || openedKeys.has(teacherAlertKey(alert)),
    }))
  );
  const visible = sorted.slice(0, limit);
  const pendingCount = sorted.filter((a) => a.needsGrading).length;

  function isOpened(alert: TeacherAlert) {
    return isTeacherAlertOpened(alert) || openedKeys.has(teacherAlertKey(alert));
  }

  async function handleAlertClick(alert: TeacherAlert) {
    const key = teacherAlertKey(alert);
    setOpenedKeys((prev) => new Set(prev).add(key));
    try {
      await api.markTeacherAlertRead(key);
    } catch {
      /* keep local opened state */
    }
    onAlertOpen?.();
    router.push(teacherAlertHref(alert));
  }

  return (
    <section className="mb-4 overflow-hidden rounded-2xl border border-amber-200/80 bg-amber-50/30 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-start transition-colors hover:bg-amber-50/80 sm:px-4"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Bell className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-p-black">{title}</p>
            <p className="text-xs text-p-black/50">
              {alerts.length === 0
                ? "لا توجد تسليمات جديدة"
                : pendingCount > 0
                  ? `${pendingCount} بانتظار التقييم`
                  : `${alerts.length} تسليم`}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {unreadCount > 0 && (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
          <ChevronDown
            className={cn("h-5 w-5 text-p-black/40 transition-transform", open && "rotate-180")}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-amber-200/60 bg-white/70 px-3 py-3 sm:px-4">
          {visible.length === 0 ? (
            <p className="py-4 text-center text-sm text-neutral-500">لا توجد إشعارات حالياً.</p>
          ) : (
            <div className="space-y-2">
              {visible.map((alert) => (
                <TeacherAlertItem
                  key={`${alert.type}-${alert.id}`}
                  alert={alert}
                  opened={isOpened(alert)}
                  onOpen={() => handleAlertClick(alert)}
                />
              ))}
            </div>
          )}

          {viewAllHref && alerts.length > limit && (
            <button
              type="button"
              onClick={() => router.push(viewAllHref)}
              className="mt-3 w-full text-center text-sm font-semibold text-brand-blue hover:underline"
            >
              عرض كل الإشعارات ({alerts.length})
            </button>
          )}
        </div>
      )}
    </section>
  );
}
