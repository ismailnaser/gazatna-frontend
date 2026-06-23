"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Select } from "@/components/atoms/Select";
import { AdminStudentFormPanel } from "@/components/admin/AdminStudentFormPanel";
import { AdminStudentsTable } from "@/components/admin/AdminStudentsTable";
import { GradeSectionClassMultiSelect } from "@/components/shared/GradeSectionClassMultiSelect";
import { PageHeader } from "@/components/molecules/PageHeader";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { useSchool } from "@/context/SchoolContext";
import { formatClassLabel, mapAdminStudent } from "@/lib/adminStudents";
import { exportStudentsToExcel } from "@/lib/exportStudentsExcel";
import { api } from "@/lib/api";
import { validateStudentNationalId } from "@/lib/nationalId";
import type { AccountCredentials, AdminStudent } from "@/types";
import { Download, Plus, Search, Users } from "lucide-react";

export default function AdminStudentsPage() {
  const { classes, grades } = useSchool();
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminStudent | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<AccountCredentials | null>(null);
  const [resetCredentials, setResetCredentials] = useState<AccountCredentials | null>(null);
  const [confirmReset, setConfirmReset] = useState<AdminStudent | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [confirmDeleteStudent, setConfirmDeleteStudent] = useState<AdminStudent | null>(null);
  const [deletingStudent, setDeletingStudent] = useState(false);
  const [docRows, setDocRows] = useState<Array<{ name: string; file: File | null }>>([
    { name: "", file: null },
  ]);
  const [search, setSearch] = useState("");
  const [classFilters, setClassFilters] = useState<string[]>([]);
  const [documentsFilter, setDocumentsFilter] = useState("");
  const formRef = useRef<HTMLDivElement>(null);
  const pageTopRef = useRef<HTMLDivElement>(null);
  const scrollToFormRef = useRef(false);

  function scrollToPageTop() {
    pageTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const documentsFilterOptions = [
    { value: "", label: "جميع الوثائق" },
    { value: "with", label: "لديه وثائق" },
    { value: "without", label: "بدون وثائق" },
  ];

  const hasActiveFilters = Boolean(search.trim() || classFilters.length > 0 || documentsFilter);

  function studentMatchesClassFilter(student: AdminStudent, classFilter: string) {
    if (student.classId) return student.classId === classFilter;
    const selectedClass = classes.find((cls) => cls.id === classFilter);
    if (!selectedClass) return false;
    const gradeMatch =
      student.grade === selectedClass.gradeLevel || selectedClass.name.startsWith(student.grade);
    return gradeMatch && student.section === selectedClass.section;
  }

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((student) => {
      if (
        classFilters.length > 0 &&
        !classFilters.some((classFilter) => studentMatchesClassFilter(student, classFilter))
      ) {
        return false;
      }
      if (documentsFilter === "with" && student.documents.length === 0) return false;
      if (documentsFilter === "without" && student.documents.length > 0) return false;
      if (query) {
        const haystack = [
          student.name,
          student.studentNumber,
          student.nationalId,
          student.username,
          formatClassLabel(student.grade, student.section),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [students, search, classFilters, documentsFilter, classes]);

  function clearFilters() {
    setSearch("");
    setClassFilters([]);
    setDocumentsFilter("");
  }

  function handleExportExcel() {
    if (filteredStudents.length === 0) return;
    exportStudentsToExcel(filteredStudents);
  }

  useEffect(() => {
    setLoading(true);
    api
      .getAdminStudents()
      .then((data) => setStudents((data as Array<Record<string, unknown>>).map(mapAdminStudent)))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!scrollToFormRef.current || !formRef.current) return;
    if (!editing && !showForm) return;
    formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    scrollToFormRef.current = false;
  }, [editing, showForm]);

  function openCreateForm() {
    setEditing(null);
    setShowForm(true);
    setError("");
    setCredentials(null);
    scrollToFormRef.current = true;
  }

  function openEditForm(student: AdminStudent) {
    setShowForm(false);
    setEditing(student);
    setError("");
    scrollToFormRef.current = true;
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setError("");
    setDocRows([{ name: "", file: null }]);
  }

  async function resetStudentPassword(student: AdminStudent) {
    setResettingPassword(true);
    setError("");
    setSuccess("");
    try {
      const data = (await api.resetAdminStudentPassword(student.id)) as Record<string, unknown>;
      setResetCredentials({
        name: String(data.name ?? student.name),
        username: String(data.username ?? student.username ?? ""),
        password: String(data.password ?? ""),
        role: "parent",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إعادة تعيين كلمة المرور");
    } finally {
      setResettingPassword(false);
      setConfirmReset(null);
    }
  }

  async function confirmDeleteStudentAction() {
    if (!confirmDeleteStudent) return;
    setDeletingStudent(true);
    setError("");
    setSuccess("");
    try {
      await api.deleteAdminStudent(confirmDeleteStudent.id);
      setStudents((prev) => prev.filter((s) => s.id !== confirmDeleteStudent.id));
      if (editing?.id === confirmDeleteStudent.id) {
        closeForm();
      }
      setSuccess(`تم حذف الطالب «${confirmDeleteStudent.name}» بنجاح.`);
      setConfirmDeleteStudent(null);
      scrollToPageTop();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حذف الطالب");
    } finally {
      setDeletingStudent(false);
    }
  }

  function resolveClassId(form: FormData, fallbackClassId?: string) {
    const classId = String(form.get("classId") ?? "");
    if (classId) return classId;
    if (fallbackClassId) return fallbackClassId;
    const grade = String(form.get("grade") ?? "");
    const section = String(form.get("section") ?? "");
    const match = classes.find(
      (cls) =>
        (cls.gradeLevel === grade || cls.name.startsWith(grade)) && cls.section === section
    );
    return match?.id ?? "";
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const classId = resolveClassId(form);
    const selectedClass = classes.find((c) => c.id === classId);
    if (!selectedClass) {
      setError("اختر الفصل والشعبة من القائمة");
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
      payload.append("classId", String(Number(classId)));
      for (const row of docRows) {
        if (!row.file) continue;
        const nm = row.name.trim();
        if (!nm) continue;
        payload.append("documentNames", nm);
        payload.append("documentFiles", row.file);
      }
      const created = (await api.createAdminStudent(payload)) as Record<string, unknown>;
      const mapped = mapAdminStudent(created);
      setStudents((prev) => [mapped, ...prev]);
      if (mapped.username && mapped.generatedPassword) {
        setCredentials({
          name: mapped.name,
          username: mapped.username,
          password: mapped.generatedPassword,
          role: "parent",
        });
      }
      closeForm();
      formEl.reset();
      scrollToPageTop();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إضافة الطالب");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setError("");
    setSubmitting(true);
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const classId = resolveClassId(form, editing.classId);
    if (!classes.find((c) => c.id === classId)) {
      setError("اختر الفصل والشعبة من القائمة");
      setSubmitting(false);
      return;
    }
    try {
      const nationalId = String(form.get("nationalId") ?? "").trim();
      const nationalIdError = validateStudentNationalId(nationalId, {
        required: true,
        existingStudents: students,
        excludeStudentId: editing.id,
      });
      if (nationalIdError) {
        setError(nationalIdError);
        setSubmitting(false);
        return;
      }
      const updated = (await api.updateAdminStudent(editing.id, {
        name: form.get("name"),
        nationalId,
        classId: Number(classId),
      })) as Record<string, unknown>;
      setStudents((prev) =>
        prev.map((s) => (s.id === editing.id ? mapAdminStudent(updated) : s))
      );
      setSuccess("تم حفظ تعديلات الطالب بنجاح.");
      closeForm();
      scrollToPageTop();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تحديث الطالب");
    } finally {
      setSubmitting(false);
    }
  }

  const editingClassId =
    editing?.classId ??
    classes.find(
      (cls) =>
        (cls.gradeLevel === editing?.grade || cls.name.startsWith(editing?.grade ?? "")) &&
        cls.section === editing?.section
    )?.id ??
    "";

  return (
    <div ref={pageTopRef} className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="إدارة الطلاب"
          description="الأرشيف الرقمي لسجلات الطلاب — إضافة، تعديل، والوثائق."
        />
        <Button onClick={openCreateForm} className="shrink-0">
          <Plus className="h-4 w-4" />
          إضافة طالب
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
        </Alert>
      ) : null}

      {resetCredentials ? (
        <Alert variant="success">
          <p className="mb-2 font-semibold">تم إعادة تعيين كلمة المرور:</p>
          <p>الاسم: {resetCredentials.name}</p>
          <p>
            اسم المستخدم: <span dir="ltr">{resetCredentials.username}</span>
          </p>
          <p>
            كلمة المرور الجديدة: <span dir="ltr">{resetCredentials.password}</span>
          </p>
        </Alert>
      ) : null}

      {success ? <Alert variant="success">{success}</Alert> : null}
      {error && !showForm && !editing ? <Alert variant="error">{error}</Alert> : null}

      <div ref={formRef}>
        {showForm ? (
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
            onClose={closeForm}
          />
        ) : null}

        {editing ? (
          <AdminStudentFormPanel
            mode="edit"
            editing={editing}
            classes={classes}
            grades={grades}
            editingClassId={editingClassId}
            existingStudents={students}
            docRows={docRows}
            onDocRowsChange={setDocRows}
            error={error}
            submitting={submitting}
            onSubmit={handleUpdate}
            onClose={closeForm}
          />
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white px-4 py-3 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-p-black/45">إجمالي الطلاب</p>
            <p className="text-lg font-bold text-p-black">{students.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white px-4 py-3 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
            <Search className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-p-black/45">نتائج العرض</p>
            <p className="text-lg font-bold text-p-black">{filteredStudents.length}</p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-100 bg-white shadow-sm">
        <header className="relative z-10 space-y-3 border-b border-neutral-100 bg-neutral-50/70 px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-p-black">بحث وتصفية</h2>
            <Button
              type="button"
              variant="outline"
              className="gap-1.5 px-3 py-1.5 text-xs"
              onClick={handleExportExcel}
              disabled={loading || filteredStudents.length === 0}
            >
              <Download className="h-3.5 w-3.5" />
              تصدير Excel ({filteredStudents.length})
            </Button>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-p-black/40" />
            <input
              type="search"
              placeholder="بحث بالاسم، رقم الطالب، رقم الهوية، أو اسم المستخدم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pe-4 ps-10 text-sm focus:border-p-green focus:outline-none focus:ring-2 focus:ring-p-green/20"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <GradeSectionClassMultiSelect
              label="الفصل والشعبة"
              classes={classes}
              grades={grades}
              value={classFilters}
              onChange={setClassFilters}
              placeholder="جميع الفصول"
            />
            <Select
              label="الوثائق"
              name="documentsFilter"
              options={documentsFilterOptions}
              value={documentsFilter}
              onChange={(e) => setDocumentsFilter(e.target.value)}
            />
          </div>
          {hasActiveFilters ? (
            <div className="flex justify-end">
              <Button variant="outline" className="px-3 py-1.5 text-xs" onClick={clearFilters}>
                مسح الفلاتر
              </Button>
            </div>
          ) : null}
        </header>

        <div className="overflow-x-auto p-3 sm:p-4">
          {loading ? (
            <p className="py-10 text-center text-sm text-neutral-500">جاري التحميل...</p>
          ) : (
            <AdminStudentsTable
              students={filteredStudents}
              hasActiveFilters={hasActiveFilters}
              onEdit={openEditForm}
              onResetPassword={setConfirmReset}
              onDelete={(student) => {
                setError("");
                setConfirmDeleteStudent(student);
              }}
            />
          )}
        </div>
      </section>

      {confirmReset ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          onClick={() => setConfirmReset(null)}
        >
          <div className="w-full max-w-lg rounded-2xl border border-neutral-100 bg-white p-5 shadow-lg sm:p-6">
            <p className="text-base font-bold text-p-black">تأكيد تغيير كلمة المرور</p>
            <p className="mt-2 text-sm text-p-black/70">
              إعادة تعيين كلمة مرور الطالب{" "}
              <span className="font-semibold">{confirmReset.name}</span>؟ ستُعرض كلمة المرور
              الجديدة مرة واحدة فقط.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setConfirmReset(null)}>
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={() => resetStudentPassword(confirmReset)}
                disabled={resettingPassword}
              >
                {resettingPassword ? "جاري التغيير..." : "تأكيد"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(confirmDeleteStudent)}
        title="تأكيد حذف الطالب"
        description={
          confirmDeleteStudent ? (
            <>
              هل أنت متأكد من حذف الطالب{" "}
              <span className="font-semibold">{confirmDeleteStudent.name}</span>؟
              {confirmDeleteStudent.studentNumber ? (
                <>
                  {" "}
                  (<span dir="ltr">#{confirmDeleteStudent.studentNumber}</span>)
                </>
              ) : null}
              <br />
              <span className="mt-2 block text-p-black/60">
                سيتم حذف سجل الطالب وحساب ولي الأمر المرتبط به. لا يمكن التراجع عن هذا الإجراء.
              </span>
            </>
          ) : (
            ""
          )
        }
        confirmLabel={deletingStudent ? "جاري الحذف..." : "حذف"}
        loading={deletingStudent}
        error={confirmDeleteStudent ? error : undefined}
        onConfirm={confirmDeleteStudentAction}
        onCancel={() => {
          if (deletingStudent) return;
          setConfirmDeleteStudent(null);
          setError("");
        }}
      />
    </div>
  );
}
