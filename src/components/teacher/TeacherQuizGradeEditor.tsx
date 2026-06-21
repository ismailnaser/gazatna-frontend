"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Textarea } from "@/components/atoms/Textarea";
import { ScoreFieldWithKeypad } from "@/components/teacher/ScoreFieldWithKeypad";
import { QUESTION_TYPE_OPTIONS } from "@/components/teacher/QuizForm";
import {
  formatQuizAnswer,
  isManualQuizQuestion,
  quizGradePath,
} from "@/lib/teacherQuizGrading";
import {
  attachmentLabel,
  isImageAttachment,
  resolveMediaUrl,
} from "@/lib/media";
import { api } from "@/lib/api";
import { validateFinalScore } from "@/lib/scoreInput";
import { quizTotalPoints } from "@/lib/quiz-scoring";
import type { Quiz, QuizSubmission } from "@/types";
import { ChevronRight, Download, FileText, Save, Sparkles, PenLine } from "lucide-react";

const typeLabel = Object.fromEntries(QUESTION_TYPE_OPTIONS.map((o) => [o.value, o.label]));

function attachmentForQuestion(
  submission: QuizSubmission,
  questionId: string
) {
  return submission.answerAttachments?.find((a) => a.questionId === questionId);
}

export function TeacherQuizGradeEditor({
  quiz,
  submission,
  overviewQuizId,
  onSaved,
}: {
  quiz: Quiz;
  submission: QuizSubmission;
  overviewQuizId: string;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const maxScore = quiz.maxScore ?? quizTotalPoints(quiz.questions);

  const manualQuestions = useMemo(
    () => quiz.questions.filter((q) => isManualQuizQuestion(q.questionType)),
    [quiz.questions]
  );

  const [manualScores, setManualScores] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const q of manualQuestions) {
      const val =
        submission.manualScores?.[q.id] ??
        submission.manualScores?.[String(q.id)];
      initial[q.id] = val != null ? String(val) : "";
    }
    return initial;
  });
  const [note, setNote] = useState(submission.teacherNote ?? "");
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const autoTotal = submission.autoScore ?? 0;

  const manualPreview = manualQuestions.reduce((sum, q) => {
    const raw = manualScores[q.id];
    if (raw === "") return sum;
    const n = Number(raw);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  const totalPreview = autoTotal + manualPreview;

  async function handleSave() {
    setError("");
    for (const q of manualQuestions) {
      const raw = manualScores[q.id];
      const validationError = validateFinalScore(raw ?? "", q.points ?? 1);
      if (validationError) {
        setError(
          raw === ""
            ? "يرجى إدخال درجة لكل سؤال مقالي أو مصطلح."
            : `درجة السؤال «${q.prompt.slice(0, 40)}»: ${validationError}`
        );
        return;
      }
    }

    setSaving(true);
    try {
      const payload: Record<string, number> = {};
      for (const q of manualQuestions) {
        payload[q.id] = Number(manualScores[q.id]);
      }
      await api.gradeTeacherQuizSubmission(submission.quizId, submission.id, {
        manualScores: payload,
        teacherNote: note,
      });
      onSaved?.();
      router.push(quizGradePath(overviewQuizId));
    } catch {
      setError("تعذر حفظ التقييم");
    } finally {
      setSaving(false);
    }
  }

  function handleConfirmQuestion(questionId: string): boolean {
    const question = manualQuestions.find((q) => q.id === questionId);
    if (!question) return true;

    const raw = manualScores[questionId];
    const validationError = validateFinalScore(raw ?? "", question.points ?? 1);
    if (validationError) {
      setError(
        raw === ""
          ? "يرجى إدخال درجة لهذا السؤال."
          : `درجة السؤال «${question.prompt.slice(0, 40)}»: ${validationError}`
      );
      return false;
    }

    setError("");
    return true;
  }

  return (
    <div>
      <Link
        href={quizGradePath(overviewQuizId)}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
      >
        <ChevronRight className="h-4 w-4" />
        العودة لقائمة التسليمات
      </Link>

      <div className="mb-4">
        <p className="text-sm text-p-black/50">{quiz.subject || "عام"}</p>
        <h1 className="text-xl font-bold text-p-black">{quiz.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="default">{submission.studentName ?? "طالب"}</Badge>
          {submission.className && <Badge variant="default">{submission.className}</Badge>}
          <span className="text-xs text-p-black/45">
            سُلّم: {new Date(submission.submittedAt).toLocaleString("ar-PS")}
          </span>
        </div>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <section className="mb-4 overflow-hidden rounded-2xl border border-brand-blue/20 bg-brand-blue/5 shadow-sm">
        <header className="border-b border-brand-blue/10 bg-white/60 px-3 py-2.5 sm:px-4">
          <p className="text-xs font-bold text-p-black/55">ملخص الدرجة</p>
        </header>
        <div className="space-y-3 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-3 shadow-sm">
            <div>
              <p className="text-[11px] text-p-black/45">المجموع الحالي</p>
              <p className="text-2xl font-bold text-brand-blue">
                {totalPreview}
                <span className="ms-1 text-base font-semibold text-p-black/45">/ {maxScore}</span>
              </p>
            </div>
            {manualQuestions.length === 0 && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                تصحيح تلقائي بالكامل
              </span>
            )}
          </div>

          {manualQuestions.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 shadow-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] text-p-black/45">تلقائي</p>
                  <p className="text-sm font-bold text-p-black">{autoTotal}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 shadow-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
                  <PenLine className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] text-p-black/45">يدوي</p>
                  <p className="text-sm font-bold text-p-black">{manualPreview}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="space-y-4">
        {quiz.questions.map((q, i) => {
          const answer = submission.answers[i];
          const manual = isManualQuizQuestion(q.questionType);
          const attachment = q.questionType === "essay" ? attachmentForQuestion(submission, q.id) : undefined;
          const attachmentUrl = attachment ? resolveMediaUrl(attachment.url) : "";
          const attachmentName = attachment
            ? attachmentLabel(attachmentUrl, attachment.name)
            : "";
          return (
            <Card key={q.id}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-brand-blue">السؤال {i + 1}</span>
                <Badge variant="default">{typeLabel[q.questionType] ?? q.questionType}</Badge>
                <Badge variant="default">{q.points} درجة</Badge>
                {!manual && <Badge variant="success">مُصحَّح تلقائياً</Badge>}
              </div>
              <p className="mb-3 font-medium text-p-black">{q.prompt}</p>
              <div className="mb-3 rounded-xl bg-neutral-50 p-3 text-sm text-p-black/80">
                <p className="mb-1 text-xs font-semibold text-neutral-500">إجابة الطالب</p>
                <p className="whitespace-pre-wrap">{formatQuizAnswer(q, answer)}</p>
              </div>
              {attachmentUrl && (
                <div className="mb-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                  <p className="mb-2 text-xs font-semibold text-neutral-500">مرفق الإجابة</p>
                  {isImageAttachment(attachmentUrl, attachmentName) ? (
                    <a href={attachmentUrl} target="_blank" rel="noreferrer" className="block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={attachmentUrl}
                        alt={attachmentName}
                        className="max-h-64 w-full rounded-lg border border-neutral-200 object-contain"
                      />
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-5 w-5 text-brand-blue" />
                      <span className="truncate">{attachmentName}</span>
                    </div>
                  )}
                  <a
                    href={attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    تحميل المرفق
                  </a>
                </div>
              )}
              {manual && q.questionType === "term" && q.correctText && (
                <p className="mb-3 text-xs text-neutral-500">
                  الإجابة المرجعية (للمعلم): <span className="font-medium">{q.correctText}</span>
                </p>
              )}
              {manual ? (
                <ScoreFieldWithKeypad
                  active={activeQuestionId === q.id}
                  onActivate={() => setActiveQuestionId(q.id)}
                  onDeactivate={() => setActiveQuestionId(null)}
                  value={manualScores[q.id] ?? ""}
                  onChange={(next) =>
                    setManualScores((prev) => ({ ...prev, [q.id]: next }))
                  }
                  maxScore={q.points ?? 1}
                  inputLabel={`درجة السؤال (من ${q.points})`}
                  keypadLabel={`درجة السؤال (${q.prompt.slice(0, 28)}${q.prompt.length > 28 ? "…" : ""})`}
                  onConfirm={() => handleConfirmQuestion(q.id)}
                  confirmLabel="تأكيد الدرجة"
                />
              ) : null}
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <Textarea
          label="ملاحظة للطالب (اختياري)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-[90px]"
        />
        {manualQuestions.length === 0 && (
          <>
            <Button onClick={handleSave} disabled={saving} className="mt-4">
              <Save className="h-4 w-4" />
              {saving ? "جاري الحفظ..." : "حفظ التقييم وإظهار العلامة للطالب"}
            </Button>
            <p className="mt-3 text-xs text-neutral-500">
              بعد اكتمال التصحيح ستظهر العلامة للطالب في صفحة التقييمات ومحتوى المادة.
            </p>
          </>
        )}
        {manualQuestions.length > 0 && (
          <>
            <Button onClick={handleSave} disabled={saving} className="mt-4">
              <Save className="h-4 w-4" />
              {saving ? "جاري الحفظ..." : "حفظ التقييم وإظهار العلامة للطالب"}
            </Button>
            <p className="mt-3 text-xs text-neutral-500">
              أدخل درجة كل سؤال، ثم احفظ التقييم الكامل من هنا.
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
