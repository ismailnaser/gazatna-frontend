"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useSchool } from "@/context/SchoolContext";
import { ArrowRight } from "lucide-react";

export default function AdminSubjectCreatePage() {
  const router = useRouter();
  const { addSubject } = useSchool();
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setAdding(true);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();

    if (!name) {
      setError("اسم المادة مطلوب");
      setAdding(false);
      return;
    }

    try {
      await addSubject(name);
      router.push("/admin/subjects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إضافة المادة");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader title="إضافة مادة جديدة" description="تسجيل مادة دراسية جديدة" />
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
        <form onSubmit={handleAdd} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Input label="اسم المادة" name="name" required className="flex-1" />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={adding} className="sm:min-w-[150px]">
              {adding ? "جاري الإضافة..." : "إضافة مادة"}
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
