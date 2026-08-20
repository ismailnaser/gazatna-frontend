"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/atoms/Button";
import { AdminStudentFormPanel } from "@/components/admin/AdminStudentFormPanel";
import { PageBusy, PageHeader } from "@/components/molecules/PageHeader";
import { useSchool } from "@/context/SchoolContext";
import { mapAdminStudent } from "@/lib/adminStudents";
import { api } from "@/lib/api";
import { validateStudentNationalId } from "@/lib/nationalId";
import type { AdminStudent } from "@/types";
import { ArrowRight } from "lucide-react";

export default function AdminStudentEditPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const router = useRouter();
  const { classes, grades } = useSchool();
  const [student, setStudent] = useState<AdminStudent | null>(null);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [docRows, setDocRows] = useState<Array<{ name: string; file: File | null }>>([
    { name: "", file: null },
  ]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([api.getAdminStudent(id), api.getAdminStudents()])
      .then(([one, list]) => {
        setStudent(mapAdminStudent(one as Record<string, unknown>));
        setStudents((list as Array<Record<string, unknown>>).map(mapAdminStudent));
      })
      .catch(() => {
        setStudent(null);
        setStudents([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const editingClassId =
    student?.classId ??
    classes.find(
      (cls) =>
        (cls.gradeLevel === student?.grade || cls.name.startsWith(student?.grade ?? "")) &&
        cls.section === student?.section
    )?.id ??
    "";

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!student) return;
    setError("");
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const classId = String(form.get("classId") ?? "") || editingClassId;
    if (!classes.find((c) => c.id === classId)) {
      setError("اختر المرحلة أولاً ثم الشعبة");
      setSubmitting(false);
      return;
    }
    try {
      const nationalId = String(form.get("nationalId") ?? "").trim();
      const nationalIdError = validateStudentNationalId(nationalId, {
        required: true,
        existingStudents: students,
        excludeStudentId: student.id,
      });
      if (nationalIdError) {
        setError(nationalIdError);
        setSubmitting(false);
        return;
      }
      await api.updateAdminStudent(student.id, {
        name: form.get("name"),
        nationalId,
        parentPhone: String(form.get("parentPhone") ?? "").trim(),
        address: String(form.get("address") ?? "").trim(),
        evaluation: String(form.get("evaluation") ?? "").trim(),
        classId: Number(classId),
        isActive: form.get("isActive") === "true",
        is_active: form.get("isActive") === "true",
      });
      router.push("/admin/students");
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تحديث الطالب");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <PageBusy title="تعديل طالب" description="تحديث بيانات الطالب" />;
  }

  if (!student) {
    return (
      <div className="space-y-4">
        <PageHeader title="تعديل طالب" description="تعذر العثور على الطالب" />
        <Button href="/admin/students" variant="outline">
          العودة للقائمة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader title="تعديل طالب" description={student.name} />
        <Button href="/admin/students" variant="outline" className="gap-2">
          <ArrowRight className="h-4 w-4" />
          العودة للقائمة
        </Button>
      </div>

      <AdminStudentFormPanel
        key={student.id}
        mode="edit"
        editing={student}
        classes={classes}
        grades={grades}
        editingClassId={editingClassId}
        existingStudents={students}
        docRows={docRows}
        onDocRowsChange={setDocRows}
        error={error}
        submitting={submitting}
        onSubmit={handleUpdate}
        onClose={() => router.push("/admin/students")}
      />
    </div>
  );
}
