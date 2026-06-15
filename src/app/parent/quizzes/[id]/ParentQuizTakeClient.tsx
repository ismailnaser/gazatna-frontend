"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { useAssignments } from "@/context/AssignmentsContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  calculateQuizScore,
  formatCountdown,
  getAttemptSeconds,
  getQuizPhase,
} from "@/lib/quiz-timing";
import type { ParentChild } from "@/types";
import { ArrowRight, Clock, Send } from "lucide-react";

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
  const [answers, setAnswers] = useState<number[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<{ score: number; maxScore: number } | null>(null);

  const finishQuiz = useCallback(
    async (finalAnswers: number[]) => {
      if (!quiz || !child || finished) return;
      const { score, maxScore } = calculateQuizScore(quiz.questions, finalAnswers);
      const timeSpent = attemptStart
        ? Math.floor((Date.now() - attemptStart.getTime()) / 1000)
        : 0;
      await submitQuiz({
        quizId: quiz.id,
        studentId: child.studentId,
        answers: finalAnswers,
        score,
        maxScore,
        timeSpentSeconds: timeSpent,
      });
      setResult({ score, maxScore });
      setFinished(true);
    },
    [quiz, child, finished, attemptStart, submitQuiz]
  );

  useEffect(() => {
    if (!started || !quiz || !attemptStart || finished) return;
    const tick = () => {
      const remaining = getAttemptSeconds(quiz, attemptStart);
      setSecondsLeft(remaining);
      if (remaining <= 0) finishQuiz(answers);
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

  if (submission || finished) {
    const score = submission?.score ?? result?.score ?? 0;
    const maxScore = submission?.maxScore ?? result?.maxScore ?? quiz.questions.length;
    return (
      <Card className="text-center">
        <h2 className="text-xl font-bold text-neutral-950">تم إنهاء الاختبار</h2>
        <p className="mt-4 text-3xl font-extrabold text-brand-blue">
          {score} / {maxScore}
        </p>
        <p className="mt-2 text-sm text-neutral-600">سيتم إبلاغ المعلم بالنتيجة</p>
        <Link href="/parent/quizzes" className="mt-6 inline-block">
          <Button variant="outline">
            <ArrowRight className="h-4 w-4" />
            العودة للاختبارات
          </Button>
        </Link>
      </Card>
    );
  }

  const phase = getQuizPhase(quiz);
  if (phase !== "open") {
    return (
      <Card className="text-center">
        <p className="mb-4 text-neutral-600">
          {phase === "upcoming" ? "لم يحن وقت هذا الاختبار بعد." : "انتهى وقت هذا الاختبار."}
        </p>
        <Link href="/parent/quizzes">
          <Button variant="ghost">العودة</Button>
        </Link>
      </Card>
    );
  }

  if (!started) {
    return (
      <div>
        <Link
          href="/parent/quizzes"
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
          <ul className="mt-4 space-y-2 text-sm text-neutral-600">
            <li>• عدد الأسئلة: {quiz.questions.length}</li>
            <li>• المدة: {quiz.durationMinutes} دقيقة</li>
            <li>• عند الضغط على «ابدأ» يبدأ المؤقت مباشرة</li>
          </ul>
          <Button
            className="mt-6"
            onClick={() => {
              const now = new Date();
              setAttemptStart(now);
              setAnswers(quiz.questions.map(() => -1));
              setSecondsLeft(getAttemptSeconds(quiz, now));
              setStarted(true);
            }}
          >
            ابدأ الاختبار
          </Button>
        </Card>
      </div>
    );
  }

  const allAnswered = answers.every((a) => a >= 0);

  return (
    <div>
      <div className="sticky top-0 z-10 mb-4 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
        <h1 className="text-base font-bold text-neutral-950">{quiz.title}</h1>
        <div
          className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-bold ${
            secondsLeft <= 60 ? "bg-red-50 text-red-600" : "bg-brand-blue/10 text-brand-blue"
          }`}
        >
          <Clock className="h-4 w-4" />
          {formatCountdown(secondsLeft)}
        </div>
      </div>

      {secondsLeft <= 60 && (
        <Alert variant="warning" className="mb-4">
          تبقّى أقل من دقيقة! سيتم إرسال الإجابات تلقائياً عند انتهاء الوقت.
        </Alert>
      )}

      <div className="space-y-4">
        {quiz.questions.map((q, qi) => (
          <Card key={q.id}>
            <p className="mb-4 font-semibold text-neutral-900">
              {qi + 1}. {q.prompt}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <label
                  key={oi}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                    answers[qi] === oi
                      ? "border-brand-blue bg-brand-blue/5 font-medium text-brand-blue"
                      : "border-neutral-200 hover:border-brand-blue/30"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${qi}`}
                    checked={answers[qi] === oi}
                    onChange={() =>
                      setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))
                    }
                    className="text-brand-blue"
                  />
                  {["أ", "ب", "ج", "د"][oi]}. {opt}
                </label>
              ))}
            </div>
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
  );
}
