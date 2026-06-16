"use client";

import { useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { QuizForm } from "@/components/teacher/QuizForm";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useAssignments } from "@/context/AssignmentsContext";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import { formatDateTime } from "@/lib/quiz-timing";
import type { Quiz, QuizQuestion } from "@/types";
import { Calendar, Clock, Pencil, Plus, Trash2, Users } from "lucide-react";

export default function TeacherQuizzesPage() {
  const { user } = useAuth();
  const { getTeacherClassesByUserId, currentTeacher, loading } = useSchool();
  const { getQuizzesByTeacher, addQuiz, updateQuiz, deleteQuiz, getQuizSubmissions } =
    useAssignments();

  const classes = user ? getTeacherClassesByUserId(user.id) : [];
  const teacher = currentTeacher;
  const classIds = classes.map((c) => c.id);
  const items = teacher ? getQuizzesByTeacher(teacher.id, classIds) : [];

  const [showForm, setShowForm] = useState(true);
  const [editing, setEditing] = useState<Quiz | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDeleteItem = items.find((quiz) => quiz.id === confirmDeleteId) ?? null;

  const classNameMap = useMemo(
    () => Object.fromEntries(classes.map((c) => [c.id, c.name])),
    [classes]
  );

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  if (!teacher) {
    return <p className="text-neutral-500">لم يتم ربط حسابك بملف معلم.</p>;
  }

  function handleCreate(data: {
    classIds?: string[];
    title: string;
    description: string;
    dueDate: string;
    startAt: string;
    durationMinutes: number;
    status: Quiz["status"];
    questions: QuizQuestion[];
  }) {
    if (!data.classIds?.length) return;
    for (const classId of data.classIds) {
      addQuiz({
        classId,
        teacherId: teacher!.id,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        startAt: data.startAt,
        durationMinutes: data.durationMinutes,
        status: data.status,
        questions: data.questions,
      });
    }
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleUpdate(data: {
    title: string;
    description: string;
    dueDate: string;
    startAt: string;
    durationMinutes: number;
    status: Quiz["status"];
    questions: QuizQuestion[];
  }) {
    if (!editing) return;
    updateQuiz(editing.id, data);
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="إضافة اختبار"
          description="أنشئ اختبارات بوقت بداية ومؤقت لأي من فصولك"
        />
        {!showForm && !editing && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            اختبار جديد
          </Button>
        )}
      </div>

      {saved && (
        <Alert variant="success" className="mb-4">
          تم حفظ الاختبار بنجاح
        </Alert>
      )}

      {classes.length === 0 ? (
        <Card className="text-center text-neutral-500">لا توجد فصول مسندة إليك.</Card>
      ) : (
        <>
          {showForm && (
            <QuizForm
              classes={classes}
              showClassSelect
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
            />
          )}

          {editing && (
            <QuizForm
              initial={editing}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
            />
          )}

          <h2 className="mb-4 text-lg font-bold text-neutral-900">جميع الاختبارات</h2>
          {items.length === 0 ? (
            <Card className="text-center text-neutral-500">لا توجد اختبارات بعد.</Card>
          ) : (
            <div className="space-y-4">
              {items.map((quiz) => (
                <Card key={quiz.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-neutral-950">{quiz.title}</h3>
                        <Badge variant={quiz.status === "active" ? "info" : "default"}>
                          {quiz.status === "active" ? "نشط" : "مغلق"}
                        </Badge>
                        <Badge variant="default">{classNameMap[quiz.classId]}</Badge>
                        <Badge variant="info">
                          <Users className="me-1 inline h-3 w-3" />
                          {getQuizSubmissions(quiz.id).length} مشارك
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-700">{quiz.description}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-neutral-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          يبدأ: {formatDateTime(quiz.startAt)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {quiz.durationMinutes} دقيقة
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        className="px-3 py-2"
                        onClick={() => {
                          setShowForm(false);
                          setEditing(quiz);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="danger"
                        className="px-3 py-2"
                        onClick={() => setConfirmDeleteId(quiz.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
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
        onConfirm={async () => {
          if (!confirmDeleteId) return;
          setDeleting(true);
          try {
            await deleteQuiz(confirmDeleteId);
            setConfirmDeleteId(null);
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}
