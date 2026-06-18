"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { NumberFieldWithKeypad } from "@/components/teacher/NumberFieldWithKeypad";
import { NumberKeypadGroup } from "@/components/teacher/NumberKeypadGroup";
import { Select } from "@/components/atoms/Select";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useSchool } from "@/context/SchoolContext";
import { api } from "@/lib/api";
import type { Grade } from "@/types/teacher";
import { GripVertical, Plus, Save, Trash2 } from "lucide-react";
import type { AdminStudent } from "@/types";

function mapStudent(s: Record<string, unknown>): AdminStudent {
  return {
    id: String(s.id),
    name: String(s.name),
    grade: String(s.grade),
    section: s.section ? String(s.section) : undefined,
    classId: s.classId ? String(s.classId) : undefined,
    studentNumber: s.studentNumber ? String(s.studentNumber) : undefined,
    username: s.username ? String(s.username) : undefined,
    generatedPassword: s.generatedPassword ? String(s.generatedPassword) : undefined,
    paymentStatus: (s.paymentStatus as AdminStudent["paymentStatus"]) ?? "pending",
    documents: (s.documents as AdminStudent["documents"]) ?? [],
  };
}

export default function AdminClassesPage() {
  const { classes, refresh } = useSchool();
  const [classError, setClassError] = useState("");
  const [addingGrade, setAddingGrade] = useState(false);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(true);
  const [editing, setEditing] = useState<Record<string, number>>({});
  const [newSectionsCount, setNewSectionsCount] = useState("2");
  const [expandedGradeId, setExpandedGradeId] = useState<string>("");
  const [confirmDeleteGradeId, setConfirmDeleteGradeId] = useState<string>("");
  const [deletingGrade, setDeletingGrade] = useState(false);
  const [draggingGradeId, setDraggingGradeId] = useState("");
  const [dropTargetGradeId, setDropTargetGradeId] = useState("");
  const [reorderingGrades, setReorderingGrades] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [classStudents, setClassStudents] = useState<AdminStudent[]>([]);
  const [loadingClassDetail, setLoadingClassDetail] = useState(false);
  const [classHomeroomTeacherName, setClassHomeroomTeacherName] = useState<string | null>(null);
  const [classHomeroomTeacherId, setClassHomeroomTeacherId] = useState<string>("");
  const [savingHomeroom, setSavingHomeroom] = useState(false);
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([]);

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

  const sortGrades = (list: Grade[]) =>
    [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name, "ar"));

  useEffect(() => {
    let mounted = true;
    api.getAdminGrades()
      .then((data) => {
        if (!mounted) return;
        setGrades(sortGrades(data as Grade[]));
      })
      .catch(() => {
        if (!mounted) return;
        setGrades([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingGrades(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    api.getAdminTeachers()
      .then((data) => {
        if (!mounted) return;
        const list = (data as Array<Record<string, unknown>>).map((t) => ({
          id: String(t.id),
          name: String(t.name),
        }));
        setTeachers(list.sort((a, b) => a.name.localeCompare(b.name, "ar")));
      })
      .catch(() => setTeachers([]));
    return () => {
      mounted = false;
    };
  }, []);

  async function reloadAll() {
    await Promise.all([
      refresh(),
      api.getAdminGrades().then((data) => setGrades(sortGrades(data as Grade[]))).catch(() => setGrades([])),
    ]);
  }

  async function handleGradeDrop(e: React.DragEvent<HTMLDivElement>, toId: string) {
    e.preventDefault();
    const fromId = e.dataTransfer.getData("text/plain");
    setDraggingGradeId("");
    setDropTargetGradeId("");
    if (!fromId || fromId === toId) return;

    const fromIdx = grades.findIndex((g) => g.id === fromId);
    const toIdx = grades.findIndex((g) => g.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;

    const next = [...grades];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);

    setGrades(next);
    setReorderingGrades(true);
    setClassError("");
    try {
      const data = await api.reorderAdminGrades(next.map((g) => g.id));
      setGrades(sortGrades(data as Grade[]));
    } catch (err) {
      setClassError(err instanceof Error ? err.message : "تعذر حفظ ترتيب الفصول");
      const data = await api.getAdminGrades();
      setGrades(sortGrades(data as Grade[]));
    } finally {
      setReorderingGrades(false);
    }
  }

  async function handleAddGrade(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setClassError("");
    setAddingGrade(true);
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const name = String(form.get("name") ?? "").trim();
    const sectionsCount = Number(form.get("sectionsCount") ?? 1);

    try {
      await api.createAdminGrade({ name, sectionsCount });
      await reloadAll();
      formEl.reset();
    } catch (err) {
      setClassError(err instanceof Error ? err.message : "فشل إضافة الفصل");
    } finally {
      setAddingGrade(false);
    }
  }

  function openDeleteGradeConfirm(id: string) {
    setConfirmDeleteGradeId(id);
    setClassError("");
  }

  function closeDeleteGradeConfirm() {
    setConfirmDeleteGradeId("");
  }

  async function confirmDeleteGrade() {
    if (!confirmDeleteGradeId) return;
    setClassError("");
    setDeletingGrade(true);
    try {
      await api.deleteAdminGrade(confirmDeleteGradeId);
      await reloadAll();
      setConfirmDeleteGradeId("");
    } catch (err) {
      setClassError(err instanceof Error ? err.message : "فشل حذف الفصل");
    } finally {
      setDeletingGrade(false);
    }
  }

  async function handleSaveGrade(grade: Grade) {
    const nextCount = editing[grade.id];
    if (!nextCount || nextCount === grade.sectionsCount) return;
    setClassError("");
    try {
      await api.updateAdminGrade(grade.id, { sectionsCount: nextCount });
      await reloadAll();
      setEditing((prev) => {
        const next = { ...prev };
        delete next[grade.id];
        return next;
      });
    } catch (err) {
      setClassError(err instanceof Error ? err.message : "فشل تحديث عدد الشعب");
    }
  }

  const classesByGradeName = useMemo(() => {
    const map = new Map<string, typeof classes>();
    for (const cls of classes) {
      const grade = cls.gradeLevel || cls.name;
      const list = map.get(grade) ?? [];
      list.push(cls);
      map.set(grade, list);
    }
    for (const [k, list] of map.entries()) {
      list.sort((a, b) => a.name.localeCompare(b.name, "ar"));
      map.set(k, list);
    }
    return map;
  }, [classes]);

  async function loadClassDetail(classId: string) {
    setSelectedClassId(classId);
    setLoadingClassDetail(true);
    setClassError("");
    try {
      const data = (await api.getAdminClassDetail(classId)) as {
        class: Record<string, unknown>;
        students: Array<Record<string, unknown>>;
      };
      setClassStudents((data.students ?? []).map(mapStudent));
      setClassHomeroomTeacherName(
        (data.class?.homeroomTeacherName as string | null | undefined) ?? null
      );
      setClassHomeroomTeacherId(String((data.class?.homeroomTeacherId as string | null | undefined) ?? ""));
    } catch (err) {
      setClassStudents([]);
      setClassHomeroomTeacherName(null);
      setClassHomeroomTeacherId("");
      setClassError(err instanceof Error ? err.message : "فشل تحميل تفاصيل الشعبة");
    } finally {
      setLoadingClassDetail(false);
    }
  }

  async function saveHomeroomTeacher() {
    if (!selectedClassId) return;
    setSavingHomeroom(true);
    setClassError("");
    try {
      await api.updateAdminClassHomeroom(
        selectedClassId,
        classHomeroomTeacherId ? classHomeroomTeacherId : null
      );
      await loadClassDetail(selectedClassId);
    } catch (err) {
      setClassError(err instanceof Error ? err.message : "فشل حفظ مربي الصف");
    } finally {
      setSavingHomeroom(false);
    }
  }

  return (
    <NumberKeypadGroup>
    <div>
      <PageHeader
        title="إدارة الفصول والشعب"
        description="أضف الفصل وحدد عدد الشعب، وسيتم توليد الشعب تلقائياً (مثل: التاسع - أ، التاسع - ب)"
        className="mb-6"
      />

      <Card className="mb-6">
        <h3 className="mb-4 font-bold text-[#1a1a1a]">إضافة فصل جديد</h3>

        {classError && (
          <Alert variant="error" className="mb-4">
            {classError}
          </Alert>
        )}

        <form onSubmit={handleAddGrade} className="grid gap-4 sm:grid-cols-3">
          <Input label="اسم الفصل (مثال: الصف التاسع)" name="name" required />
          <NumberFieldWithKeypad
            fieldId="newSectionsCount"
            label="عدد الشعب"
            name="sectionsCount"
            value={newSectionsCount}
            onChange={setNewSectionsCount}
            min={1}
            max={20}
            required
          />
          <div className="flex items-end">
            <Button type="submit" disabled={addingGrade} className="w-full">
              <Plus className="h-4 w-4" />
              {addingGrade ? "جاري الإضافة..." : "إضافة فصل"}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-[#1a1a1a]">الفصول المسجّلة</h3>
            <p className="mt-1 text-sm text-neutral-500">
              اسحب الفصول لتحديد ترتيب التصعيد — الطالب ينتقل للفصل التالي في القائمة عند
              التصعيد.
            </p>
          </div>
          {reorderingGrades && (
            <span className="text-xs font-medium text-p-green">جاري حفظ الترتيب...</span>
          )}
        </div>

        {loadingGrades ? (
          <p className="rounded-xl bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500">
            جارِ تحميل الفصول...
          </p>
        ) : grades.length === 0 ? (
          <p className="rounded-xl bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500">
            لا توجد فصول بعد. أضف فصلاً من النموذج أعلاه.
          </p>
        ) : (
          <div className="space-y-3">
            {grades.map((g, index) => {
              const isOpen = expandedGradeId === g.id;
              const sections = classesByGradeName.get(g.name) ?? [];
              const isDragging = draggingGradeId === g.id;
              const isDropTarget = dropTargetGradeId === g.id && draggingGradeId && draggingGradeId !== g.id;
              return (
                <div
                  key={g.id}
                  className={[
                    "rounded-2xl border bg-white transition-shadow",
                    isDragging ? "border-dashed border-neutral-300 opacity-60" : "border-neutral-100",
                    isDropTarget ? "ring-2 ring-p-green ring-offset-2" : "",
                  ].join(" ")}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDropTargetGradeId(g.id);
                  }}
                  onDragLeave={() => {
                    if (dropTargetGradeId === g.id) setDropTargetGradeId("");
                  }}
                  onDrop={(e) => handleGradeDrop(e, g.id)}
                >
                  <div className="flex items-stretch">
                    <div
                      draggable={!reorderingGrades}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", g.id);
                        e.dataTransfer.effectAllowed = "move";
                        setDraggingGradeId(g.id);
                      }}
                      onDragEnd={() => {
                        setDraggingGradeId("");
                        setDropTargetGradeId("");
                      }}
                      className="flex cursor-grab items-center border-e border-neutral-100 px-3 text-neutral-400 active:cursor-grabbing hover:text-neutral-600"
                      title="اسحب لإعادة الترتيب"
                      aria-label={`إعادة ترتيب ${g.name}`}
                    >
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedGradeId(isOpen ? "" : g.id)}
                      className={[
                        "flex flex-1 flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4 text-start",
                        isOpen ? "bg-neutral-50" : "hover:bg-neutral-50",
                      ].join(" ")}
                    >
                      <div className="min-w-[240px]">
                        <p className="text-base font-bold text-brand-blue">{g.name}</p>
                        <p className="mt-1 text-xs text-neutral-500">
                          الترتيب: <span className="font-semibold">{index + 1}</span>
                          {" · "}
                          عدد الشعب: <span className="font-semibold">{g.sectionsCount}</span>
                        </p>
                      </div>

                      <div className="text-xs text-neutral-500">
                        {isOpen ? "إخفاء التفاصيل" : "عرض الشعب"}
                      </div>
                    </button>
                  </div>

                  {isOpen && (
                    <div className="px-5 pb-5">
                      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          {sections.length === 0 ? (
                            <span className="text-sm text-neutral-500">
                              لم يتم توليد شعب بعد لهذا الصف.
                            </span>
                          ) : (
                            sections.map((cls) => (
                              <button
                                key={cls.id}
                                type="button"
                                onClick={() => loadClassDetail(cls.id)}
                                className={[
                                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
                                  selectedClassId === cls.id
                                    ? "border-p-green bg-p-green/5"
                                    : "border-neutral-200 bg-white hover:border-neutral-300",
                                ].join(" ")}
                              >
                                <span>{cls.name}</span>
                                <Badge variant="default">{cls.studentCount} طالب</Badge>
                              </button>
                            ))
                          )}
                        </div>

                        <div className="flex flex-wrap items-end gap-3">
                          <NumberFieldWithKeypad
                            fieldId={`sections-${g.id}`}
                            label="تعديل عدد الشعب"
                            value={String(editing[g.id] ?? g.sectionsCount)}
                            onChange={(value) =>
                              setEditing((prev) => ({ ...prev, [g.id]: Number(value) || 1 }))
                            }
                            min={1}
                            max={20}
                            className="w-[200px]"
                            inputClassName="w-full"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleSaveGrade(g)}
                            className="h-[42px]"
                          >
                            <Save className="h-4 w-4" />
                            حفظ
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => openDeleteGradeConfirm(g.id)}
                            className="h-[42px] text-p-red hover:text-p-red"
                          >
                            <Trash2 className="h-4 w-4" />
                            حذف الصف
                          </Button>
                        </div>
                      </div>

                      {selectedClassId && (
                        <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-5">
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-p-black">تفاصيل الشعبة</p>
                            <p className="text-xs text-neutral-600">
                              مربي الصف:{" "}
                              <span className="font-semibold text-p-black">
                                {classHomeroomTeacherName ?? "غير محدد"}
                              </span>
                            </p>
                          </div>

                          <div className="mb-4 flex flex-wrap items-end gap-3">
                            <div className="min-w-[260px]">
                              <Select
                                label="تعيين مربي الصف"
                                value={classHomeroomTeacherId}
                                onChange={(e) => setClassHomeroomTeacherId(e.target.value)}
                                options={[
                                  { value: "", label: "بدون (غير محدد)" },
                                  ...teachers.map((t) => ({ value: t.id, label: t.name })),
                                ]}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={saveHomeroomTeacher}
                              disabled={savingHomeroom}
                              className="h-[42px]"
                            >
                              <Save className="h-4 w-4" />
                              {savingHomeroom ? "جاري الحفظ..." : "حفظ مربي الصف"}
                            </Button>
                          </div>

                          {loadingClassDetail ? (
                            <p className="text-sm text-neutral-500">جاري تحميل الطلاب...</p>
                          ) : classStudents.length === 0 ? (
                            <p className="text-sm text-neutral-500">
                              لا يوجد طلاب في هذه الشعبة بعد.
                            </p>
                          ) : (
                            <div className="overflow-x-auto rounded-xl bg-white">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-neutral-100 bg-white text-p-black/60">
                                    <th className="px-4 py-3 text-start font-semibold">الطالب</th>
                                    <th className="px-4 py-3 text-start font-semibold">رقم الطالب</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {classStudents.map((s) => (
                                    <tr key={s.id} className="border-b border-neutral-50">
                                      <td className="px-4 py-3 font-medium text-p-black">{s.name}</td>
                                      <td className="px-4 py-3 text-p-black/70">
                                        {s.studentNumber ?? "-"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {confirmDeleteGradeId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeDeleteGradeConfirm}
        >
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <Card className="p-6">
              <p className="text-base font-bold text-p-black">تأكيد حذف الصف</p>
              <p className="mt-2 text-sm text-p-black/70">
                هل أنت متأكد؟ سيتم حذف الشعب المرتبطة بهذا الصف إذا لم تحتوي طلاباً.
              </p>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeDeleteGradeConfirm}>
                  إلغاء
                </Button>
                <Button
                  type="button"
                  onClick={confirmDeleteGrade}
                  disabled={deletingGrade}
                  className="bg-p-red hover:bg-p-red/90 focus-visible:ring-p-red"
                >
                  {deletingGrade ? "جاري الحذف..." : "حذف"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
    </NumberKeypadGroup>
  );
}
