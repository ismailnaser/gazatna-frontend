"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { AdminSubjectsGrid } from "@/components/admin/AdminSubjectsGrid";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SubjectSectionTeacherAssigner, buildSubjectSectionDrafts, sectionDraftsToPayload, type SubjectSectionDraft } from "@/components/admin/SubjectSectionTeacherAssigner";
import { useSchool } from "@/context/SchoolContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { canManageAdminClasses, isAdminRole } from "@/lib/adminRoles";
import { mapGrades, mapSchoolClasses } from "@/lib/mapSchoolClass";
import { teacherCountLabel } from "@/lib/adminSubjects";
import { cn } from "@/lib/utils";
import type { Grade, SchoolClass, Subject } from "@/types/teacher";
import { BookMarked, BookOpen, GraduationCap, Plus, Save, Search, Users, X } from "lucide-react";

function StatChip({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof BookOpen;
  label: string;
  value: string | number;
  tone?: "default" | "success";
}) {
  const tones = {
    default: "bg-brand-blue/10 text-brand-blue",
    success: "bg-p-green/10 text-p-green",
  };

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-neutral-100 bg-white px-3 py-2.5 shadow-sm">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          tones[tone]
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-p-black/45">{label}</p>
        <p className="text-sm font-bold text-p-black">{value}</p>
      </div>
    </div>
  );
}

