"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { AdminStudentFormPanel } from "@/components/admin/AdminStudentFormPanel";
import { PageBusy, PageHeader } from "@/components/molecules/PageHeader";
import { useSchool } from "@/context/SchoolContext";
import { mapAdminStudent } from "@/lib/adminStudents";
import { api } from "@/lib/api";
import { validateStudentNationalId } from "@/lib/nationalId";
import type { AccountCredentials, AdminStudent } from "@/types";
import { ArrowRight } from "lucide-react";

export default function AdminStudentCreatePage() {
  const router = useRouter();
  const { classes, grades } = useSchool();
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<AccountCredentials | null>(null);
  const [docRows, setDocRows] = useState<Array<{ name: string; file: File | null }>>([
    { name: "", file: null },
  ]);

  useEffect(() => {
    api
      .getAdminStudents()
      .then((data) => setStudents((data as Array<Record<string, unknown>>).map(mapAdminStudent)))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const classId = String(form.get("classId") ?? "");
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
      });
      if (nationalIdError) {
        setError(nationalIdError);
        setSubmitting(false);
        return;
      }
      const payload = new FormData();
      payload.append("name", String(form.get("name") ?? ""));
      payload.append("nationalId", nationalId);
      payload.append("parentPhone", String(form.get("parentPhone") ?? "").trim());
      payload.append("address", String(form.get("address") ?? "").trim());
      payload.append("evaluation", String(form.get("evaluation") ?? "").trim());
      payload.append("classId", String(Number(classId)));
      for (const row of docRows) {
        if (!row.file || !row.name.trim()) continue;
        payload.append("documentNames", row.name.trim());
        payload.append("documentFiles", row.file);
      }
      const created = (await api.createAdminStudent(payload)) as Record<string, unknown>;
      const mapped = mapAdminStudent(created);
      if (mapped.username && mapped.generatedPassword) {
        setCredentials({
          name: mapped.name,
          username: mapped.username,
          password: mapped.generatedPassword,
          role: "parent",
        });
        return;
      }
      router.push("/admin/students");
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إضافة الطالب");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <PageBusy title="إضافة طالب" description="تسجيل طالب جديد في الأرشيف" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader title="إضافة طالب" description="نموذج إنشاء طالب جديد" />
        <Button href="/admin/students" variant="outline" className="gap-2">
          <ArrowRight className="h-4 w-4" />
          العودة للقائمة
        </Button>
      </div>

      {credentials ? (
        <Alert variant="success">
          <p className="mb-2 font-semibold">تم إنشاء حساب الطالب — احفظ بيانات الدخول:</p>
          <p>الاسم: {credentials.name}</p>
          <p>
            اسم المستخدم: <span dir="ltr">{credentials.username}</span>
          </p>
          <p>
            كلمة المرور: <span dir="ltr">{credentials.password}</span>
          </p>
          <div className="mt-4">
            <Button href="/admin/students">الانتقال إلى قائمة الطلاب</Button>
          </div>
        </Alert>
      ) : (
        <AdminStudentFormPanel
          mode="create"
          classes={classes}
          grades={grades}
          existingStudents={students}
          docRows={docRows}
          onDocRowsChange={setDocRows}
          error={error}
          submitting={submitting}
          onSubmit={handleAdd}
          onClose={() => router.push("/admin/students")}
        />
      )}
    </div>
  );
}
