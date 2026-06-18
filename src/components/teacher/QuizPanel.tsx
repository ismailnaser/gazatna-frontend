"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { TeacherClassQuizCard } from "@/components/teacher/TeacherClassQuizCard";
import { useAssignments } from "@/context/AssignmentsContext";
import { Plus } from "lucide-react";

export function QuizPanel({
  classId,
  teacherId,
}: {
  classId: string;
  teacherId: string;
}) {
  const { getQuizzesByClass, deleteQuiz, getQuizSubmissions } = useAssignments();
  const items = getQuizzesByClass(classId).filter((q) => q.teacherId === teacherId);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDeleteItem = items.find((quiz) => quiz.id === confirmDeleteId) ?? null;

  async function confirmDeleteQuiz() {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await deleteQuiz(confirmDeleteId);
      setConfirmDeleteId(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-p-black/60">
          أنشئ اختبارات بوقت بداية ومؤقت محدد لطلاب الفصل.
        </p>
        <Link href="/teacher/quizzes/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            اختبار جديد
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <Card className="border-dashed text-center text-p-black/50">
          لا توجد اختبارات بعد. أنشئ أول اختبار للطلاب.
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((quiz) => (
            <TeacherClassQuizCard
              key={quiz.id}
              quiz={quiz}
              submissionCount={getQuizSubmissions(quiz.id).length}
              isOpen={expanded === quiz.id}
              onToggle={() => setExpanded(expanded === quiz.id ? null : quiz.id)}
              onDelete={() => setConfirmDeleteId(quiz.id)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmDeleteItem)}
        title="تأكيد حذف الاختبار"
        description={
          <>
            هل أنت متأكد من حذف الاختبار{" "}
            <span className="font-semibold">{confirmDeleteItem?.title}</span>؟
          </>
        }
        loading={deleting}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={confirmDeleteQuiz}
      />
    </div>
  );
}
