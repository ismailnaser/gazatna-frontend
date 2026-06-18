"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { QuizSubmissionsGradeList } from "@/components/teacher/QuizSubmissionsGradeList";
import { CollapsibleChipList } from "@/components/molecules/CollapsibleChipList";
import { api } from "@/lib/api";
import { quizTotalPoints } from "@/lib/quiz-scoring";
import { loadQuizGradingBundle } from "@/lib/teacherQuizGrading";
import type { TeacherQuizGradingItem } from "@/types";
import { ChevronRight, Pencil } from "lucide-react";

export default function TeacherQuizGradePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [item, setItem] = useState<TeacherQuizGradingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const bundle = await loadQuizGradingBundle(id);
      setItem(bundle);
      if (!bundle) setError("الاختبار غير متاح");
    } catch {
      setError("تعذر تحميل بيانات التقييم");
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  const { quiz, submissions, targets } = item ?? {
    quiz: null,
    submissions: [],
    targets: [],
  };

  const submissionsByClass = useMemo(
    () =>
      targets.map((target) => ({
        ...target,
        submissions: submissions.filter((sub) => sub.quizId === target.id),
      })),
    [targets, submissions]
  );

  const gradedCount = submissions.filter((sub) => sub.fullyGraded).length;
  const pendingCount = submissions.filter((sub) => sub.needsManualGrading).length;
  const maxScore = quiz ? (quiz.maxScore ?? quizTotalPoints(quiz.questions)) : 0;

  async function toggleGradesVisible() {
    if (!item || !quiz) return;
    const payload: Record<string, unknown> = { gradesVisible: !quiz.gradesVisible };
    if (item.targets.length > 1) payload.applyToGroup = true;
    await api.updateTeacherQuiz(quiz.id, payload);
    await load();
    setSuccess(quiz.gradesVisible ? "تم إخفاء العلامة عن الطلاب" : "تم إظهار العلامة للطلاب");
    setTimeout(() => setSuccess(""), 2500);
  }

  async function toggleReviewAllowed() {
    if (!item || !quiz) return;
    const payload: Record<string, unknown> = { reviewAllowed: !quiz.reviewAllowed };
    if (item.targets.length > 1) payload.applyToGroup = true;
    await api.updateTeacherQuiz(quiz.id, payload);
    await load();
    setSuccess(quiz.reviewAllowed ? "تم إيقاف مراجعة الاختبار" : "تم تفعيل مراجعة الاختبار للطلاب");
    setTimeout(() => setSuccess(""), 2500);
  }

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  if (!item || !quiz) {
    return (
      <Card className="text-center text-neutral-500">
        {error || "الاختبار غير متاح."}
      </Card>
    );
  }

  return (
    <div>
      <Link
        href="/teacher/quizzes"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
      >
        <ChevronRight className="h-4 w-4" />
        الاختبارات
      </Link>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      )}

      <Card className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-p-black">{quiz.title}</h1>
              <Badge variant="default">{quiz.subject || "عام"}</Badge>
              <Badge variant="info">
                {gradedCount}/{submissions.length} مُكتمل
              </Badge>
              {pendingCount > 0 && (
                <Badge variant="warning">{pendingCount} بانتظار تصحيح يدوي</Badge>
              )}
            </div>
            <CollapsibleChipList items={targets.map((t) => t.className)} className="mb-2" />
            <p className="text-sm text-p-black/60">
              العلامة الكاملة: <span className="font-semibold">{maxScore}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="text-xs" onClick={toggleGradesVisible}>
              {quiz.gradesVisible ? "إخفاء العلامة عن الطالب" : "إظهار العلامة للطالب"}
            </Button>
            <Button variant="outline" className="text-xs" onClick={toggleReviewAllowed}>
              {quiz.reviewAllowed ? "إيقاف مراجعة الإجابات" : "تفعيل مراجعة الإجابات"}
            </Button>
            <Link href={`/teacher/quizzes/edit/${quiz.id}`}>
              <Button variant="outline" className="text-xs">
                <Pencil className="h-3.5 w-3.5" />
                تعديل الاختبار
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {submissions.length === 0 ? (
        <Card className="text-center text-neutral-500">لا توجد تسليمات بعد.</Card>
      ) : (
        <div className="space-y-5">
          {submissionsByClass.map((section) =>
            section.submissions.length === 0 ? null : (
              <div key={section.id}>
                <p className="mb-2 text-sm font-bold text-p-black">{section.className}</p>
                <QuizSubmissionsGradeList
                  submissions={section.submissions}
                  maxScore={maxScore}
                />
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