export default function AdminSubjectsPage() {
  const { user } = useAuth();
  const canManageClasses =
    user && isAdminRole(user.role) && canManageAdminClasses(user.role);
  const {
    subjects,
    teachers,
    classes,
    grades,
    loading,
    refresh,
    addSubject,
    updateSubject,
    syncSubjectSections,
    removeSubject,
  } = useSchool();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const pageTopRef = useRef<HTMLDivElement>(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmDeleteSubject, setConfirmDeleteSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [viewSubject, setViewSubject] = useState<Subject | null>(null);
  const [sectionDrafts, setSectionDrafts] = useState<Record<string, SubjectSectionDraft>>({});
  const [savingSections, setSavingSections] = useState(false);
  const [editName, setEditName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [modalClasses, setModalClasses] = useState<SchoolClass[]>([]);
  const [modalGrades, setModalGrades] = useState<Grade[]>([]);

  useEffect(() => {
    if (!viewSubject) return;
    let active = true;
    Promise.all([api.getAdminClasses(), api.getAdminGrades()])
      .then(([classesData, gradesData]) => {
        if (!active) return;
        setModalClasses(mapSchoolClasses(classesData as unknown[]));
        setModalGrades(mapGrades(gradesData as unknown[]));
      })
      .catch(() => {
        if (!active) return;
        setModalClasses(classes);
        setModalGrades(grades);
      });
    return () => {
      active = false;
    };
  }, [viewSubject, classes, grades]);

  const subjectsWithCounts = useMemo(
    () =>
      subjects.map((subject) => ({
        ...subject,
        teacherCount: teachers.filter((teacher) => teacher.subjectIds?.includes(subject.id))
          .length,
      })),
    [subjects, teachers]
  );

  const viewSubjectTeachers = useMemo(
    () =>
      viewSubject
        ? teachers.filter((teacher) => teacher.subjectIds?.includes(viewSubject.id))
        : [],
    [teachers, viewSubject]
  );

  const enabledSectionCount = useMemo(
    () => Object.values(sectionDrafts).filter((draft) => draft.enabled).length,
    [sectionDrafts]
  );

  const totalTeachers = useMemo(
    () => subjectsWithCounts.reduce((sum, subject) => sum + subject.teacherCount, 0),
    [subjectsWithCounts]
  );

  const filteredSubjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subjectsWithCounts;
    return subjectsWithCounts.filter((subject) => subject.name.toLowerCase().includes(q));
  }, [subjectsWithCounts, search]);

  function openSubjectView(subject: Subject) {
    setViewSubject(subject);
    setSectionDrafts(
      buildSubjectSectionDrafts(
        classes.length > 0 ? classes : modalClasses,
        subject.classIds ?? [],
        teachers,
        subject.name
      )
    );
    setError("");
    setSuccess("");
  }

  useEffect(() => {
    if (!viewSubject || modalClasses.length === 0) return;
    setSectionDrafts((prev) => {
      const expectedKeys = modalClasses.map((schoolClass) => schoolClass.id);
      if (
        expectedKeys.length > 0 &&
        expectedKeys.every((id) => id in prev) &&
        Object.keys(prev).length === expectedKeys.length
      ) {
        return prev;
      }
      return buildSubjectSectionDrafts(
        modalClasses,
        viewSubject.classIds ?? [],
        teachers,
        viewSubject.name
      );
    });
  }, [viewSubject?.id, viewSubject?.name, viewSubject?.classIds, modalClasses, teachers]);

  function updateSectionDraft(classId: string, patch: Partial<SubjectSectionDraft>) {
    setSectionDrafts((prev) => ({
      ...prev,
      [classId]: { ...(prev[classId] ?? { enabled: false, teacherId: "" }), ...patch },
    }));
  }

  function scrollToPageTop() {
    pageTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function saveSubjectSections() {
    if (!viewSubject) return;

    const payload = sectionDraftsToPayload(sectionDrafts);
    const missingTeacher = payload.some((row) => !row.teacherId);
    if (payload.length === 0) {
      setError("فعّل شعبة واحدة على الأقل.");
      return;
    }
    if (missingTeacher) {
      setError("اختر معلماً لكل شعبة مفعّلة.");
      return;
    }

    setSavingSections(true);
    setError("");
    try {
      const updated = await syncSubjectSections(viewSubject.id, payload);
      setViewSubject(null);
      setSectionDrafts({});
      setSuccess(`تم حفظ إسناد مادة ${updated.name} للشعب والمعلمين بنجاح.`);
      scrollToPageTop();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حفظ إسناد المادة");
    } finally {
      setSavingSections(false);
    }
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setAdding(true);
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const name = String(form.get("name") ?? "").trim();

    if (!name) {
      setError("اسم المادة مطلوب");
      setAdding(false);
      return;
    }

    try {
      await addSubject(name);
      formEl.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إضافة المادة");
    } finally {
      setAdding(false);
    }
  }

  function openEdit(subject: Subject) {
    setEditingSubject(subject);
    setEditName(subject.name);
    setError("");
  }

  async function saveEdit() {
    if (!editingSubject) return;
    const name = editName.trim();
    if (!name) {
      setError("اسم المادة مطلوب");
      return;
    }
    if (name === editingSubject.name) {
      setEditingSubject(null);
      return;
    }

    setSavingEdit(true);
    setError("");
    try {
      await updateSubject(editingSubject.id, name);
      setEditingSubject(null);
      setEditName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تعديل المادة");
    } finally {
      setSavingEdit(false);
    }
  }

  async function confirmDeleteSubjectAction() {
    if (!confirmDeleteSubject) return;
    setDeletingSubject(true);
    setError("");
    try {
      await removeSubject(confirmDeleteSubject.id);
      setConfirmDeleteSubject(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حذف المادة");
    } finally {
      setDeletingSubject(false);
    }
  }

  return (
    <div ref={pageTopRef}>
      <PageHeader
        title="إدارة المواد الدراسية"
        description="أضف المواد واسند كل مادة للشعب مع اختيار المعلم لكل شعبة"
        className="mb-6"
      />

      {success ? (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      ) : null}

      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <StatChip icon={BookMarked} label="عدد المواد" value={subjectsWithCounts.length} />
        <StatChip
          icon={Users}
          label="إسنادات المعلمين"
          value={totalTeachers}
          tone="success"
        />
      </div>

      <Card className="mb-6 p-4 sm:p-5">
        <h3 className="mb-1 font-bold text-p-black">إضافة مادة جديدة</h3>
        <p className="mb-4 text-sm text-p-black/55">
          مثال: الرياضيات، الفيزياء، اللغة العربية
        </p>

        {error && !confirmDeleteSubject && !editingSubject && !viewSubject && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleAdd} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Input label="اسم المادة" name="name" required className="flex-1" />
          <Button type="submit" disabled={adding} className="sm:min-w-[150px]">
            <Plus className="h-4 w-4" />
            {adding ? "جاري الإضافة..." : "إضافة مادة"}
          </Button>
        </form>
      </Card>

      <Card className="p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-p-black">المواد المسجّلة</h3>
            <p className="mt-1 text-sm text-p-black/55">
              {subjectsWithCounts.length === 0
                ? "لا توجد مواد بعد"
                : `${subjectsWithCounts.length} مادة — ${teacherCountLabel(totalTeachers)} مرتبطون`}
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-p-black/35" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث باسم المادة..."
              className="w-full rounded-xl border border-neutral-200 py-2.5 pe-3 ps-9 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-p-black/50">جاري تحميل المواد...</p>
        ) : (
          <AdminSubjectsGrid
            subjects={filteredSubjects}
            hasActiveFilters={Boolean(search.trim())}
            onView={openSubjectView}
            onAssign={openSubjectView}
            onEdit={openEdit}
            onDelete={(subject) => {
              setError("");
              setConfirmDeleteSubject(subject);
            }}
          />
        )}

        {!loading && subjectsWithCounts.length === 0 ? (
          <div className="mt-4 flex justify-center">
            <Button type="button" variant="outline" onClick={() => void refresh()}>
              إعادة تحميل المواد
            </Button>
          </div>
        ) : null}
      </Card>

      {viewSubject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setViewSubject(null);
            setSectionDrafts({});
          }}
        >
          <div
            className="max-h-[min(90vh,720px)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-p-black">إسناد المادة</h3>
                <p className="mt-1 text-sm font-semibold text-brand-blue">{viewSubject.name}</p>
                <p className="mt-1 text-xs text-p-black/50">
                  فعّل الشعب واختر المعلم بجانب كل شعبة، ثم احفظ مرة واحدة.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setViewSubject(null);
                  setSectionDrafts({});
                }}
                aria-label="إغلاق"
                className="rounded-full p-1 text-p-black/40 hover:bg-neutral-100 hover:text-p-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}

            <div className="rounded-xl border border-neutral-100 bg-neutral-50/80 p-4">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-p-black">
                <GraduationCap className="h-4 w-4 text-brand-teal" />
                الشعب والمعلمون
              </h4>
              <p className="mb-4 text-xs leading-relaxed text-p-black/55">
                {teacherCountLabel(viewSubjectTeachers.length)} — {enabledSectionCount}{" "}
                {enabledSectionCount === 1 ? "شعبة مفعّلة" : "شعب مفعّلة"}
              </p>

              {(modalClasses.length > 0 ? modalClasses : classes).length === 0 ? (
                <p className="text-sm text-p-black/60">
                  لا توجد فصول مسجّلة.{" "}
                  {canManageClasses ? (
                    <Link href="/admin/classes" className="font-semibold text-brand-blue hover:underline">
                      أضف فصولاً أولاً
                    </Link>
                  ) : (
                    <span>تواصل مع الإدارة الكلية لإضافة المراحل والفصول.</span>
                  )}
                </p>
              ) : teachers.length === 0 ? (
                <p className="text-sm text-p-black/60">
                  لا يوجد معلمون في النظام.{" "}
                  <Link href="/admin/teachers" className="font-semibold text-brand-blue hover:underline">
                    أضف معلماً أولاً
                  </Link>
                </p>
              ) : (
                <>
                  <SubjectSectionTeacherAssigner
                    classes={modalClasses.length > 0 ? modalClasses : classes}
                    grades={modalGrades.length > 0 ? modalGrades : grades}
                    teachers={teachers}
                    sectionDrafts={sectionDrafts}
                    onChange={updateSectionDraft}
                  />
                  <div className="mt-4 flex justify-end">
                    <Button
                      type="button"
                      onClick={saveSubjectSections}
                      disabled={savingSections || enabledSectionCount === 0}
                      className="sm:min-w-[160px]"
                    >
                      <Save className="h-4 w-4" />
                      {savingSections ? "جاري الحفظ..." : "حفظ الإسناد"}
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setViewSubject(null);
                  setSectionDrafts({});
                }}
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}

      {editingSubject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setEditingSubject(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-p-black">تعديل اسم المادة</h3>
                <p className="mt-1 text-sm text-p-black/55">
                  {editingSubject.teacherCount > 0
                    ? `مرتبطة بـ ${teacherCountLabel(editingSubject.teacherCount)} — سيُحدَّث الاسم لديهم تلقائياً`
                    : "لم تُسند لمعلمين بعد"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSubject(null)}
                aria-label="إغلاق"
                className="rounded-full p-1 text-p-black/40 hover:bg-neutral-100 hover:text-p-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}

            <Input
              label="اسم المادة"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              autoFocus
            />

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingSubject(null)}
                disabled={savingEdit}
              >
                إلغاء
              </Button>
              <Button type="button" onClick={saveEdit} disabled={savingEdit || !editName.trim()}>
                <Save className="h-4 w-4" />
                {savingEdit ? "جاري الحفظ..." : "حفظ التعديل"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmDeleteSubject)}
        title="تأكيد حذف المادة"
        description={
          confirmDeleteSubject ? (
            <>
              هل أنت متأكد من حذف مادة{" "}
              <span className="font-semibold">{confirmDeleteSubject.name}</span>؟
              {(confirmDeleteSubject.teacherCount > 0 ||
                (confirmDeleteSubject.classIds?.length ?? 0) > 0) && (
                <>
                  {" "}
                  سيتم إلغاء إسنادها من{" "}
                  {confirmDeleteSubject.teacherCount > 0 &&
                  (confirmDeleteSubject.classIds?.length ?? 0) > 0
                    ? "المعلمين والفصول"
                    : confirmDeleteSubject.teacherCount > 0
                      ? "المعلمين"
                      : "الفصول"}
                  .
                </>
              )}{" "}
              لا يمكن التراجع عن هذا الإجراء.
            </>
          ) : null
        }
        loading={deletingSubject}
        error={confirmDeleteSubject ? error : undefined}
        onCancel={() => {
          setError("");
          setConfirmDeleteSubject(null);
        }}
        onConfirm={confirmDeleteSubjectAction}
      />
    </div>
  );
}
