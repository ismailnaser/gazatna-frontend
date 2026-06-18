"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { HomeworkForm, type HomeworkFormData } from "@/components/teacher/HomeworkForm";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useAssignments } from "@/context/AssignmentsContext";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import { groupHomeworkList, type HomeworkGroup } from "@/lib/homeworkGroups";
import { ChevronRight } from "lucide-react";

type Props = {
  mode: "create" | "edit";
  homeworkId?: string;
};

export function TeacherHomeworkEditor({ mode, homeworkId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { getTeacherClassesByUserId, currentTeacher, loading } = useSchool();
  const { getHomeworkByTeacher, addHomework, updateHomework } = useAssignments();

  const [error, setError] = useState("");

  const classes = user ? getTeacherClassesByUserId(user.id) : [];
  const teacher = currentTeacher;
  const teacherSubjects =
    teacher?.subjects ?? (teacher?.subject ? teacher.subject.split("، ") : []);
  const classIds = classes.map((c) => c.id);
  const items = teacher ? getHomeworkByTeacher(teacher.id, classIds) : [];

  const editingGroup = useMemo((): HomeworkGroup | null => {
    if (mode !== "edit" || !homeworkId) return null;
    const match = items.find((h) => h.id === homeworkId);
    if (!match) return null;
    const key = match.groupId ?? match.id;
    const related = items.filter((h) => (h.groupId ?? h.id) === key);
    return groupHomeworkList(related)[0] ?? null;
  }, [mode, homeworkId, items]);

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
    return <p className="text-neutral-500">الواجب غير موجود.</p>;
  }

  async function handleCreate(data: HomeworkFormData) {
    if (!data.classIds?.length) return;
    setError("");
    try {
      await addHomework(data);
      router.push("/teacher/homework?saved=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إنشاء الواجب");
    }
  }

  async function handleUpdate(data: HomeworkFormData) {
    if (!editingGroup) return;
    setError("");
    try {
      await updateHomework(editingGroup.id, data, { applyToGroup: true });
      router.push("/teacher/homework?saved=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحديث الواجب");
    }
  }

  return (
    <div>
      <Link
        href="/teacher/homework"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
      >
        <ChevronRight className="h-4 w-4" />
        العودة للواجبات
      </Link>

      <PageHeader
        title={mode === "create" ? "واجب جديد" : "تعديل الواجب"}
        description={
          mode === "create"
            ? "أنشئ واجباً واحداً ووزّعه على عدة فصول"
            : editingGroup?.title
        }
        className="mb-6"
      />

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <HomeworkForm
        embedded
        initial={editingGroup ?? undefined}
        classes={classes}
        subjects={teacherSubjects}
        showClassSelect
        defaultSelected={editingGroup?.targets.map((t) => t.classId)}
        onSubmit={mode === "create" ? handleCreate : handleUpdate}
        onCancel={() => router.push("/teacher/homework")}
      />
    </div>
  );
}
