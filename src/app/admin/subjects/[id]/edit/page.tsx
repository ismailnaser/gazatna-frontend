"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { PageBusy, PageHeader } from "@/components/molecules/PageHeader";
import { useSchool } from "@/context/SchoolContext";
import type { Subject } from "@/types/teacher";
import { ArrowRight } from "lucide-react";

export default function AdminSubjectEditPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const router = useRouter();
  const { subjects, loading: schoolLoading, updateSubject } = useSchool();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (schoolLoading) return;
    const found = subjects.find((row) => String(row.id) === id) ?? null;
    setSubject(found);
    setName(found?.name ?? "");
    setReady(true);
  }, [id, subjects, schoolLoading]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!subject) return;
    const nextName = name.trim();
    if (!nextName) {
      setError("اسم المادة مطلوب");
      return;
    }
    if (nextName === subject.name) {
      router.push("/admin/subjects");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateSubject(subject.id, nextName);
      router.push("/admin/subjects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تعديل المادة");
    } finally {
      setSaving(false);
    }
  }

  if (!ready || schoolLoading) {
    return <PageBusy title="تعديل المادة" description="تحديث اسم المادة الدراسية" />;
  }

  if (!subject) {
    return (
      <div className="space-y-4">
        <PageHeader title="تعديل المادة" description="تعذر العثور على المادة" />
        <Button href="/admin/subjects" variant="outline">
          العودة للقائمة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader title="تعديل المادة" description={subject.name} />
        <Button href="/admin/subjects" variant="outline" className="gap-2">
          <ArrowRight className="h-4 w-4" />
          العودة للقائمة
        </Button>
      </div>

      <Card className="p-4 sm:p-5">
        {error ? (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        ) : null}
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="اسم المادة"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? "جاري الحفظ..." : "حفظ التعديل"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/subjects")}>
              إلغاء
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
