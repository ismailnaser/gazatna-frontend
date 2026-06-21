"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Card } from "@/components/atoms/Card";
import { TeacherSubmissionAlerts } from "@/components/teacher/TeacherSubmissionAlerts";
import { useTeacherAlerts } from "@/hooks/useTeacherAlerts";
import { api } from "@/lib/api";
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
      className="flex items-center justify-between gap-3 rounded-xl border border-neutral-100 bg-white px-3 py-3 transition-colors hover:border-brand-blue/20 hover:bg-brand-blue/5"
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

export function TeacherAssessmentsGradingPanel() {
  const { alerts, refresh } = useTeacherAlerts();
  const [homeworkItems, setHomeworkItems] = useState<TeacherAssessmentItem[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getTeacherAssessments(), api.getTeacherQuizzes()])
      .then(([hw, quiz]) => {
        setHomeworkItems(hw as TeacherAssessmentItem[]);
        setQuizzes(quiz as Quiz[]);
      })
      .catch(() => {
        setHomeworkItems([]);
        setQuizzes([]);
      })
      .finally(() => setLoading(false));
  }, []);

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

  const hasRows = homeworkRows.length > 0 || quizRows.length > 0;

  return (
    <div className="space-y-4">
      <TeacherSubmissionAlerts
        alerts={alerts}
        title="تسليمات تحتاج متابعة"
        onAlertOpen={refresh}
      />

      {loading ? (
        <p className="text-neutral-500">جاري التحميل...</p>
      ) : !hasRows ? (
        <Card className="text-center text-neutral-500">
          لا توجد تسليمات للتقييم حالياً. ستظهر هنا عندما يسلّم الطلاب واجباتهم أو يكملون الاختبارات.
        </Card>
      ) : (
        <div className="space-y-6">
          {homeworkRows.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-p-black">واجبات للتقييم</h2>
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
            </section>
          ) : null}

          {quizRows.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-p-black">اختبارات للتقييم</h2>
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
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
