"use client";

import { use, useCallback, useEffect, useState } from "react";
import { Card } from "@/components/atoms/Card";
import { TeacherQuizGradeEditor } from "@/components/teacher/TeacherQuizGradeEditor";
import { loadQuizGradingBundle } from "@/lib/teacherQuizGrading";
import type { QuizSubmission, TeacherQuizGradingItem } from "@/types";

export default function TeacherQuizSubmissionGradePage({
  params,
}: {
  params: Promise<{ id: string; submissionId: string }>;
}) {
  const { id, submissionId } = use(params);
  const [item, setItem] = useState<TeacherQuizGradingItem | null>(null);
  const [submission, setSubmission] = useState<QuizSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let bundle = await loadQuizGradingBundle(id);
      let sub =
        bundle?.submissions.find(
          (row) => row.id === submissionId && row.quizId === id
        ) ??
        bundle?.submissions.find((row) => row.id === submissionId) ??
        null;

      if (sub && bundle && sub.quizId !== bundle.quiz.id) {
        const aligned = await loadQuizGradingBundle(sub.quizId);
        if (aligned) {
          bundle = aligned;
          sub =
            aligned.submissions.find((row) => row.id === submissionId) ?? sub;
        }
      }

      setItem(bundle);
      setSubmission(sub);
    } catch {
      setItem(null);
      setSubmission(null);
    } finally {
      setLoading(false);
    }
  }, [id, submissionId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  if (!item?.quiz || !submission) {
    return <Card className="text-center text-neutral-500">التسليم غير متاح.</Card>;
  }

  return (
    <TeacherQuizGradeEditor
      quiz={item.quiz}
      submission={submission}
      overviewQuizId={item.overviewQuizId ?? item.quiz.id}
      onSaved={load}
    />
  );
}
