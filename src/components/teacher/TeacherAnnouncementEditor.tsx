"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import {
  AnnouncementForm,
  buildAnnouncementPayload,
  type AnnouncementFormData,
} from "@/components/teacher/AnnouncementForm";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import { api } from "@/lib/api";
import { groupAnnouncementList, type AnnouncementGroup } from "@/lib/announcementGroups";
import type { SubjectAnnouncement } from "@/types";
import { ChevronRight } from "lucide-react";

type Props = {
  mode: "create" | "edit";
  announcementId?: string;
};

export function TeacherAnnouncementEditor({ mode, announcementId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { getTeacherClassesByUserId, currentTeacher, loading } = useSchool();
  const [items, setItems] = useState<SubjectAnnouncement[]>([]);
  const [loaded, setLoaded] = useState(mode === "create");
  const [error, setError] = useState("");

  const classes = user ? getTeacherClassesByUserId(user.id) : [];
  const teacher = currentTeacher;
  const teacherSubjects =
    teacher?.subjects ?? (teacher?.subject ? teacher.subject.split("، ") : []);

  useEffect(() => {
    if (mode !== "edit") return;
    api
      .getTeacherAnnouncements()
      .then((data) => {
        setItems(data as SubjectAnnouncement[]);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [mode]);

  const editingGroup = useMemo((): AnnouncementGroup | null => {
    if (mode !== "edit" || !announcementId || !items.length) return null;
    const match = items.find((a) => a.id === announcementId);
    if (!match) return null;
    const key = match.groupId ?? match.id;
    const related = items.filter((a) => (a.groupId ?? a.id) === key);
    return groupAnnouncementList(related)[0] ?? null;
  }, [mode, announcementId, items]);

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
    return <p className="text-neutral-500">الإعلان غير موجود.</p>;
  }

  async function handleCreate(data: AnnouncementFormData) {
    if (!data.classIds?.length) return;
    setError("");
    try {
      await api.createTeacherAnnouncement(buildAnnouncementPayload(data));
      router.push("/teacher/announcements?saved=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر نشر الإعلان");
    }
  }

  async function handleUpdate(data: AnnouncementFormData) {
    if (!editingGroup) return;
    setError("");
    try {
      await api.updateTeacherAnnouncement(
        editingGroup.id,
        buildAnnouncementPayload(data, { applyToGroup: true, syncClasses: Boolean(data.classIds?.length) })
      );
      router.push("/teacher/announcements?saved=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحديث الإعلان");
    }
  }

  return (
    <div>
      <Link
        href="/teacher/announcements"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
      >
        <ChevronRight className="h-4 w-4" />
        العودة للإعلانات
      </Link>

      <PageHeader
        title={mode === "create" ? "إعلان جديد" : "تعديل الإعلان"}
        description={
          mode === "create"
            ? "انشر إعلاناً يظهر للطلاب ضمن محتوى المادة"
            : editingGroup?.title
        }
        className="mb-6"
      />

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <AnnouncementForm
        embedded
        initial={editingGroup ?? undefined}
        classes={classes}
        subjects={teacherSubjects}
        showClassSelect
        defaultSelected={editingGroup?.targets.map((t) => t.classId)}
        onSubmit={mode === "create" ? handleCreate : handleUpdate}
        onCancel={() => router.push("/teacher/announcements")}
      />
    </div>
  );
}
