"use client";

import { useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Select } from "@/components/atoms/Select";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useSchool } from "@/context/SchoolContext";
import { Plus, Trash2 } from "lucide-react";

const gradeOptions = [
  { value: "الصف الثامن", label: "الصف الثامن" },
  { value: "الصف التاسع", label: "الصف التاسع" },
  { value: "الصف العاشر", label: "الصف العاشر" },
  { value: "الصف الحادي عشر", label: "الصف الحادي عشر" },
  { value: "الصف الثاني عشر", label: "الصف الثاني عشر" },
];

const sectionOptions = ["أ", "ب", "ج", "د"].map((s) => ({
  value: s,
  label: `شعبة ${s}`,
}));

export default function AdminClassesPage() {
  const { classes, addClass, removeClass } = useSchool();
  const [classError, setClassError] = useState("");
  const [addingClass, setAddingClass] = useState(false);

  const classesByGrade = useMemo(() => {
    const map = new Map<string, typeof classes>();
    for (const cls of classes) {
      const grade = cls.gradeLevel || cls.name;
      const list = map.get(grade) ?? [];
      list.push(cls);
      map.set(grade, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, "ar"));
  }, [classes]);

  async function handleAddClass(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setClassError("");
    setAddingClass(true);
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const gradeLevel = String(form.get("gradeLevel") ?? "");
    const section = String(form.get("section") ?? "");

    try {
      await addClass(gradeLevel, section);
      formEl.reset();
    } catch (err) {
      setClassError(err instanceof Error ? err.message : "فشل إضافة الفصل");
    } finally {
      setAddingClass(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="إدارة الفصول والشعب"
        description="أضف الصفوف الدراسية وقسّمها إلى شعب (مثل: التاسع أ، التاسع ب)"
        className="mb-6"
      />

      <Card className="mb-6">
        <h3 className="mb-4 font-bold text-[#1a1a1a]">إضافة فصل جديد</h3>

        {classError && (
          <Alert variant="error" className="mb-4">
            {classError}
          </Alert>
        )}

        <form onSubmit={handleAddClass} className="grid gap-4 sm:grid-cols-3">
          <Select label="الصف الدراسي" name="gradeLevel" options={gradeOptions} required />
          <Select label="الشعبة" name="section" options={sectionOptions} required />
          <div className="flex items-end">
            <Button type="submit" disabled={addingClass} className="w-full">
              <Plus className="h-4 w-4" />
              {addingClass ? "جاري الإضافة..." : "إضافة فصل"}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="mb-4 font-bold text-[#1a1a1a]">الفصول المسجّلة</h3>

        {classes.length === 0 ? (
          <p className="rounded-xl bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500">
            لا توجد فصول بعد. أضف فصلاً من النموذج أعلاه.
          </p>
        ) : (
          <div className="space-y-6">
            {classesByGrade.map(([grade, gradeClasses]) => (
              <div key={grade}>
                <p className="mb-3 text-sm font-semibold text-brand-blue">{grade}</p>
                <div className="flex flex-wrap gap-2">
                  {gradeClasses.map((cls) => (
                    <div
                      key={cls.id}
                      className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm"
                    >
                      <span>{cls.name}</span>
                      <Badge variant="default">{cls.studentCount} طالب</Badge>
                      <button
                        type="button"
                        onClick={() => removeClass(cls.id)}
                        className="text-neutral-400 hover:text-p-red"
                        aria-label={`حذف ${cls.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
