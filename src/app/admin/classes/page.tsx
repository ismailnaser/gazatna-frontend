"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { NumberFieldWithKeypad } from "@/components/teacher/NumberFieldWithKeypad";
import { Select } from "@/components/atoms/Select";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import { api } from "@/lib/api";
import { isSuperAdmin } from "@/lib/adminRoles";
import { mapGrades, mapSchoolClasses } from "@/lib/mapSchoolClass";
import type { Grade, SchoolClass } from "@/types/teacher";
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
    nationalId: s.nationalId ? String(s.nationalId) : undefined,
    username: s.username ? String(s.username) : undefined,
    generatedPassword: s.generatedPassword ? String(s.generatedPassword) : undefined,
    paymentStatus: (s.paymentStatus as AdminStudent["paymentStatus"]) ?? "pending",
    documents: (s.documents as AdminStudent["documents"]) ?? [],
    isActive: s.isActive !== undefined ? Boolean(s.isActive) : s.is_active !== false,
  };
}

export default function AdminClassesPage() {
  const { user } = useAuth();
  const { refresh } = useSchool();
  const [pageClasses, setPageClasses] = useState<SchoolClass[]>([]);
  const [classError, setClassError] = useState("");
  const [classSuccess, setClassSuccess] = useState("");
  const [confirmSaveHomeroom, setConfirmSaveHomeroom] = useState(false);
  const [addingGrade, setAddingGrade] = useState(false);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(true);
  const [editing, setEditing] = useState<Record<string, number>>({});
  const [newSectionsCount, setNewSectionsCount] = useState("2");
  const [expandedGradeId, setExpandedGradeId] = useState<string>("");
  const [confirmDeleteGradeId, setConfirmDeleteGradeId] = useState<string>("");
  const [deleteGradeError, setDeleteGradeError] = useState("");
  const [deletingGrade, setDeletingGrade] = useState(false);
  const [confirmDeleteClassId, setConfirmDeleteClassId] = useState<string>("");
  const [deleteClassError, setDeleteClassError] = useState("");
  const [deletingClass, setDeletingClass] = useState(false);
  const [draggingGradeId, setDraggingGradeId] = useState("");
  const [dropTargetGradeId, setDropTargetGradeId] = useState("");
  const [reorderingGrades, setReorderingGrades] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [classStudents, setClassStudents] = useState<AdminStudent[]>([]);
  const [loadingClassDetail, setLoadingClassDetail] = useState(false);
  const [classHomeroomTeacherName, setClassHomeroomTeacherName] = useState<string | null>(null);
  const [classHomeroomTeacherId, setClassHomeroomTeacherId] = useState<string>("");
  const [savingHomeroom, setSavingHomeroom] = useState(false);
  const [teachers, setTeachers] = useState<
    Array<{ id: string; name: string; homeroomClassId?: string | null }>
  >([]);
  const mountedRef = useRef(true);

  const sortGrades = (list: Grade[]) =>
    [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name, "ar"));

  const reloadAll = useCallback(async (options?: { syncContext?: boolean }) => {
    setLoadingGrades(true);
    try {
      const [gradesData, classesData] = await Promise.all([
        api.getAdminGrades(),
        api.getAdminClasses(),
      ]);
      if (!mountedRef.current) return;
      setGrades(sortGrades(mapGrades(gradesData as unknown[])));
      setPageClasses(mapSchoolClasses(classesData as unknown[]));
      if (options?.syncContext) {
        void refresh();
      }
    } catch {
      if (!mountedRef.current) return;
      setGrades([]);
      setPageClasses([]);
    } finally {
      if (mountedRef.current) setLoadingGrades(false);
    }
  }, [refresh]);

  useEffect(() => {
    mountedRef.current = true;
    void reloadAll();
    return () => {
      mountedRef.current = false;
    };
  }, [reloadAll]);

  useEffect(() => {
    let mounted = true;
    api.getAdminTeachers()
      .then((data) => {
        if (!mounted) return;
        const list = (data as Array<Record<string, unknown>>).map((t) => ({
          id: String(t.id),
          name: String(t.name),
          homeroomClassId:
            t.homeroomClassId != null ? String(t.homeroomClassId) : null,
        }));
        setTeachers(list.sort((a, b) => a.name.localeCompare(b.name, "ar")));
      })
      .catch(() => setTeachers([]));
    return () => {
      mounted = false;
    };
  }, []);

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
      setGrades(sortGrades(mapGrades(data as unknown[])));
    } catch (err) {
      setClassError(err instanceof Error ? err.message : "تعذر حفظ ترتيب الفصول");
      const data = await api.getAdminGrades();
      setGrades(sortGrades(mapGrades(data as unknown[])));
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
      await reloadAll({ syncContext: true });
      formEl.reset();
    } catch (err) {
      setClassError(err instanceof Error ? err.message : "فشل إضافة الفصل");
    } finally {
      setAddingGrade(false);
    }
  }

  function openDeleteGradeConfirm(id: string) {
    setConfirmDeleteGradeId(id);
    setDeleteGradeError("");
    setClassError("");
  }

  function closeDeleteGradeConfirm() {
    setConfirmDeleteGradeId("");
    setDeleteGradeError("");
  }

  async function confirmDeleteGrade() {
    if (!confirmDeleteGradeId) return;
    const gradeId = confirmDeleteGradeId;
    setDeleteGradeError("");
    setDeletingGrade(true);
    try {
      await api.deleteAdminGrade(gradeId);
      setGrades((prev) => prev.filter((g) => g.id !== gradeId));
      setExpandedGradeId((current) => (current === gradeId ? "" : current));
      setConfirmDeleteGradeId("");
      try {
        await reloadAll({ syncContext: true });
      } catch {
        // الحذف نجح؛ إعادة التحميل اختيارية
      }
    } catch (err) {
      setDeleteGradeError(err instanceof Error ? err.message : "فشل حذف الفصل");
    } finally {
      setDeletingGrade(false);
    }
  }

  function openDeleteClassConfirm(classId: string) {
    setConfirmDeleteClassId(classId);
    setDeleteClassError("");
  }

  function closeDeleteClassConfirm() {
    setConfirmDeleteClassId("");
    setDeleteClassError("");
  }

  async function confirmDeleteClass() {
    if (!confirmDeleteClassId) return;
    const classId = confirmDeleteClassId;
    setDeleteClassError("");
    setDeletingClass(true);
    try {
      await api.deleteAdminClass(classId);
      if (selectedClassId === classId) {
        setSelectedClassId("");
        setClassStudents([]);
        setClassHomeroomTeacherName(null);
        setClassHomeroomTeacherId("");
      }
      setConfirmDeleteClassId("");
      try {
        await reloadAll({ syncContext: true });
      } catch {
        // الحذف نجح
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "فشل حذف الشعبة";
      if (message.includes("غير موجود") || message.includes("تم حذفه")) {
        setConfirmDeleteClassId("");
        setSelectedClassId("");
        await reloadAll({ syncContext: true });
        setClassError(message);
        return;
      }
      setDeleteClassError(message);
    } finally {
      setDeletingClass(false);
    }
  }

  async function handleSaveGrade(grade: Grade) {
    const nextCount = editing[grade.id];
    if (!nextCount || nextCount === grade.sectionsCount) return;
    setClassError("");
    try {
      await api.updateAdminGrade(grade.id, { sectionsCount: nextCount });
      await reloadAll({ syncContext: true });
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
    const map = new Map<string, SchoolClass[]>();
    for (const cls of pageClasses) {
      const grade = cls.gradeLevel?.trim();
      if (!grade) continue;
      const list = map.get(grade) ?? [];
      list.push(cls);
      map.set(grade, list);
    }
    for (const [k, list] of map.entries()) {
      list.sort((a, b) => a.name.localeCompare(b.name, "ar"));
      map.set(k, list);
    }
    return map;
  }, [pageClasses]);

  async function loadClassDetail(classId: string) {
    setSelectedClassId(classId);
    setLoadingClassDetail(true);
    setClassError("");
    setClassSuccess("");
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
    setClassSuccess("");
    const selectedTeacher = teachers.find((teacher) => teacher.id === classHomeroomTeacherId);
    const className = pageClasses.find((schoolClass) => schoolClass.id === selectedClassId)?.name ?? "هذه الشعبة";
    try {
      await api.updateAdminClassHomeroom(
        selectedClassId,
        classHomeroomTeacherId ? classHomeroomTeacherId : null
      );
      await loadClassDetail(selectedClassId);
      setClassSuccess(
        classHomeroomTeacherId
          ? `تم تعيين ${selectedTeacher?.name ?? "مربي الصف"} مربياً لـ ${className} بنجاح.`
          : `تم إزالة مربي الصف من ${className} بنجاح.`
      );
      setConfirmSaveHomeroom(false);
      const teachersData = await api.getAdminTeachers();
      setTeachers(
        (teachersData as Array<Record<string, unknown>>)
          .map((teacher) => ({
            id: String(teacher.id),
            name: String(teacher.name),
            homeroomClassId:
              teacher.homeroomClassId != null ? String(teacher.homeroomClassId) : null,
          }))
          .sort((a, b) => a.name.localeCompare(b.name, "ar"))
      );
    } catch (err) {
      setClassError(err instanceof Error ? err.message : "فشل حفظ مربي الصف");
    } finally {
      setSavingHomeroom(false);
    }
  }

  const selectedClassName =
    pageClasses.find((schoolClass) => schoolClass.id === selectedClassId)?.name ?? "هذه الشعبة";
  const pendingHomeroomTeacherName =
    teachers.find((teacher) => teacher.id === classHomeroomTeacherId)?.name ?? null;

  const homeroomTeacherOptions = useMemo(() => {
    return teachers
      .filter(
        (teacher) =>
          !teacher.homeroomClassId || teacher.homeroomClassId === selectedClassId
      )
      .map((teacher) => ({ value: teacher.id, label: teacher.name }));
  }, [teachers, selectedClassId]);

  const gradeToDelete = useMemo(
    () => grades.find((g) => g.id === confirmDeleteGradeId) ?? null,
    [grades, confirmDeleteGradeId]
  );

  const classToDelete = useMemo(
    () => pageClasses.find((c) => c.id === confirmDeleteClassId) ?? null,
    [pageClasses, confirmDeleteClassId]
  );

  const studentsInGradeToDelete = useMemo(() => {
    if (!gradeToDelete) return 0;
    return (classesByGradeName.get(gradeToDelete.name) ?? []).reduce(
      (sum, cls) => sum + (cls.studentCount ?? 0),
      0
    );
  }, [gradeToDelete, classesByGradeName]);

  const studentsInClassToDelete = classToDelete?.studentCount ?? 0;

  if (user && !isSuperAdmin(user.role)) {
    return (
      <p className="text-sm text-neutral-500">إدارة المراحل الدراسية متاحة للإدارة الكلية فقط.</p>
    );
  }

  return (
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
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-xs text-neutral-600">
                                مربي الصف:{" "}
                                <span className="font-semibold text-p-black">
                                  {classHomeroomTeacherName ?? "غير محدد"}
                                </span>
                              </p>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => openDeleteClassConfirm(selectedClassId)}
                                className="h-8 text-xs text-p-red hover:text-p-red"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                حذف الشعبة
                              </Button>
                            </div>
                          </div>

                          <div className="mb-2 flex flex-wrap items-end gap-3">
                            <div className="min-w-[260px]">
                              <Select
                                label="تعيين مربي الصف"
                                value={classHomeroomTeacherId}
                                onChange={(e) => {
                                  setClassHomeroomTeacherId(e.target.value);
                                  setClassSuccess("");
                                  setClassError("");
                                }}
                                options={[
                                  { value: "", label: "بدون (غير محدد)" },
                                  ...homeroomTeacherOptions,
                                ]}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setClassError("");
                                setClassSuccess("");
                                setConfirmSaveHomeroom(true);
                              }}
                              disabled={savingHomeroom}
                              className="h-[42px]"
                            >
                              <Save className="h-4 w-4" />
                              {savingHomeroom ? "جاري الحفظ..." : "حفظ مربي الصف"}
                            </Button>
                          </div>
                          {classSuccess ? (
                            <Alert variant="success" className="mb-3">
                              {classSuccess}
                            </Alert>
                          ) : null}
                          {classError && selectedClassId ? (
                            <Alert variant="error" className="mb-3">
                              {classError}
                            </Alert>
                          ) : null}
                          <p className="mb-4 text-xs text-neutral-500">
                            مربي الصف واحد لكل فصل ولا يُسند لفصل آخر — منفصل عن إسناد المواد.
                          </p>

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
                                    <th className="px-4 py-3 text-start font-semibold">رقم الهوية</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {classStudents.map((s) => (
                                    <tr key={s.id} className="border-b border-neutral-50">
                                      <td className="px-4 py-3 font-medium text-p-black">{s.name}</td>
                                      <td className="px-4 py-3 text-p-black/70">
                                        {s.studentNumber ?? "-"}
                                      </td>
                                      <td className="px-4 py-3 text-p-black/70" dir="ltr">
                                        {s.nationalId ?? "-"}
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
                هل أنت متأكد من حذف صف{" "}
                <span className="font-semibold">{gradeToDelete?.name}</span>؟ سيتم حذف جميع شعبه
                وإلغاء ربط الطلاب به.
                {studentsInGradeToDelete > 0 ? (
                  <>
                    {" "}
                    <span className="font-semibold text-p-red">
                      ({studentsInGradeToDelete} طالب سيفقد ربطه بالشعبة)
                    </span>
                  </>
                ) : null}
              </p>
              {deleteGradeError ? (
                <Alert variant="error" className="mt-4">
                  {deleteGradeError}
                </Alert>
              ) : null}
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

      {confirmDeleteClassId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeDeleteClassConfirm}
        >
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <Card className="p-6">
              <p className="text-base font-bold text-p-black">تأكيد حذف الشعبة</p>
              <p className="mt-2 text-sm text-p-black/70">
                هل أنت متأكد من حذف شعبة{" "}
                <span className="font-semibold">{classToDelete?.name}</span>؟ سيتم إلغاء ربط
                الطلاب بهذه الشعبة.
                {studentsInClassToDelete > 0 ? (
                  <>
                    {" "}
                    <span className="font-semibold text-p-red">
                      ({studentsInClassToDelete} طالب سيفقد ربطه بالشعبة)
                    </span>
                  </>
                ) : null}
              </p>
              {deleteClassError ? (
                <Alert variant="error" className="mt-4">
                  {deleteClassError}
                </Alert>
              ) : null}
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeDeleteClassConfirm}>
                  إلغاء
                </Button>
                <Button
                  type="button"
                  onClick={confirmDeleteClass}
                  disabled={deletingClass}
                  className="bg-p-red hover:bg-p-red/90 focus-visible:ring-p-red"
                >
                  {deletingClass ? "جاري الحذف..." : "حذف"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {confirmSaveHomeroom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setConfirmSaveHomeroom(false);
            setClassError("");
          }}
        >
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <Card className="p-6">
              <p className="text-base font-bold text-p-black">تأكيد تعيين مربي الصف</p>
              <p className="mt-2 text-sm text-p-black/70">
                {classHomeroomTeacherId ? (
                  <>
                    هل تريد تعيين{" "}
                    <span className="font-semibold">{pendingHomeroomTeacherName}</span> مربي صف
                    لشعبة <span className="font-semibold">{selectedClassName}</span>؟
                  </>
                ) : (
                  <>
                    هل تريد إزالة مربي الصف من شعبة{" "}
                    <span className="font-semibold">{selectedClassName}</span>؟
                  </>
                )}
              </p>
              {classError ? (
                <Alert variant="error" className="mt-4">
                  {classError}
                </Alert>
              ) : null}
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setConfirmSaveHomeroom(false);
                    setClassError("");
                  }}
                  disabled={savingHomeroom}
                >
                  إلغاء
                </Button>
                <Button type="button" onClick={saveHomeroomTeacher} disabled={savingHomeroom}>
                  {savingHomeroom ? "جاري الحفظ..." : "تأكيد"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
