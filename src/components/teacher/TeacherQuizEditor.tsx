"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { QuizForm, type QuizFormData } from "@/components/teacher/QuizForm";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useAssignments } from "@/context/AssignmentsContext";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import { groupQuizList, type QuizGroup } from "@/lib/quizGroups";
import { ChevronRight } from "lucide-react";

type Props = {
  mode: "create" | "edit";
  quizId?: string;
};

export function TeacherQuizEditor({ mode, quizId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { getTeacherClassesByUserId, currentTeacher, loading } = useSchool();
  const { getQuizzesByTeacher, addQuiz, updateQuiz } = useAssignments();

  const [error, setError] = useState("");

  const classes = user ? getTeacherClassesByUserId(user.id) : [];
  const teacher = currentTeacher;
  const teacherSubjects =
    teacher?.subjects ?? (teacher?.subject ? teacher.subject.split("، ") : []);
  const classIds = classes.map((c) => c.id);
  const items = teacher ? getQuizzesByTeacher(teacher.id, classIds) : [];

  const editingGroup = useMemo((): QuizGroup | null => {
    if (mode !== "edit" || !quizId) return null;
    const match = items.find((q) => q.id === quizId);
    if (!match) return null;
    const key = match.groupId ?? match.id;
    const related = items.filter((q) => (q.groupId ?? q.id) === key);
    return groupQuizList(related)[0] ?? null;
  }, [mode, quizId, items]);

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  if (!teacher) {
    return <p className="text-neutral-500">لم يتم ربط حسابك بملف معلم.</p>;
  }

  if (classes.length === 0) {
    return <p className="text-neutral-500">لا توجد فصول مسندة إليك.</p>;
  }

  if (mode === "edit" && !editingGroup) {
    return <p className="text-neutral-500">الاختبار غير موجود.</p>;
  }

  async function handleCreate(data: QuizFormData) {
    if (!data.classIds?.length) return;
    setError("");
    try {
      await addQuiz(data);
      router.push("/teacher/quizzes?saved=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إنشاء الاختبار");
    }
  }

  async function handleUpdate(data: QuizFormData) {
    if (!editingGroup) return;
    setError("");
    try {
      await updateQuiz(editingGroup.id, data, { applyToGroup: true });
      router.push("/teacher/quizzes?saved=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحديث الاختبار");
    }
  }

  return (
    <div>
      <Link
        href="/teacher/quizzes"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
      >
        <ChevronRight className="h-4 w-4" />
        العودة للاختبارات
      </Link>

      <PageHeader
        title={mode === "create" ? "اختبار جديد" : "تعديل الاختبار"}
        description={
          mode === "create"
            ? "أنشئ اختباراً واحداً ووزّعه على عدة فصول مع أسئلة متنوعة"
            : editingGroup?.title
        }
        className="mb-6"
      />

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <QuizForm
        embedded
        initial={editingGroup ?? undefined}
        classes={classes}
        subjects={teacherSubjects}
        showClassSelect
        defaultSelected={editingGroup?.targets.map((t) => t.classId)}
        onSubmit={mode === "create" ? handleCreate : handleUpdate}
        onCancel={() => router.push("/teacher/quizzes")}
      />
    </div>
  );
}
