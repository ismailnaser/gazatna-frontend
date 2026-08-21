"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import {
  SubjectSectionTeacherAssigner,
  buildSubjectSectionDrafts,
  sectionDraftsToPayload,
  type SubjectSectionDraft,
} from "@/components/admin/SubjectSectionTeacherAssigner";
import { useSchool } from "@/context/SchoolContext";
import { teacherCountLabel } from "@/lib/adminSubjects";
import { Save } from "lucide-react";

export default function AdminSubjectTeachersPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? "");
  const { subjects, teachers, classes, grades, loading, syncSubjectSections } = useSchool();
  const subject = subjects.find((item) => item.id === id);
  const [sectionDrafts, setSectionDrafts] = useState<Record<string, SubjectSectionDraft>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const assignedClasses = useMemo(() => {
    const ids = new Set(subject?.classIds ?? []);
    return classes.filter((schoolClass) => ids.has(schoolClass.id));
  }, [subject, classes]);

  useEffect(() => {
    if (!subject || assignedClasses.length === 0) return;
    setSectionDrafts(
      buildSubjectSectionDrafts(assignedClasses, subject.classIds ?? [], teachers, subject.name)
    );
  }, [subject, assignedClasses, teachers]);

  function updateSectionDraft(classId: string, patch: Partial<SubjectSectionDraft>) {
    setSectionDrafts((prev) => ({
      ...prev,
      [classId]: { ...(prev[classId] ?? { enabled: true, teacherId: "" }), ...patch },
    }));
  }

  async function save() {
    if (!subject) return;
    const payload = sectionDraftsToPayload(sectionDrafts);
    if (payload.length === 0) {
      setError("لا توجد شعب مسندة لهذه المادة.");
      return;
    }
    if (payload.some((row) => !row.teacherId)) {
      setError("اختر معلماً لكل شعبة.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await syncSubjectSections(subject.id, payload);
      router.push(`/admin/subjects/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حفظ إسناد المعلمين");
    } finally {
      setSaving(false);
    }
  }

  return (
    <WorkspacePage
      title="إسناد للمعلمين"
      description={subject ? `${subject.name} · ${teacherCountLabel(teachers.filter((t) => t.subjectIds?.includes(id)).length)}` : undefined}
      breadcrumbs={[
        { label: "المواد", href: "/admin/subjects" },
        { label: subject?.name ?? "...", href: `/admin/subjects/${id}` },
        { label: "المعلمون" },
      ]}
      loading={loading && !subject}
      loadingMessage="جاري تحميل الإسناد..."
    >
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      <Card>
        {assignedClasses.length === 0 ? (
          <p className="text-sm text-p-black/65">
            لم تُسند المادة لأي فصل بعد.{" "}
            <Link href={`/admin/subjects/${id}/classes`} className="font-semibold text-brand-blue hover:underline">
              اسندها للفصول أولاً
            </Link>
          </p>
        ) : teachers.length === 0 ? (
          <p className="text-sm text-p-black/65">
            لا يوجد معلمون.{" "}
            <Link href="/admin/teachers" className="font-semibold text-brand-blue hover:underline">
              أضف معلماً
            </Link>
          </p>
        ) : (
          <>
            <SubjectSectionTeacherAssigner
              classes={assignedClasses}
              grades={grades}
              teachers={teachers}
              sectionDrafts={sectionDrafts}
              onChange={updateSectionDraft}
              teachersOnly
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" href={`/admin/subjects/${id}`}>
                إلغاء
              </Button>
              <Button onClick={save} disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? "جاري الحفظ..." : "حفظ المعلمين"}
              </Button>
            </div>
          </>
        )}
      </Card>
    </WorkspacePage>
  );
}
