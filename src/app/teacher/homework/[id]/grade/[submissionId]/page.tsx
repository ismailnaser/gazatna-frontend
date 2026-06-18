"use client";

import { use, useCallback, useEffect, useState } from "react";
import { Card } from "@/components/atoms/Card";
import { TeacherHomeworkGradeEditor } from "@/components/teacher/TeacherHomeworkGradeEditor";
import { loadHomeworkGradingBundle } from "@/lib/teacherHomeworkGrading";
import type { HomeworkSubmission, TeacherAssessmentItem } from "@/types";

export default function TeacherHomeworkSubmissionGradePage({
  params,
}: {
  params: Promise<{ id: string; submissionId: string }>;
}) {
  const { id, submissionId } = use(params);
  const [item, setItem] = useState<TeacherAssessmentItem | null>(null);
  const [submission, setSubmission] = useState<HomeworkSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const bundle = await loadHomeworkGradingBundle(id);
      setItem(bundle);
      const sub =
        bundle?.submissions.find(
          (row) => row.id === submissionId && row.homeworkId === id
        ) ??
        bundle?.submissions.find((row) => row.id === submissionId) ??
        null;
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

  if (!item?.homework || !submission) {
    return <Card className="text-center text-neutral-500">التسليم غير متاح.</Card>;
  }

  return (
    <TeacherHomeworkGradeEditor
      homework={item.homework}
      submission={submission}
      overviewHomeworkId={item.homework.id}
      onSaved={load}
    />
  );
}
