"use client";

import { useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { QuizForm } from "@/components/teacher/QuizForm";
import { useAssignments } from "@/context/AssignmentsContext";
import { formatDateTime } from "@/lib/quiz-timing";
import type { Quiz, QuizQuestion } from "@/types";
import { Calendar, Clock, HelpCircle, Pencil, Plus, Trash2, Users } from "lucide-react";

function QuizStatusBadge({ status }: { status: Quiz["status"] }) {
  return (
    <Badge variant={status === "active" ? "info" : "default"}>
      {status === "active" ? "نشط" : "مغلق"}
    </Badge>
  );
}

export function QuizPanel({
  classId,
  teacherId,
}: {
  classId: string;
  teacherId: string;
}) {
  const { getQuizzesByClass, addQuiz, updateQuiz, deleteQuiz, getQuizSubmissions } =
    useAssignments();
  const items = getQuizzesByClass(classId);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Quiz | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function handleCreate(data: {
    title: string;
    description: string;
    dueDate: string;
    startAt: string;
    durationMinutes: number;
    status: Quiz["status"];
    questions: QuizQuestion[];
  }) {
    await addQuiz({ ...data, classId, teacherId });
    setShowForm(false);
  }

  async function handleUpdate(data: {
    title: string;
    description: string;
    dueDate: string;
    startAt: string;
    durationMinutes: number;
    status: Quiz["status"];
    questions: QuizQuestion[];
  }) {
    if (!editing) return;
    await updateQuiz(editing.id, data);
    setEditing(null);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-600">
          أنشئ اختبارات بوقت بداية ومؤقت محدد لطلاب الفصل.
        </p>
        {!showForm && !editing && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            اختبار جديد
          </Button>
        )}
      </div>

      {showForm && <QuizForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}

      {editing && (
        <QuizForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
      )}

      {items.length === 0 ? (
        <Card className="text-center text-neutral-500">
          لا توجد اختبارات بعد. أنشئ أول اختبار للطلاب.
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((quiz) => {
            const submissions = getQuizSubmissions(quiz.id);
            return (
              <Card key={quiz.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-neutral-950">{quiz.title}</h3>
                      <QuizStatusBadge status={quiz.status} />
                      <Badge variant="default">{quiz.questions.length} أسئلة</Badge>
                      <Badge variant="info">
                        <Users className="me-1 inline h-3 w-3" />
                        {submissions.length} مشارك
                      </Badge>
                    </div>
                    {quiz.description && (
                      <p className="text-sm text-neutral-700">{quiz.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        يبدأ: {formatDateTime(quiz.startAt)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {quiz.durationMinutes} دقيقة
                      </span>
                      <span>أُنشئ: {quiz.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      className="px-3 py-2"
                      onClick={() => setExpanded(expanded === quiz.id ? null : quiz.id)}
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
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
                      onClick={() => {
                        if (confirm("هل تريد حذف هذا الاختبار؟")) deleteQuiz(quiz.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {expanded === quiz.id && (
                  <div className="mt-4 space-y-3 border-t border-neutral-100 pt-4">
                    {quiz.questions.map((q, i) => (
                      <div key={q.id} className="rounded-xl bg-neutral-50 p-3">
                        <p className="text-sm font-semibold text-neutral-900">
                          {i + 1}. {q.prompt}
                        </p>
                        <ul className="mt-2 space-y-1">
                          {q.options.map((opt, oi) => (
                            <li
                              key={oi}
                              className={`text-sm ${
                                oi === q.correctIndex
                                  ? "font-semibold text-brand-blue"
                                  : "text-neutral-600"
                              }`}
                            >
                              {["أ", "ب", "ج", "د"][oi]}. {opt}
                              {oi === q.correctIndex && " ✓"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
