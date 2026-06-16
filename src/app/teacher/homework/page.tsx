"use client";

import { useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { HomeworkForm } from "@/components/teacher/HomeworkForm";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useAssignments } from "@/context/AssignmentsContext";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import type { Homework } from "@/types";
import { Calendar, Pencil, Plus, Trash2, Users } from "lucide-react";

export default function TeacherHomeworkPage() {
  const { user } = useAuth();
  const { getTeacherClassesByUserId, currentTeacher, loading } = useSchool();
  const {
    getHomeworkByTeacher,
    addHomework,
    updateHomework,
    deleteHomework,
    getHomeworkSubmissions,
  } = useAssignments();

  const classes = user ? getTeacherClassesByUserId(user.id) : [];
  const teacher = currentTeacher;
  const classIds = classes.map((c) => c.id);
  const items = teacher ? getHomeworkByTeacher(teacher.id, classIds) : [];

  const [showForm, setShowForm] = useState(true);
  const [editing, setEditing] = useState<Homework | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDeleteItem = items.find((hw) => hw.id === confirmDeleteId) ?? null;

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
    status: Homework["status"];
  }) {
    if (!data.classIds?.length) return;
    for (const classId of data.classIds) {
      addHomework({
        classId,
        teacherId: teacher!.id,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        status: data.status,
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
    status: Homework["status"];
  }) {
    if (!editing) return;
    updateHomework(editing.id, data);
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="إضافة واجب"
          description="أنشئ واجبات منزلية لأي من فصولك المسندة"
        />
        {!showForm && !editing && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            واجب جديد
          </Button>
        )}
      </div>

      {saved && (
        <Alert variant="success" className="mb-4">
          تم حفظ الواجب بنجاح
        </Alert>
      )}

      {classes.length === 0 ? (
        <Card className="text-center text-neutral-500">لا توجد فصول مسندة إليك.</Card>
      ) : (
        <>
          {showForm && (
            <HomeworkForm
              classes={classes}
              showClassSelect
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
            />
          )}

          {editing && (
            <HomeworkForm
              initial={editing}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
            />
          )}

          <h2 className="mb-4 text-lg font-bold text-neutral-900">جميع الواجبات</h2>
          {items.length === 0 ? (
            <Card className="text-center text-neutral-500">لا توجد واجبات بعد.</Card>
          ) : (
            <div className="space-y-4">
              {items.map((hw) => (
                <Card key={hw.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-neutral-950">{hw.title}</h3>
                        <Badge variant={hw.status === "active" ? "success" : "default"}>
                          {hw.status === "active" ? "نشط" : "مغلق"}
                        </Badge>
                        <Badge variant="default">{classNameMap[hw.classId]}</Badge>
                        <Badge variant="info">
                          <Users className="me-1 inline h-3 w-3" />
                          {getHomeworkSubmissions(hw.id).length} تسليم
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-700">{hw.description}</p>
                      <p className="mt-2 flex items-center gap-1 text-xs text-neutral-500">
                        <Calendar className="h-3.5 w-3.5" />
                        التسليم: {hw.dueDate}
                      </p>
                    </div>
                    <div className="flex gap-1">
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
                        onClick={() => setConfirmDeleteId(hw.id)}
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
        title="تأكيد حذف الواجب"
        description={
          <>
            هل أنت متأكد من حذف الواجب{" "}
            <span className="font-semibold">{confirmDeleteItem?.title}</span>؟
          </>
        }
        loading={deleting}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={async () => {
          if (!confirmDeleteId) return;
          setDeleting(true);
          try {
            await deleteHomework(confirmDeleteId);
            setConfirmDeleteId(null);
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}
