"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { FileUploadField } from "@/components/molecules/FileUploadField";
import { useAssignments } from "@/context/AssignmentsContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { quizTotalPoints } from "@/lib/quiz-scoring";
import {
  formatCountdown,
  getAttemptSeconds,
  getQuizPhase,
} from "@/lib/quiz-timing";
import { quizAttemptLabel } from "@/lib/quizAttempts";
import { QuizWindowBanner } from "@/components/parent/QuizWindowBanner";
import type { ParentChild, QuizQuestion } from "@/types";
import { ArrowRight, Clock, Send } from "lucide-react";

type AnswerState =
  | { kind: "index"; value: number }
  | { kind: "text"; value: string }
  | { kind: "essay"; value: string; file: File | null }
  | { kind: "matches"; value: Record<string, string> };

function initAnswers(questions: QuizQuestion[]): AnswerState[] {
  return questions.map((q) => {
    const type = q.questionType ?? "choice";
    if (type === "choice" || type === "true_false") return { kind: "index", value: -1 };
    if (type === "matching") return { kind: "matches", value: {} };
    if (type === "essay") return { kind: "essay", value: "", file: null };
    return { kind: "text", value: "" };
  });
}

function buildAnswersPayload(questions: QuizQuestion[], answers: AnswerState[]): unknown[] {
  return questions.map((q, i) => {
    const a = answers[i];
    const type = q.questionType ?? "choice";
    if (type === "choice" || type === "true_false") {
      return a.kind === "index" ? a.value : -1;
    }
    if (type === "matching") {
      return a.kind === "matches" ? a.value : {};
    }
    if (type === "essay") {
      return a.kind === "essay" ? a.value : "";
    }
    return a.kind === "text" ? a.value : "";
  });
}

