"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { PageHeader } from "@/components/molecules/PageHeader";
import { mockClassStudents, mockTeacherClasses } from "@/data/mock";
import type { ClassStudent } from "@/types";
import { Save, Search } from "lucide-react";

export default function ClassGradebookPage() {
  const params = useParams();
  const classId = params.id as string;
  const classInfo = mockTeacherClasses.find((c) => c.id === classId);
  const initialStudents = mockClassStudents[classId] ?? [];

  const [students, setStudents] = useState<ClassStudent[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(
    () => students.filter((s) => s.name.includes(search)),
    [students, search]
  );

  function updateStudent(id: string, field: "grade" | "note", value: string) {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, [field]: field === "grade" ? (value === "" ? "" : Number(value)) : value }
          : s
      )
    );
    setSaved(false);
  }

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 800);
  }

  if (!classInfo) {
    return <p className="text-p-black/50">الفصل غير موجود</p>;
  }

  return (
    <div>
      <PageHeader
        title={classInfo.name}
        description="دفتر العلامات — إدخال وتعديل درجات الطلاب"
      />

      {saved && (
        <Alert variant="success" className="mb-4">
          تم حفظ التغييرات بنجاح (عرض تجريبي)
        </Alert>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-p-black/40" />
          <input
            type="text"
            placeholder="بحث عن طالب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 py-2.5 pe-4 ps-10 text-sm focus:border-p-green focus:outline-none focus:ring-2 focus:ring-p-green/20"
          />
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-p-cream text-p-black/60">
              <th className="px-4 py-3 text-start font-semibold">اسم الطالب</th>
              <th className="px-4 py-3 text-start font-semibold">الدرجة</th>
              <th className="px-4 py-3 text-start font-semibold">ملاحظة</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-neutral-50">
                <td className="px-4 py-3 font-medium text-p-black">{s.name}</td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={s.grade}
                    onChange={(e) => updateStudent(s.id, "grade", e.target.value)}
                    className="w-24 py-1.5"
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    value={s.note}
                    onChange={(e) => updateStudent(s.id, "note", e.target.value)}
                    placeholder="ملاحظة..."
                    className="min-w-[160px] py-1.5"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
