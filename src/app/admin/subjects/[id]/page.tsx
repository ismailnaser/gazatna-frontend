"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { HubCard, HubGrid } from "@/components/dashboard/HubCard";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { useSchool } from "@/context/SchoolContext";
import { teacherCountLabel } from "@/lib/adminSubjects";
import { GraduationCap, Pencil, Trash2, Users } from "lucide-react";

export default function AdminSubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? "");
  const { subjects, teachers, loading, removeSubject } = useSchool();
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const subject = subjects.find((item) => item.id === id);
  const teacherCount = useMemo(
    () => teachers.filter((teacher) => teacher.subjectIds?.includes(id)).length,
    [teachers, id]
  );

  async function confirmDeleteAction() {
    if (!subject) return;
    setDeleting(true);
    setError("");
    try {
      await removeSubject(subject.id);
      router.push("/admin/subjects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حذف المادة");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <WorkspacePage
      title={subject?.name ?? "المادة"}
      description="تعديل المادة وإسناد الفصول والمعلمين."
      breadcrumbs={[{ label: "المواد", href: "/admin/subjects" }, { label: subject?.name ?? "..." }]}
      loading={loading && !subject}
      loadingMessage="جاري تحميل المادة..."
      actions={
        <>
          <Button variant="outline" href={`/admin/subjects/${id}/edit`}>
            <Pencil className="h-4 w-4" />
            تعديل الاسم
          </Button>
          <Button variant="outline" className="text-p-red" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" />
            حذف
          </Button>
        </>
      }
    >
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}

      {!subject && !loading ? (
        <Alert variant="error">المادة غير موجودة.</Alert>
      ) : (
        <HubGrid>
          <HubCard
            href={`/admin/subjects/${id}/classes`}
            icon={GraduationCap}
            title="إسناد للفصول"
            description="اختر الشعب التي تُدرَّس فيها المادة."
            meta={`${subject?.classIds?.length ?? 0} شعبة مسندة`}
          />
          <HubCard
            href={`/admin/subjects/${id}/teachers`}
            icon={Users}
            title="إسناد للمعلمين"
            description="عيّن معلماً لكل شعبة مسندة."
            meta={teacherCountLabel(teacherCount)}
          />
        </HubGrid>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="تأكيد حذف المادة"
        description={subject ? `هل أنت متأكد من حذف مادة ${subject.name}؟` : null}
        loading={deleting}
        error={error || undefined}
        onCancel={() => {
          setError("");
          setConfirmDelete(false);
        }}
        onConfirm={confirmDeleteAction}
      />
    </WorkspacePage>
  );
}
