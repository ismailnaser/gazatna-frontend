"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { useSchool } from "@/context/SchoolContext";
import { api } from "@/lib/api";
import type { AccountCredentials, AdminStudent, PaymentStatus } from "@/types";
import { FileText, Plus, Search, X } from "lucide-react";

function formatClassLabel(grade: string, section?: string) {
  return section ? `${grade} - ${section}` : grade;
}

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
    paymentStatus: s.paymentStatus as AdminStudent["paymentStatus"],
    documents: (s.documents as string[]) ?? [],
  };
}

export default function AdminStudentsPage() {
  const { classes } = useSchool();
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminStudent | null>(null);
  const [viewDocs, setViewDocs] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<AccountCredentials | null>(null);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [documentsFilter, setDocumentsFilter] = useState("");
  const formRef = useRef<HTMLDivElement>(null);
  const scrollToFormRef = useRef(false);

  const classOptions = useMemo(
    () => [
      { value: "", label: "اختر الفصل والشعبة" },
      ...classes.map((cls) => ({
        value: cls.id,
        label: cls.name,
      })),
    ],
    [classes]
  );

  const filterClassOptions = useMemo(
    () => [
      { value: "", label: "جميع الفصول" },
      ...classes.map((cls) => ({
        value: cls.id,
        label: cls.name,
      })),
    ],
    [classes]
  );

  const paymentFilterOptions = [
    { value: "", label: "جميع حالات الدفع" },
    { value: "pending", label: "قيد المراجعة" },
    { value: "approved", label: "تم القبول" },
    { value: "rejected", label: "مرفوض" },
  ];

  const documentsFilterOptions = [
    { value: "", label: "جميع الوثائق" },
    { value: "with", label: "لديه وثائق" },
    { value: "without", label: "بدون وثائق" },
  ];

  const hasActiveFilters = Boolean(
    search.trim() || classFilter || paymentFilter || documentsFilter
  );

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      if (classFilter) {
        if (student.classId) {
          if (student.classId !== classFilter) return false;
        } else {
          const selectedClass = classes.find((cls) => cls.id === classFilter);
          if (!selectedClass) return false;
          const gradeMatch =
            student.grade === selectedClass.gradeLevel ||
            selectedClass.name.startsWith(student.grade);
          if (!gradeMatch || student.section !== selectedClass.section) return false;
        }
      }

      if (paymentFilter && student.paymentStatus !== paymentFilter) return false;

      if (documentsFilter === "with" && student.documents.length === 0) return false;
      if (documentsFilter === "without" && student.documents.length > 0) return false;

      if (query) {
        const haystack = [
          student.name,
          student.studentNumber,
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
  }, [students, search, classFilter, paymentFilter, documentsFilter, classes]);

  function clearFilters() {
    setSearch("");
    setClassFilter("");
    setPaymentFilter("");
    setDocumentsFilter("");
  }

  useEffect(() => {
    api.getAdminStudents()
      .then((data) => {
        setStudents((data as Array<Record<string, unknown>>).map(mapStudent));
      })
      .catch(() => setStudents([]));
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
  }

  function resolveClassId(form: FormData, fallbackClassId?: string) {
    const classId = String(form.get("classId") ?? "");
    if (classId) return classId;

    if (fallbackClassId) return fallbackClassId;

    const grade = String(form.get("grade") ?? "");
    const section = String(form.get("section") ?? "");
    const match = classes.find(
      (cls) =>
        (cls.gradeLevel === grade || cls.name.startsWith(grade)) &&
        cls.section === section
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
      const created = (await api.createAdminStudent({
        name: form.get("name"),
        classId: Number(classId),
        grade: selectedClass.gradeLevel ?? selectedClass.name,
        section: selectedClass.section,
        documents: ["شهادة ميلاد"],
      })) as Record<string, unknown>;

      const mapped = mapStudent(created);
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
    const selectedClass = classes.find((c) => c.id === classId);

    if (!selectedClass) {
      setError("اختر الفصل والشعبة من القائمة");
      setSubmitting(false);
      return;
    }

    try {
      const updated = (await api.updateAdminStudent(editing.id, {
        name: form.get("name"),
        classId: Number(classId),
      })) as Record<string, unknown>;

      const mapped = mapStudent(updated);
      setStudents((prev) => prev.map((s) => (s.id === editing.id ? mapped : s)));
      closeForm();
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
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeader title="إدارة الطلاب" description="الأرشيف الرقمي لسجلات الطلاب" />
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4" />
          إضافة طالب
        </Button>
      </div>

      <div ref={formRef}>
        {showForm && (
          <Card className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-p-black">طالب جديد</h3>
              <button type="button" onClick={closeForm}>
                <X className="h-5 w-5 text-p-black/40" />
              </button>
            </div>

            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}

            <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
              <Input label="اسم الطالب" name="name" required />

              {classes.length === 0 ? (
                <div className="sm:col-span-2 rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center text-sm text-neutral-500">
                  لا توجد فصول مسجّلة.{" "}
                  <Link href="/admin/classes" className="text-brand-blue hover:underline">
                    أضف الفصول أولاً من صفحة إدارة الفصول
                  </Link>
                </div>
              ) : (
                <Select
                  label="الفصل والشعبة"
                  name="classId"
                  options={classOptions}
                  required
                />
              )}

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-p-black/80">
                  الوثائق (شهادة ميلاد، هوية)
                </label>
                <input type="file" multiple className="text-sm" />
              </div>
              <Button type="submit" disabled={submitting || classes.length === 0}>
                {submitting ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </form>
          </Card>
        )}

        {editing && (
          <Card className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-p-black">تعديل الطالب</h3>
              <button type="button" onClick={closeForm}>
                <X className="h-5 w-5 text-p-black/40" />
              </button>
            </div>

            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}

            <form
              key={editing.id}
              onSubmit={handleUpdate}
              className="grid gap-4 sm:grid-cols-2"
            >
              <Input label="اسم الطالب" name="name" defaultValue={editing.name} required />

              {classes.length === 0 ? (
                <div className="sm:col-span-2 rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center text-sm text-neutral-500">
                  لا توجد فصول مسجّلة.{" "}
                  <Link href="/admin/classes" className="text-brand-blue hover:underline">
                    أضف الفصول أولاً من صفحة إدارة الفصول
                  </Link>
                </div>
              ) : (
                <Select
                  label="الفصل والشعبة"
                  name="classId"
                  options={classOptions}
                  defaultValue={editingClassId}
                  required
                />
              )}

              {editing.studentNumber && (
                <Input
                  label="رقم الطالب"
                  name="studentNumber"
                  defaultValue={editing.studentNumber}
                  readOnly
                  className="sm:col-span-2 bg-neutral-50"
                />
              )}

              <div className="sm:col-span-2 flex gap-3">
                <Button type="submit" disabled={submitting || classes.length === 0}>
                  {submitting ? "جاري الحفظ..." : "حفظ التعديلات"}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  إلغاء
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>

      {credentials && (
        <Alert variant="success" className="mb-6">
          <p className="mb-2 font-semibold">تم إنشاء حساب الطالب تلقائياً — احفظ بيانات الدخول:</p>
          <p>الاسم: {credentials.name}</p>
          <p>
            اسم المستخدم: <span dir="ltr">{credentials.username}</span>
          </p>
          <p>
            كلمة المرور: <span dir="ltr">{credentials.password}</span>
          </p>
          <p className="mt-2 text-xs opacity-80">
            يُستخدم اسم المستخدم وكلمة المرور لتسجيل الدخول من بوابة ولي الأمر / الطالب.
          </p>
        </Alert>
      )}

      {viewDocs && (
        <Card className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-bold text-p-black">الوثائق المرفقة</h3>
            <button type="button" onClick={() => setViewDocs(null)}>
              <X className="h-5 w-5 text-p-black/40" />
            </button>
          </div>
          <ul className="space-y-1 text-sm text-p-black/60">
            {viewDocs.map((d) => (
              <li key={d} className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-p-green" />
                {d}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="mb-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2 lg:col-span-4">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-p-black/40" />
            <input
              type="text"
              placeholder="بحث بالاسم، رقم الطالب، أو اسم المستخدم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 py-2.5 pe-4 ps-10 text-sm focus:border-p-green focus:outline-none focus:ring-2 focus:ring-p-green/20"
            />
          </div>
          <Select
            label="الفصل والشعبة"
            name="classFilter"
            options={filterClassOptions}
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          />
          <Select
            label="حالة الدفع"
            name="paymentFilter"
            options={paymentFilterOptions}
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | "")}
          />
          <Select
            label="الوثائق"
            name="documentsFilter"
            options={documentsFilterOptions}
            value={documentsFilter}
            onChange={(e) => setDocumentsFilter(e.target.value)}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4">
          <p className="text-sm text-p-black/60">
            عرض {filteredStudents.length} من {students.length} طالب
          </p>
          {hasActiveFilters && (
            <Button variant="outline" className="px-3 py-1.5 text-xs" onClick={clearFilters}>
              مسح الفلاتر
            </Button>
          )}
        </div>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-p-cream text-p-black/60">
              <th className="px-4 py-3 text-start font-semibold">الاسم</th>
              <th className="px-4 py-3 text-start font-semibold">الفصل والشعبة</th>
              <th className="px-4 py-3 text-start font-semibold">حالة الدفع</th>
              <th className="px-4 py-3 text-start font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-p-black/50">
                  {hasActiveFilters ? "لا توجد نتائج مطابقة للبحث أو الفلاتر" : "لا يوجد طلاب مسجّلون"}
                </td>
              </tr>
            ) : (
              filteredStudents.map((s) => (
              <tr key={s.id} className="border-b border-neutral-50">
                <td className="px-4 py-3 font-medium text-p-black">{s.name}</td>
                <td className="px-4 py-3">
                  {formatClassLabel(s.grade, s.section)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.paymentStatus} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => openEditForm(s)}
                    >
                      تعديل
                    </Button>
                    <Button
                      variant="ghost"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => setViewDocs(s.documents)}
                    >
                      الوثائق
                    </Button>
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
