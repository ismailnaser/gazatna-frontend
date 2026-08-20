"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Card } from "@/components/atoms/Card";
import { TeacherSubmissionAlerts } from "@/components/teacher/TeacherSubmissionAlerts";
import { useTeacherAlerts } from "@/hooks/useTeacherAlerts";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { groupQuizList } from "@/lib/quizGroups";
import { homeworkGradePath } from "@/lib/teacherHomeworkGrading";
import { quizGradePath } from "@/lib/teacherQuizGrading";
import type { Quiz, TeacherAssessmentItem } from "@/types";
import { ChevronLeft, ClipboardList, PenLine } from "lucide-react";

function AssessmentRow({
  href,
  icon: Icon,
  typeLabel,
  title,
  subject,
  meta,
  pending,
}: {
  href: string;
  icon: typeof PenLine;
  typeLabel: string;
  title: string;
  subject?: string;
  meta: string;
  pending: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-3 transition-colors hover:border-brand-blue/20 hover:bg-brand-blue/5"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-50 text-brand-blue">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge variant="default">{typeLabel}</Badge>
            {subject ? <span className="text-xs text-p-black/50">{subject}</span> : null}
          </div>
          <p className="font-semibold text-p-black">{title}</p>
          <p className="mt-0.5 text-xs text-p-black/50">{meta}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {pending > 0 ? (
          <Badge variant="warning">{pending} بانتظار التقييم</Badge>
        ) : (
          <Badge variant="success">مُقيَّم</Badge>
        )}
        <ChevronLeft className="h-4 w-4 text-p-black/35" />
      </div>
    </Link>
  );
}

type PanelTab = "alerts" | "homework" | "quizzes";

export function TeacherAssessmentsGradingPanel() {
  const { alerts, refresh } = useTeacherAlerts({ enabled: true });
  const [panelTab, setPanelTab] = useState<PanelTab>("alerts");
  const [homeworkItems, setHomeworkItems] = useState<TeacherAssessmentItem[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingHw, setLoadingHw] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [hwLoaded, setHwLoaded] = useState(false);
  const [quizLoaded, setQuizLoaded] = useState(false);

  useEffect(() => {
    if (panelTab !== "homework" || hwLoaded) return;
    let cancelled = false;
    setLoadingHw(true);
    api
      .getTeacherAssessments()
      .then((hw) => {
        if (!cancelled) {
          setHomeworkItems(hw as TeacherAssessmentItem[]);
          setHwLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHomeworkItems([]);
          setHwLoaded(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingHw(false);
      });
    return () => {
      cancelled = true;
    };
  }, [panelTab, hwLoaded]);

  useEffect(() => {
    if (panelTab !== "quizzes" || quizLoaded) return;
    let cancelled = false;
    setLoadingQuiz(true);
    api
      .getTeacherQuizzes()
      .then((quiz) => {
        if (!cancelled) {
          setQuizzes(quiz as Quiz[]);
          setQuizLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQuizzes([]);
          setQuizLoaded(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingQuiz(false);
      });
    return () => {
      cancelled = true;
    };
  }, [panelTab, quizLoaded]);

  const homeworkRows = useMemo(
    () =>
      homeworkItems
        .filter((item) => item.submissions.length > 0)
        .map((item) => {
          const pending = item.submissions.filter((sub) => sub.score == null).length;
          const graded = item.submissions.length - pending;
          return {
            id: item.groupId,
            href: homeworkGradePath(item.homework.id),
            title: item.homework.title,
            subject: item.homework.subject,
            pending,
            meta: `${item.submissions.length} تسليم · ${graded} مُقيَّم`,
          };
        }),
    [homeworkItems]
  );

  const quizPendingById = useMemo(() => {
    const map = new Map<string, number>();
    for (const alert of alerts) {
      if (alert.type !== "quiz_submission" || !alert.needsGrading || !alert.quizId) continue;
      map.set(alert.quizId, (map.get(alert.quizId) ?? 0) + 1);
    }
    return map;
  }, [alerts]);

  const quizRows = useMemo(
    () =>
      groupQuizList(quizzes)
        .filter((group) => group.totalSubmissions > 0)
        .map((group) => {
          const pending = group.targets.reduce(
            (sum, target) => sum + (quizPendingById.get(target.id) ?? 0),
            0
          );
          return {
            id: group.groupId,
            href: quizGradePath(group.id),
            title: group.title,
            subject: group.subject,
            meta: `${group.totalSubmissions} مشارك · ${group.targets.length} فصل`,
            pending,
          };
        }),
    [quizzes, quizPendingById]
  );

  const tabs: Array<{ id: PanelTab; label: string }> = [
    { id: "alerts", label: "التنبيهات" },
    { id: "homework", label: "الواجبات" },
    { id: "quizzes", label: "الاختبارات" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-neutral-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setPanelTab(t.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-semibold transition-colors",
              panelTab === t.id
                ? "border-b-2 border-p-green text-p-green"
                : "text-p-black/50 hover:text-p-black"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {panelTab === "alerts" && (
        <TeacherSubmissionAlerts
          alerts={alerts}
          title="تسليمات تحتاج متابعة"
          onAlertOpen={refresh}
        />
      )}

      {panelTab === "homework" && (
        <>
          {loadingHw ? (
            <p className="text-neutral-500">جاري التحميل...</p>
          ) : homeworkRows.length === 0 ? (
            <Card className="text-center text-neutral-500">
              لا توجد واجبات للتقييم حالياً.
            </Card>
          ) : (
            <div className="space-y-2">
              {homeworkRows.map((row) => (
                <AssessmentRow
                  key={row.id}
                  href={row.href}
                  icon={PenLine}
                  typeLabel="واجب"
                  title={row.title}
                  subject={row.subject}
                  meta={row.meta}
                  pending={row.pending}
                />
              ))}
            </div>
          )}
        </>
      )}

      {panelTab === "quizzes" && (
        <>
          {loadingQuiz ? (
            <p className="text-neutral-500">جاري التحميل...</p>
          ) : quizRows.length === 0 ? (
            <Card className="text-center text-neutral-500">
              لا توجد اختبارات للتقييم حالياً.
            </Card>
          ) : (
            <div className="space-y-2">
              {quizRows.map((row) => (
                <AssessmentRow
                  key={row.id}
                  href={row.href}
                  icon={ClipboardList}
                  typeLabel="اختبار"
                  title={row.title}
                  subject={row.subject}
                  meta={row.meta}
                  pending={row.pending}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