function isAnswered(question: QuizQuestion, answer: AnswerState): boolean {
  const type = question.questionType ?? "choice";
  if (type === "choice" || type === "true_false") {
    return answer.kind === "index" && answer.value >= 0;
  }
  if (type === "matching") {
    const pairs = question.pairs ?? [];
    if (answer.kind !== "matches") return false;
    return pairs.length > 0 && pairs.every((p) => Boolean(answer.value[p.left]?.trim()));
  }
  if (type === "essay") {
    return (
      answer.kind === "essay" &&
      (answer.value.trim().length > 0 || answer.file != null)
    );
  }
  return answer.kind === "text" && answer.value.trim().length > 0;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function ParentQuizTakeClient({ quizId }: { quizId: string }) {
  const { user } = useAuth();
  const [child, setChild] = useState<ParentChild | undefined>();
  const { quizzes, getQuizSubmission, submitQuiz } = useAssignments();

  useEffect(() => {
    if (user) {
      api.getParentChild().then((c) => setChild(c as ParentChild)).catch(() => {});
    }
  }, [user]);

  const quiz = quizzes.find((q) => q.id === quizId);
  const submission = child ? getQuizSubmission(quizId, child.studentId) : undefined;

  const [started, setStarted] = useState(false);
  const [attemptStart, setAttemptStart] = useState<Date | null>(null);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [result, setResult] = useState<{
    score: number | null;
    maxScore: number;
    needsManual?: boolean;
  } | null>(null);
  const submittingRef = useRef(false);

  const matchingOptions = useMemo(() => {
    if (!quiz || !started) return {} as Record<string, string[]>;
    const map: Record<string, string[]> = {};
    for (const q of quiz.questions) {
      if (q.questionType === "matching") {
        if (q.options?.length) {
          map[q.id] = q.options;
        } else if (q.pairs?.length) {
          const rights = q.pairs.map((p) => p.right).filter(Boolean);
          if (rights.length) map[q.id] = shuffle(rights);
        }
      }
    }
    return map;
  }, [quiz, started]);

  const finishQuiz = useCallback(
    async (finalAnswers: AnswerState[]) => {
      if (!quiz || !child || finished || submittingRef.current) return;
      submittingRef.current = true;
      const payload = buildAnswersPayload(quiz.questions, finalAnswers);
      const essayFiles: Record<string, File | null> = {};
      quiz.questions.forEach((q, i) => {
        if (q.questionType === "essay") {
          const a = finalAnswers[i];
          essayFiles[q.id] = a?.kind === "essay" ? a.file : null;
        }
      });
      const timeSpent = attemptStart
        ? Math.floor((Date.now() - attemptStart.getTime()) / 1000)
        : 0;
      try {
        const item = await submitQuiz({
          quizId: quiz.id,
          studentId: child.studentId,
          answers: payload,
          score: null,
          maxScore: quiz.maxScore ?? quizTotalPoints(quiz.questions),
          timeSpentSeconds: timeSpent,
          essayFiles,
        });
        setResult({
          score: item.score,
          maxScore: item.maxScore,
          needsManual: item.needsManualGrading,
        });
        setFinished(true);
        setStarted(false);
        setRetrying(false);
      } finally {
        submittingRef.current = false;
      }
    },
    [quiz, child, finished, attemptStart, submitQuiz]
  );

  useEffect(() => {
    if (!started || !quiz || !attemptStart || finished) return;
    const tick = () => {
      const remaining = getAttemptSeconds(quiz, attemptStart);
      setSecondsLeft(remaining);
      if (remaining <= 0 && !submittingRef.current) {
        void finishQuiz(answers);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [started, quiz, attemptStart, finished, answers, finishQuiz]);

  if (!child) {
    return <p className="text-neutral-500">لم يتم ربط حسابك بملف طالب.</p>;
  }

  if (!quiz || quiz.classId !== child.classId) {
    return (
      <Card className="text-center">
        <p className="mb-4 text-neutral-600">الاختبار غير موجود أو غير متاح.</p>
        <Link href="/parent/quizzes" className="text-sm font-semibold text-brand-blue hover:underline">
          العودة للاختبارات
        </Link>
      </Card>
    );
  }

  const maxScore = quiz.maxScore ?? quizTotalPoints(quiz.questions);
  const canRetake = Boolean(quiz.canRetake);
  const attemptInfo = quizAttemptLabel(quiz);
  const phase = getQuizPhase(quiz);

  function beginRetake() {
    setRetrying(true);
    setFinished(false);
    setResult(null);
    setAnswers([]);
    setAttemptStart(null);
    setStarted(false);
  }

  if (!started) {
    if (phase !== "open") {
      return (
        <Card className="text-center">
          <h1 className="text-xl font-bold text-neutral-950">{quiz.title}</h1>
          <QuizWindowBanner quiz={quiz} className="mt-4 text-start" />
          <p className="mb-4 mt-4 text-neutral-600">
            {phase === "upcoming" ? "لم يحن وقت هذا الاختبار بعد." : "انتهى وقت هذا الاختبار."}
          </p>
          <Link href="/parent/homework">
            <Button variant="ghost">العودة</Button>
          </Link>
        </Card>
      );
    }

    if ((submission || finished) && !canRetake) {
      const gradesVisible = quiz.gradesVisible ?? submission?.gradesVisible;
      const needsManual =
        submission?.needsManualGrading ?? result?.needsManual ?? false;
      const fullyGraded = submission?.fullyGraded ?? (!needsManual && finished);
      const score = submission?.score ?? result?.score ?? null;
      const displayMax = submission?.maxScore ?? result?.maxScore ?? maxScore;
      const showScore = gradesVisible && fullyGraded && score != null;

      return (
        <Card className="text-center">
          <h2 className="text-xl font-bold text-neutral-950">تم إنهاء الاختبار</h2>
          {attemptInfo && (
            <p className="mt-2 text-xs text-neutral-500">{attemptInfo}</p>
          )}
          {showScore ? (
            <p className="mt-4 text-3xl font-extrabold text-brand-blue">
              {score} / {displayMax}
            </p>
          ) : needsManual ? (
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              تم تسليم إجاباتك بنجاح. سيتم تصحيح أسئلة المصطلح والمقالي من قبل المعلم، وستظهر
              علامتك النهائية في صفحة التقييمات بعد إكمال التصحيح.
            </p>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              تم تسليم إجاباتك بنجاح. ستظهر علامتك في صفحة التقييمات بعد أن يُظهرها المعلم.
            </p>
          )}
          <p className="mt-2 text-sm text-neutral-600">
            {showScore
              ? "تُحتسب أعلى علامة من بين محاولاتك"
              : "سيتم إبلاغ المعلم بالنتيجة"}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {quiz.reviewAllowed && submission && (
              <Link href={`/parent/quizzes/${quiz.id}/review`}>
                <Button>مراجعة الإجابات والأخطاء</Button>
              </Link>
            )}
            <Link href="/parent/homework">
              <Button variant="outline">
                <ArrowRight className="h-4 w-4" />
                العودة للمواد
              </Button>
            </Link>
          </div>
        </Card>
      );
    }

    if (retrying || (!submission && !finished)) {
      return (
        <div>
          <Link
            href="/parent/homework"
            className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
          >
            <ArrowRight className="h-4 w-4" />
            العودة
          </Link>
          <Card>
            <h1 className="text-xl font-bold text-neutral-950">{quiz.title}</h1>
            {quiz.description && (
              <p className="mt-2 text-sm text-neutral-700">{quiz.description}</p>
            )}
            <QuizWindowBanner quiz={quiz} className="mt-4" />
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              <li>• عدد الأسئلة: {quiz.questions.length}</li>
              <li>• العلامة الكاملة: {maxScore}</li>
              <li>• المدة لكل محاولة: {quiz.durationMinutes} دقيقة</li>
              <li>• عدد المحاولات: {quiz.maxAttempts ?? 1}</li>
              {attemptInfo && <li>• {attemptInfo}</li>}
              <li>• تُحتسب أعلى علامة من بين المحاولات</li>
              <li>• عند الضغط على «ابدأ» يبدأ المؤقت مباشرة</li>
            </ul>
            <Button
              className="mt-6"
              onClick={() => {
                const now = new Date();
                setRetrying(false);
                setAttemptStart(now);
                setAnswers(initAnswers(quiz.questions));
                setSecondsLeft(getAttemptSeconds(quiz, now));
                setStarted(true);
              }}
            >
              {submission || finished ? "ابدأ المحاولة" : "ابدأ الاختبار"}
            </Button>
          </Card>
        </div>
      );
    }

    if ((submission || finished) && canRetake) {
      const gradesVisible = quiz.gradesVisible ?? submission?.gradesVisible;
      const needsManual =
        submission?.needsManualGrading ?? result?.needsManual ?? false;
      const fullyGraded = submission?.fullyGraded ?? (!needsManual && finished);
      const score = submission?.score ?? result?.score ?? null;
      const displayMax = submission?.maxScore ?? result?.maxScore ?? maxScore;
      const showScore = gradesVisible && fullyGraded && score != null;

      return (
        <Card className="text-center">
          <h2 className="text-xl font-bold text-neutral-950">
            {finished ? "تم إنهاء المحاولة" : "لديك محاولات متبقية"}
          </h2>
          {attemptInfo && (
            <p className="mt-2 text-xs text-neutral-500">{attemptInfo}</p>
          )}
          {showScore && (
            <p className="mt-4 text-2xl font-extrabold text-brand-blue">
              أفضل علامة حالياً: {score} / {displayMax}
            </p>
          )}
          <p className="mt-3 text-sm text-neutral-600">
            تُحتسب أعلى علامة من بين جميع محاولاتك عند إغلاق الاختبار.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={beginRetake}>محاولة مجدداً</Button>
            {quiz.reviewAllowed && submission && (
              <Link href={`/parent/quizzes/${quiz.id}/review`}>
                <Button variant="outline">مراجعة الإجابات</Button>
              </Link>
            )}
            <Link href="/parent/homework">
              <Button variant="ghost">
                <ArrowRight className="h-4 w-4" />
                العودة للمواد
              </Button>
            </Link>
          </div>
        </Card>
      );
    }
  }

  const allAnswered = quiz.questions.every((q, i) => isAnswered(q, answers[i]));

  return (
    <div>
      <div
        className={`fixed inset-x-0 top-16 z-50 flex items-center justify-between gap-3 border-b border-neutral-200 bg-white/95 px-4 py-3 shadow-md backdrop-blur-sm sm:px-6 ${
          secondsLeft <= 60 ? "border-red-200 bg-red-50/95" : ""
        }`}
      >
        <h1 className="min-w-0 truncate text-base font-bold text-neutral-950">{quiz.title}</h1>
        <div
          className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-base font-bold tabular-nums ${
            secondsLeft <= 60 ? "bg-red-100 text-red-700" : "bg-brand-blue/10 text-brand-blue"
          }`}
        >
          <Clock className="h-5 w-5" />
          {formatCountdown(secondsLeft)}
        </div>
      </div>

      <div className="pt-15">
        {secondsLeft <= 60 && (
          <Alert variant="warning" className="mb-4">
            تبقّى أقل من دقيقة! سيتم إرسال الإجابات تلقائياً عند انتهاء الوقت.
          </Alert>
        )}

        <div className="space-y-4">
        {quiz.questions.map((q, qi) => (
          <Card key={q.id}>
            {q.questionType === "term" ? (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-neutral-900">السؤال {qi + 1}</p>
                  <Badge variant="info">مصطلح علمي</Badge>
                  <span className="text-xs text-neutral-500">{q.points} درجة</span>
                </div>
                <Input
                  label="اكتب المصطلح"
                  value={answers[qi]?.kind === "text" ? answers[qi].value : ""}
                  onChange={(e) =>
                    setAnswers((prev) =>
                      prev.map((a, i) => (i === qi ? { kind: "text", value: e.target.value } : a))
                    )
                  }
                  placeholder="اكتب المصطلح هنا..."
                  className="py-3 text-base font-medium"
                />
                {q.prompt.trim() && (
                  <div className="mt-4 rounded-xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-3.5">
                    <p className="mb-2 text-xs font-semibold text-brand-blue">التعريف</p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
                      {q.prompt}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="mb-1 font-semibold text-neutral-900">
                  {qi + 1}. {q.prompt}
                </p>
                <p className="mb-4 text-xs text-neutral-500">{q.points} درجة</p>

                {(q.questionType === "choice" || q.questionType === "true_false" || !q.questionType) && (
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <label
                        key={oi}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                          answers[qi]?.kind === "index" && answers[qi].value === oi
                            ? "border-brand-blue bg-brand-blue/5 font-medium text-brand-blue"
                            : "border-neutral-200 hover:border-brand-blue/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${qi}`}
                          checked={answers[qi]?.kind === "index" && answers[qi].value === oi}
                          onChange={() =>
                            setAnswers((prev) =>
                              prev.map((a, i) => (i === qi ? { kind: "index", value: oi } : a))
                            )
                          }
                          className="text-brand-blue"
                        />
                        {q.questionType === "true_false"
                          ? opt
                          : `${["أ", "ب", "ج", "د"][oi] ?? oi + 1}. ${opt}`}
                      </label>
                    ))}
                  </div>
                )}

                {q.questionType === "essay" && (
                  <>
                    <Textarea
                      label="إجابتك"
                      value={answers[qi]?.kind === "essay" ? answers[qi].value : ""}
                      onChange={(e) =>
                        setAnswers((prev) =>
                          prev.map((a, i) =>
                            i === qi && a.kind === "essay"
                              ? { ...a, value: e.target.value }
                              : a
                          )
                        )
                      }
                      placeholder="اكتب إجابتك بالتفصيل..."
                      className="min-h-[140px]"
                    />
                    <FileUploadField
                      className="mt-3"
                      label="إرفاق صورة أو ملف (اختياري إذا كتبت نصاً)"
                      preset="documents"
                      buttonText="اضغط لإرفاق صورة أو ملف"
                      selectedFileName={
                        answers[qi]?.kind === "essay" && answers[qi].file
                          ? answers[qi].file.name
                          : null
                      }
                      onChange={(files) => {
                        const file = files?.[0] ?? null;
                        setAnswers((prev) =>
                          prev.map((a, i) =>
                            i === qi && a.kind === "essay" ? { ...a, file } : a
                          )
                        );
                      }}
                    />
                  </>
                )}

                {q.questionType === "matching" && (
                  <div className="space-y-3">
                    {(q.pairs ?? []).map((pair) => (
                      <div
                        key={pair.left}
                        className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3"
                      >
                        <span className="min-w-[100px] font-medium text-neutral-900">{pair.left}</span>
                        <select
                          className="min-w-[160px] flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                          title="اختر الإجابة"
                          aria-label={`توصيل: ${pair.left}`}
                          value={
                            answers[qi]?.kind === "matches" ? (answers[qi].value[pair.left] ?? "") : ""
                          }
                          onChange={(e) =>
                            setAnswers((prev) =>
                              prev.map((a, i) => {
                                if (i !== qi || a.kind !== "matches") return a;
                                return {
                                  kind: "matches",
                                  value: { ...a.value, [pair.left]: e.target.value },
                                };
                              })
                            )
                          }
                        >
                          <option value="">اختر...</option>
                          {(matchingOptions[q.id] ?? []).map((right) => (
                            <option key={right} value={right}>
                              {right}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </Card>
        ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => finishQuiz(answers)} disabled={!allAnswered}>
            <Send className="h-4 w-4" />
            إرسال الإجابات
          </Button>
        </div>
      </div>
    </div>
  );
}
