"use client";

import { useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { HomeworkForm } from "@/components/teacher/HomeworkForm";
import { useAssignments } from "@/context/AssignmentsContext";
import type { Homework } from "@/types";
import { Calendar, Pencil, Plus, Trash2, Users } from "lucide-react";

function HomeworkStatusBadge({ status }: { status: Homework["status"] }) {
  return (
    <Badge variant={status === "active" ? "success" : "default"}>
      {status === "active" ? "نشط" : "مغلق"}
    </Badge>
  );
}

export function HomeworkPanel({
  classId,
  teacherId,
}: {
  classId: string;
  teacherId: string;
}) {
  const { getHomeworkByClass, addHomework, updateHomework, deleteHomework, getHomeworkSubmissions } =
    useAssignments();
  const items = getHomeworkByClass(classId);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Homework | null>(null);

  async function handleCreate(data: {
    title: string;
    description: string;
    dueDate: string;
    status: Homework["status"];
  }) {
    await addHomework({ ...data, classId, teacherId });
    setShowForm(false);
  }

  async function handleUpdate(data: {
    title: string;
    description: string;
    dueDate: string;
    status: Homework["status"];
  }) {
    if (!editing) return;
    await updateHomework(editing.id, data);
    setEditing(null);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-600">
          أنشئ واجبات منزلية لطلاب هذا الفصل وحدّد موعد التسليم.
        </p>
        {!showForm && !editing && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            واجب جديد
          </Button>
        )}
      </div>

      {showForm && (
        <HomeworkForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {editing && (
        <HomeworkForm
          initial={editing}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      )}

      {items.length === 0 ? (
        <Card className="text-center text-neutral-500">
          لا توجد واجبات بعد. أنشئ أول واجب للطلاب.
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((hw) => {
            const submissions = getHomeworkSubmissions(hw.id);
            return (
              <Card key={hw.id} className="relative">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-neutral-950">{hw.title}</h3>
                      <HomeworkStatusBadge status={hw.status} />
                      <Badge variant="info">
                        <Users className="me-1 inline h-3 w-3" />
                        {submissions.length} تسليم
                      </Badge>
                    </div>
                    <p className="text-sm leading-relaxed text-neutral-700">{hw.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        التسليم: {hw.dueDate}
                      </span>
                      <span>أُنشئ: {hw.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      className="px-3 py-2"
                      onClick={() => {
                        setShowForm(false);
                        setEditing(hw);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="danger"
                      className="px-3 py-2"
                      onClick={() => {
                        if (confirm("هل تريد حذف هذا الواجب؟")) deleteHomework(hw.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
