"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { NumberFieldWithKeypad } from "@/components/teacher/NumberFieldWithKeypad";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { useSchool } from "@/context/SchoolContext";
import { api } from "@/lib/api";
import { Plus } from "lucide-react";

export default function AdminClassNewPage() {
  const router = useRouter();
  const { refresh } = useSchool();
  const [name, setName] = useState("");
  const [sectionsCount, setSectionsCount] = useState("2");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.createAdminGrade({ name: name.trim(), sectionsCount: Number(sectionsCount) });
      await refresh();
      router.push("/admin/classes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إضافة المرحلة");
    } finally {
      setSaving(false);
    }
  }

  return (
    <WorkspacePage
      title="إضافة مرحلة"
      description="أدخل اسم المرحلة وعدد الشعب ليتم توليدها تلقائياً."
      breadcrumbs={[{ label: "المراحل", href: "/admin/classes" }, { label: "إضافة" }]}
    >
      <Card className="max-w-lg">
        {error ? (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="اسم المرحلة (مثال: الصف التاسع)"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <NumberFieldWithKeypad
            fieldId="newSectionsCount"
            label="عدد الشعب"
            name="sectionsCount"
            value={sectionsCount}
            onChange={setSectionsCount}
            min={1}
            max={20}
            required
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" href="/admin/classes">
              إلغاء
            </Button>
            <Button type="submit" disabled={saving}>
              <Plus className="h-4 w-4" />
              {saving ? "جاري الإضافة..." : "إضافة"}
            </Button>
          </div>
        </form>
      </Card>
    </WorkspacePage>
  );
}
