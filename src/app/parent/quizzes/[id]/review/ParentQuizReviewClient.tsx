"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Card } from "@/components/atoms/Card";
import { QUESTION_TYPE_OPTIONS } from "@/components/teacher/QuizForm";
import { api } from "@/lib/api";
import {
  attachmentLabel,
  isImageAttachment,
  resolveMediaUrl,
} from "@/lib/media";
import {
  formatCorrectAnswer,
  formatStudentAnswer,
  getQuestionReviewStatus,
  quizTotalPoints,
  type QuestionReviewStatus,
} from "@/lib/quiz-scoring";
import type { Quiz, QuizSubmission } from "@/types";
import { CheckCircle2, ChevronRight, Download, FileText, XCircle } from "lucide-react";

const typeLabel = Object.fromEntries(QUESTION_TYPE_OPTIONS.map((o) => [o.value, o.label]));

const statusMeta: Record<
  QuestionReviewStatus,
  { label: string; variant: "success" | "danger" | "warning" | "default" | "info" }
> = {
  correct: { label: "إجابة صحيحة", variant: "success" },
  incorrect: { label: "إجابة خاطئة", variant: "danger" },
  partial: { label: "درجة جزئية", variant: "warning" },
  pending: { label: "بانتظار التصحيح", variant: "warning" },
  manual: { label: "يُقيَّم من المعلم", variant: "info" },
};

function attachmentForQuestion(submission: QuizSubmission, questionId: string) {
  return submission.answerAttachments?.find((a) => a.questionId === questionId);
}

export function ParentQuizReviewClient({ quizId }: { quizId: string }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [submission, setSubmission] = useState<QuizSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getParentQuizReview(quizId)
      .then((data) => {
        setQuiz(data.quiz as Quiz);
        setSubmission(data.submission as QuizSubmission);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "";
        if (message.includes("مراجعة")) {
          setError("لم يفعّل المعلم مراجعة هذا الاختبار بعد.");
        } else if (message.includes("تسليم") || message.includes("غير متاح")) {
          setError("الاختبار غير متاح أو لم يتم تسليمه.");
        } else {
          setError("تعذر تحميل مراجعة الاختبار.");
        }
      })
      .finally(() => setLoading(false));
  }, [quizId]);

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  if (error || !quiz || !submission) {
    return (
      <Card className="text-center">
        <p className="mb-4 text-neutral-600">{error || "تعذر عرض المراجعة."}</p>
        <Link href="/parent/homework" className="text-sm font-semibold text-brand-blue hover:underline">
          العودة للمواد
        </Link>
      </Card>
    );
  }

  const maxScore = quiz.maxScore ?? quizTotalPoints(quiz.questions);
  const showScore =
    (quiz.gradesVisible ?? submission.gradesVisible) &&
    submission.fullyGraded &&
    submission.score != null;

  const correctCount = quiz.questions.filter((q, i) => {
    const manual =
      submission.manualScores?.[q.id] ?? submission.manualScores?.[String(q.id)];
    return getQuestionReviewStatus(q, submission.answers[i], manual) === "correct";
  }).length;

  return (
    <div>
      <Link
        href="/parent/homework"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
      >
        <ChevronRight className="h-4 w-4" />
        العودة للمواد
      </Link>

      <Card className="mb-6">
        <h1 className="text-xl font-bold text-neutral-950">{quiz.title}</h1>
        {quiz.description && (
          <p className="mt-2 text-sm text-neutral-600">{quiz.description}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {showScore && (
            <Badge variant="info">
              العلامة: {submission.score}/{maxScore}
            </Badge>
          )}
          <Badge variant="success">
            <CheckCircle2 className="me-1 inline h-3 w-3" />
            {correctCount}/{quiz.questions.length} صحيح
          </Badge>
        </div>
        {submission.teacherNote && (
          <Alert variant="info" className="mt-4">
            ملاحظة المعلم: {submission.teacherNote}
          </Alert>
        )}
      </Card>

      <div className="space-y-4">
        {quiz.questions.map((q, qi) => {
          const answer = submission.answers[qi];
          const manualScore =
            submission.manualScores?.[q.id] ?? submission.manualScores?.[String(q.id)];
          const status = getQuestionReviewStatus(q, answer, manualScore);
          const meta = statusMeta[status];
          const attachment = attachmentForQuestion(submission, q.id);
          const attachmentUrl = resolveMediaUrl(attachment?.url);

          return (
            <Card
              key={q.id}
              className={
                status === "correct"
                  ? "border-emerald-100 bg-emerald-50/30"
                  : status === "incorrect"
                    ? "border-red-100 bg-red-50/30"
                    : undefined
              }
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-brand-blue">السؤال {qi + 1}</span>
                  <Badge variant="default" className="ms-2">
                    {typeLabel[q.questionType ?? "choice"]}
                  </Badge>
                  <span className="ms-2 text-xs text-neutral-500">({q.points} درجة)</span>
                </div>
                <Badge variant={meta.variant}>
                  {status === "correct" ? (
                    <CheckCircle2 className="me-1 inline h-3 w-3" />
                  ) : status === "incorrect" ? (
                    <XCircle className="me-1 inline h-3 w-3" />
                  ) : null}
                  {meta.label}
                </Badge>
              </div>

              <p className="mb-4 whitespace-pre-wrap font-medium text-neutral-900">{q.prompt}</p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-neutral-200 bg-white p-3">
                  <p className="mb-1 text-xs font-semibold text-neutral-500">إجابتك</p>
                  <p className="text-sm text-neutral-800">{formatStudentAnswer(q, answer)}</p>
                  {attachmentUrl && (
                    <div className="mt-2">
                      {isImageAttachment(attachment?.url, attachment?.name) ? (
                        <a href={attachmentUrl} target="_blank" rel="noopener noreferrer">
                          <img
                            src={attachmentUrl}
                            alt={attachmentLabel(attachment?.url, attachment?.name)}
                            className="max-h-40 rounded-lg border border-neutral-200 object-contain"
                          />
                        </a>
                      ) : (
                        <a
                          href={attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-brand-blue hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          {attachmentLabel(attachment?.url, attachment?.name)}
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {(q.questionType ?? "choice") !== "essay" && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                    <p className="mb-1 text-xs font-semibold text-emerald-700">الإجابة الصحيحة</p>
                    <p className="text-sm text-emerald-900">{formatCorrectAnswer(q)}</p>
                  </div>
                )}
              </div>

              {manualScore != null && (
                <p className="mt-3 text-xs text-neutral-500">
                  درجة هذا السؤال: {manualScore}/{q.points}
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
