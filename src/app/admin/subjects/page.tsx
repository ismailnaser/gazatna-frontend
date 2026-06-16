"use client";

import { useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useSchool } from "@/context/SchoolContext";
import { Plus, Trash2 } from "lucide-react";

export default function AdminSubjectsPage() {
  const { subjects, addSubject, removeSubject } = useSchool();
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [confirmDeleteSubjectId, setConfirmDeleteSubjectId] = useState<string | null>(null);
  const [deletingSubject, setDeletingSubject] = useState(false);

  const confirmDeleteSubject = subjects.find((s) => s.id === confirmDeleteSubjectId) ?? null;

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setAdding(true);
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const name = String(form.get("name") ?? "").trim();

    if (!name) {
      setError("اسم المادة مطلوب");
      setAdding(false);
      return;
    }

    try {
      await addSubject(name);
      formEl.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إضافة المادة");
    } finally {
      setAdding(false);
    }
  }

  async function confirmDeleteSubjectAction() {
    if (!confirmDeleteSubjectId) return;
    setDeletingSubject(true);
    setError("");
    try {
      await removeSubject(confirmDeleteSubjectId);
      setConfirmDeleteSubjectId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حذف المادة");
    } finally {
      setDeletingSubject(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="إدارة المواد الدراسية"
        description="أضف المواد الدراسية ثم اسندها للمعلمين عند إضافتهم"
        className="mb-6"
      />

      <Card className="mb-6">
        <h3 className="mb-4 font-bold text-[#1a1a1a]">إضافة مادة جديدة</h3>

        {error && !confirmDeleteSubjectId && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleAdd} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Input label="اسم المادة" name="name" required className="flex-1" />
          <Button type="submit" disabled={adding}>
            <Plus className="h-4 w-4" />
            {adding ? "جاري الإضافة..." : "إضافة مادة"}
          </Button>
        </form>
      </Card>

      <Card>
        <h3 className="mb-4 font-bold text-[#1a1a1a]">المواد المسجّلة</h3>

        {subjects.length === 0 ? (
          <p className="rounded-xl bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500">
            لا توجد مواد بعد. أضف مادة من النموذج أعلاه.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm"
              >
                <span>{subject.name}</span>
                <Badge variant="default">{subject.teacherCount} معلم</Badge>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setConfirmDeleteSubjectId(subject.id);
                  }}
                  className="text-neutral-400 hover:text-p-red"
                  aria-label={`حذف ${subject.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(confirmDeleteSubject)}
        title="تأكيد حذف المادة"
        description={
          <>
            هل أنت متأكد من حذف مادة{" "}
            <span className="font-semibold">{confirmDeleteSubject?.name}</span>؟ لا يمكن التراجع عن
            هذا الإجراء.
          </>
        }
        loading={deletingSubject}
        error={confirmDeleteSubject ? error : undefined}
        onCancel={() => {
          setError("");
          setConfirmDeleteSubjectId(null);
        }}
        onConfirm={confirmDeleteSubjectAction}
      />
    </div>
  );
}
