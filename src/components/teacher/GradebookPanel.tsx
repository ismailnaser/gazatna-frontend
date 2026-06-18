"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { DashboardLoadingState } from "@/components/dashboard/DashboardLoadingState";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { NumberFieldWithKeypad } from "@/components/teacher/NumberFieldWithKeypad";
import { NumberKeypadGroup } from "@/components/teacher/NumberKeypadGroup";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ClassStudent } from "@/types";
import { GraduationCap, Save, Search, StickyNote, Users } from "lucide-react";

function studentInitial(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0) : "?";
}

function StatChip({
  icon: Icon,
  label,
  shortLabel,
  value,
}: {
  icon: typeof Users;
  label: string;
  shortLabel?: string;
  value: string | number;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-neutral-100 bg-white px-1.5 py-2.5 text-center shadow-sm sm:flex-row sm:items-center sm:gap-2.5 sm:px-3 sm:py-2.5 sm:text-start">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-p-green/10 text-p-green sm:h-9 sm:w-9">
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </span>
      <div className="min-w-0 w-full">
        <p className="text-[10px] leading-snug text-p-black/45 sm:hidden">{shortLabel ?? label}</p>
        <p className="hidden text-[11px] leading-snug text-p-black/45 sm:block">{label}</p>
        <p className="mt-0.5 text-base font-bold leading-none text-p-black sm:text-sm">{value}</p>
      </div>
    </div>
  );
}

export function GradebookPanel({ classId }: { classId: string }) {
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getTeacherClassStudents(classId)
      .then((data) => setStudents(data as ClassStudent[]))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, [classId]);

  const filtered = useMemo(
    () => students.filter((s) => s.name.includes(search)),
    [students, search]
  );

  const stats = useMemo(() => {
    const graded = students.filter((s) => s.grade !== "" && s.grade != null).length;
    const noted = students.filter((s) => s.note.trim()).length;
    return { total: students.length, graded, noted };
  }, [students]);

  const hasUnsavedChanges = !saved && students.length > 0;

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

  async function handleSave() {
    setSaving(true);
    try {
      const entries = students.map((s) => ({
        id: s.id,
        grade: s.grade,
        note: s.note,
      }));
      const updated = await api.updateTeacherGradebook(classId, entries);
      setStudents(updated as ClassStudent[]);
      setSaved(true);
    } catch {
      setSaved(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardLoadingState
        compact
        message="جاري تحميل قائمة الطلاب..."
        hint="نجهّز دفتر العلامات"
      />
    );
  }

  return (
    <div className="space-y-4">
      {saved && (
        <Alert variant="success">تم حفظ التغييرات بنجاح</Alert>
      )}

      <section className="flex gap-1.5 sm:gap-2">
        <StatChip icon={Users} label="عدد الطلاب" shortLabel="الطلاب" value={stats.total} />
        <StatChip icon={GraduationCap} label="تم إدخال درجات" shortLabel="مُقيَّم" value={stats.graded} />
        <StatChip icon={StickyNote} label="ملاحظات" value={stats.noted} />
      </section>

      <section className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        <header className="border-b border-neutral-100 bg-neutral-50/70 px-3 py-3 sm:px-4">
          <h2 className="text-sm font-bold text-p-black">إدخال الدرجات</h2>
          <p className="mt-0.5 text-xs text-p-black/50">
            أدخل درجة كل طالب من 0 إلى 100 مع ملاحظة اختيارية.
          </p>
        </header>

        <div className="space-y-3 p-3 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-p-black/40" />
              <input
                type="text"
                placeholder="بحث عن طالب..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pe-4 ps-10 text-sm focus:border-p-green focus:outline-none focus:ring-2 focus:ring-p-green/20"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || students.length === 0}
              className={cn("w-full shrink-0 sm:w-auto", hasUnsavedChanges && "ring-2 ring-p-green/20")}
            >
              <Save className="h-4 w-4" />
              {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </div>

          {students.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/60 px-4 py-10 text-center">
              <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-p-black/35">
                <Users className="h-6 w-6" />
              </span>
              <p className="font-semibold text-p-black/70">لا يوجد طلاب في هذا الفصل</p>
              <p className="mt-1 text-sm text-p-black/45">
                عند إضافة طلاب للفصل ستظهر أسماؤهم هنا لإدخال الدرجات.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/60 px-4 py-8 text-center text-sm text-p-black/50">
              لا توجد نتائج لـ «{search}»
            </div>
          ) : (
            <NumberKeypadGroup>
            <div className="-mx-3 overflow-x-auto sm:mx-0">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50 text-p-black/55">
                    <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4 sm:py-3">
                      اسم الطالب
                    </th>
                    <th className="w-24 px-3 py-2.5 text-start text-xs font-bold sm:w-32 sm:px-4 sm:py-3">
                      الدرجة
                    </th>
                    <th className="min-w-[160px] px-3 py-2.5 text-start text-xs font-bold sm:min-w-[200px] sm:px-4 sm:py-3">
                      ملاحظة
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student, index) => (
                    <tr
                      key={student.id}
                      className={cn(
                        "border-b border-neutral-50 last:border-0",
                        index % 2 === 1 && "bg-neutral-50/40"
                      )}
                    >
                      <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-[11px] font-bold text-brand-blue sm:h-8 sm:w-8 sm:text-xs">
                            {studentInitial(student.name)}
                          </span>
                          <span className="font-semibold text-p-black">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                        <NumberFieldWithKeypad
                          compact
                          fieldId={`grade-${student.id}`}
                          label={`درجة ${student.name}`}
                          value={student.grade === "" ? "" : String(student.grade)}
                          onChange={(value) => updateStudent(student.id, "grade", value)}
                          min={0}
                          max={100}
                          allowDecimal
                          maxDecimalPlaces={2}
                          placeholder="0–100"
                          inputClassName="w-20 py-1.5 sm:w-24 sm:py-2"
                        />
                      </td>
                      <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                        <Input
                          value={student.note}
                          onChange={(e) => updateStudent(student.id, "note", e.target.value)}
                          placeholder="ملاحظة..."
                          className="min-w-[140px] py-1.5 sm:min-w-[200px] sm:py-2"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </NumberKeypadGroup>
          )}
        </div>
      </section>
    </div>
  );
}
