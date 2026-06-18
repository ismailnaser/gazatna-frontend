"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import {
  buildMaterialFormData,
  MaterialForm,
  type MaterialFormData,
} from "@/components/teacher/MaterialForm";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import { api } from "@/lib/api";
import { groupMaterialList, type MaterialGroup } from "@/lib/materialGroups";
import type { SubjectMaterial } from "@/types";
import { ChevronRight } from "lucide-react";

type Props = {
  mode: "create" | "edit";
  materialId?: string;
};

export function TeacherMaterialEditor({ mode, materialId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { getTeacherClassesByUserId, currentTeacher, loading } = useSchool();
  const [items, setItems] = useState<SubjectMaterial[]>([]);
  const [loaded, setLoaded] = useState(mode === "create");
  const [error, setError] = useState("");

  const classes = user ? getTeacherClassesByUserId(user.id) : [];
  const teacher = currentTeacher;
  const teacherSubjects =
    teacher?.subjects ?? (teacher?.subject ? teacher.subject.split("، ") : []);

  useEffect(() => {
    if (mode !== "edit") return;
    api
      .getTeacherMaterials()
      .then((data) => {
        setItems(data as SubjectMaterial[]);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [mode]);

  const editingGroup = useMemo((): MaterialGroup | null => {
    if (mode !== "edit" || !materialId || !items.length) return null;
    const match = items.find((m) => m.id === materialId);
    if (!match) return null;
    const key = match.groupId ?? match.id;
    const related = items.filter((m) => (m.groupId ?? m.id) === key);
    return groupMaterialList(related)[0] ?? null;
  }, [mode, materialId, items]);

  if (loading || (mode === "edit" && !loaded)) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  if (!teacher) {
    return <p className="text-neutral-500">لم يتم ربط حسابك بملف معلم.</p>;
  }

  if (classes.length === 0) {
    return <p className="text-neutral-500">لا توجد فصول مسندة إليك.</p>;
  }

  if (mode === "edit" && !editingGroup) {
    return <p className="text-neutral-500">المرفق غير موجود.</p>;
  }

  async function handleCreate(data: MaterialFormData) {
    if (!data.classIds?.length) return;
    setError("");
    try {
      await api.createTeacherMaterial(buildMaterialFormData(data));
      router.push("/teacher/materials?saved=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر نشر المرفق");
    }
  }

  async function handleUpdate(data: MaterialFormData) {
    if (!editingGroup) return;
    setError("");
    try {
      await api.updateTeacherMaterial(
        editingGroup.id,
        buildMaterialFormData(data, {
          applyToGroup: true,
          syncClasses: Boolean(data.classIds?.length),
        })
      );
      router.push("/teacher/materials?saved=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحديث المرفق");
    }
  }

  return (
    <div>
      <Link
        href="/teacher/materials"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
      >
        <ChevronRight className="h-4 w-4" />
        العودة للمرفقات
      </Link>

      <PageHeader
        title={mode === "create" ? "مرفق جديد" : "تعديل المرفق"}
        description={
          mode === "create"
            ? "أضف كتاب المادة أو سلايدات أو مصادر للطلاب"
            : editingGroup?.title
        }
        className="mb-6"
      />

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <MaterialForm
        embedded
        initial={editingGroup ?? undefined}
        classes={classes}
        subjects={teacherSubjects}
        showClassSelect
        defaultSelected={editingGroup?.targets.map((t) => t.classId)}
        onSubmit={mode === "create" ? handleCreate : handleUpdate}
        onCancel={() => router.push("/teacher/materials")}
      />
    </div>
  );
}
