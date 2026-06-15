"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useAssignments } from "@/context/AssignmentsContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { formatDateTime, getQuizPhase } from "@/lib/quiz-timing";
import type { ParentChild } from "@/types";
import { Calendar, CheckCircle2, Clock, Play } from "lucide-react";

const phaseLabels = {
  upcoming: { label: "لم يبدأ بعد", variant: "warning" as const },
  open: { label: "متاح الآن", variant: "success" as const },
  closed: { label: "منتهي", variant: "default" as const },
};

export default function ParentQuizzesPage() {
  const { user } = useAuth();
  const [child, setChild] = useState<ParentChild | undefined>();
  const { getQuizzesByClass, getQuizSubmission } = useAssignments();

  useEffect(() => {
    if (user) {
      api.getParentChild().then((c) => setChild(c as ParentChild)).catch(() => {});
    }
  }, [user]);

  if (!child) {
    return <p className="text-neutral-500">لم يتم ربط حسابك بملف طالب.</p>;
  }

  const items = getQuizzesByClass(child.classId);

  return (
    <div>
      <PageHeader
        title="الاختبارات"
        description={`اختبارات ${child.name} — دخول ضمن الوقت المحدد`}
      />

      {items.length === 0 ? (
        <Card className="text-center text-neutral-500">لا توجد اختبارات حالياً.</Card>
      ) : (
        <div className="space-y-4">
          {items.map((quiz) => {
            const submission = getQuizSubmission(quiz.id, child.studentId);
            const phase = submission ? "closed" : getQuizPhase(quiz);
            const meta = phaseLabels[phase];

            return (
              <Card key={quiz.id}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-neutral-950">{quiz.title}</h3>
                  {submission ? (
                    <Badge variant="success">
                      <CheckCircle2 className="me-1 inline h-3 w-3" />
                      {submission.score}/{submission.maxScore}
                    </Badge>
                  ) : (
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  )}
                  <Badge variant="default">{quiz.questions.length} أسئلة</Badge>
                </div>
                {quiz.description && (
                  <p className="text-sm text-neutral-700">{quiz.description}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-neutral-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    يبدأ: {formatDateTime(quiz.startAt)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {quiz.durationMinutes} دقيقة
                  </span>
                </div>

                <div className="mt-4">
                  {submission ? (
                    <p className="text-sm text-neutral-600">
                      النتيجة: {submission.score} من {submission.maxScore}
                    </p>
                  ) : phase === "open" ? (
                    <Link href={`/parent/quizzes/${quiz.id}`}>
                      <Button>
                        <Play className="h-4 w-4" />
                        ابدأ الاختبار
                      </Button>
                    </Link>
                  ) : phase === "upcoming" ? (
                    <p className="text-sm text-amber-700">
                      يفتح في {formatDateTime(quiz.startAt)}
                    </p>
                  ) : (
                    <p className="text-sm text-neutral-500">انتهى وقت هذا الاختبار</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
