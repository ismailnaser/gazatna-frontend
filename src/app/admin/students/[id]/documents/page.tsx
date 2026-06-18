"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { PageHeader } from "@/components/molecules/PageHeader";
import { FileUploadField } from "@/components/molecules/FileUploadField";
import { api } from "@/lib/api";
import { FileText, Pencil, Plus, Trash2, X } from "lucide-react";

type Doc = { id?: string | null; name: string; url?: string | null };

function mapDoc(d: Record<string, unknown>): Doc {
  return {
    id: d.id ? String(d.id) : null,
    name: String(d.name ?? ""),
    url: d.url ? String(d.url) : null,
  };
}

export default function AdminStudentDocumentsPage() {
  const params = useParams<{ id: string }>();
  const studentId = String(params.id);

  const [studentName, setStudentName] = useState<string>("");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [rows, setRows] = useState<Array<{ name: string; file: File | null }>>([
    { name: "", file: null },
  ]);

  const [editingDoc, setEditingDoc] = useState<Doc | null>(null);
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [confirmDeleteDoc, setConfirmDeleteDoc] = useState<Doc | null>(null);
  const [deletingDoc, setDeletingDoc] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [student, data] = await Promise.all([
        api.getAdminStudent(studentId) as Promise<Record<string, unknown>>,
        api.getAdminStudentDocuments(studentId),
      ]);
      setStudentName(String(student.name ?? ""));
      setDocs((data as Array<Record<string, unknown>>).map(mapDoc));
    } catch (err) {
      setDocs([]);
      setError(err instanceof Error ? err.message : "فشل تحميل الوثائق");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const fd = new FormData();
      let hasAny = false;
      for (const row of rows) {
        if (!row.file) continue;
        const nm = row.name.trim();
        if (!nm) continue;
        fd.append("documentNames", nm);
        fd.append("documentFiles", row.file);
        hasAny = true;
      }
      if (!hasAny) {
        setError("أضف اسم الوثيقة واختر ملفاً على الأقل");
        return;
      }
      const updated = await api.addAdminStudentDocuments(studentId, fd);
      setDocs((updated as Array<Record<string, unknown>>).map(mapDoc));
      setRows([{ name: "", file: null }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل رفع الوثائق");
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(doc: Doc) {
    if (!doc.id) return;
    setEditingDoc(doc);
    setEditName(doc.name);
    setEditFile(null);
    setError("");
  }

  function closeEdit() {
    setEditingDoc(null);
    setEditName("");
    setEditFile(null);
  }

  async function saveEdit() {
    if (!editingDoc?.id) return;
    const name = editName.trim();
    if (!name) {
      setError("اسم الوثيقة مطلوب");
      return;
    }
    setSavingEdit(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("name", name);
      if (editFile) fd.append("file", editFile);
      const updated = (await api.updateAdminStudentDocument(studentId, editingDoc.id, fd)) as Record<
        string,
        unknown
      >;
      const mapped = mapDoc(updated);
      setDocs((prev) => prev.map((d) => (d.id === mapped.id ? mapped : d)));
      closeEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تعديل الوثيقة");
    } finally {
      setSavingEdit(false);
    }
  }

  async function confirmDelete() {
    if (!confirmDeleteDoc?.id) return;
    setDeletingDoc(true);
    setError("");
    try {
      await api.deleteAdminStudentDocument(studentId, confirmDeleteDoc.id);
      setDocs((prev) => prev.filter((d) => d.id !== confirmDeleteDoc.id));
      setConfirmDeleteDoc(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حذف الوثيقة");
    } finally {
      setDeletingDoc(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title={`وثائق الطالب${studentName ? ` — ${studentName}` : ""}`}
          description="عرض وإضافة وتعديل وحذف الوثائق المرفقة للطالب"
        />
        <Link href="/admin/students" className="text-sm text-brand-blue hover:underline">
          رجوع للطلاب
        </Link>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Card className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-p-black">إضافة وثائق</p>
          <Button
            type="button"
            variant="outline"
            className="px-3 py-1.5 text-xs"
            onClick={() => setRows((prev) => [...prev, { name: "", file: null }])}
          >
            <Plus className="h-4 w-4" />
            إضافة وثيقة
          </Button>
        </div>

        <div className="space-y-3">
          {rows.map((row, idx) => (
            <div
              key={idx}
              className="grid gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3 sm:grid-cols-3"
            >
              <Input
                label="اسم الوثيقة"
                value={row.name}
                onChange={(e) =>
                  setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, name: e.target.value } : r)))
                }
                placeholder="مثال: شهادة ميلاد"
              />
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <FileUploadField
                  compact
                  label="الملف"
                  preset="any"
                  buttonText="اضغط لاختيار ملف"
                  selectedFileName={row.file?.name ?? null}
                  onChange={(files) => {
                    const f = files?.[0] ?? null;
                    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, file: f } : r)));
                  }}
                />
                {row.file && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-fit px-2 py-1 text-xs text-neutral-500 hover:text-p-red"
                    onClick={() => setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, file: null } : r)))}
                  >
                    إزالة الملف
                  </Button>
                )}
                {rows.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-fit px-2 py-1 text-xs text-p-red hover:text-p-red"
                    onClick={() => setRows((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    <X className="h-4 w-4" />
                    حذف
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="button" onClick={submit} disabled={submitting}>
            {submitting ? "جاري الرفع..." : "حفظ الوثائق"}
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-neutral-100 px-6 py-4">
          <p className="text-sm font-semibold text-p-black">الوثائق الحالية</p>
        </div>
        {loading ? (
          <p className="px-6 py-8 text-sm text-neutral-500">جاري التحميل...</p>
        ) : docs.length === 0 ? (
          <p className="px-6 py-8 text-sm text-neutral-500">لا توجد وثائق لهذا الطالب بعد.</p>
        ) : (
          <ul className="divide-y divide-neutral-50">
            {docs.map((d, i) => (
              <li
                key={d.id ?? `${d.name}-${i}`}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
              >
                <div className="flex items-center gap-2 text-sm text-p-black/80">
                  <FileText className="h-4 w-4 text-p-green" />
                  {d.name}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {d.url ? (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brand-blue hover:underline"
                    >
                      فتح
                    </a>
                  ) : (
                    <span className="text-xs text-neutral-400">بدون ملف</span>
                  )}
                  {d.id && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="px-2 py-1 text-xs"
                        onClick={() => openEdit(d)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        تعديل
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="px-2 py-1 text-xs text-p-red hover:text-p-red"
                        onClick={() => setConfirmDeleteDoc(d)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        حذف
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {editingDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeEdit}
        >
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <Card className="p-6">
              <p className="text-base font-bold text-p-black">تعديل الوثيقة</p>
              <div className="mt-4 space-y-4">
                <Input
                  label="اسم الوثيقة"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
                <FileUploadField
                  label="استبدال الملف (اختياري)"
                  preset="any"
                  buttonText="اضغط لاختيار ملف جديد"
                  hint="اتركه فارغاً للإبقاء على الملف الحالي"
                  selectedFileName={editFile?.name ?? null}
                  onChange={(files) => setEditFile(files?.[0] ?? null)}
                />
              </div>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeEdit}>
                  إلغاء
                </Button>
                <Button type="button" onClick={saveEdit} disabled={savingEdit}>
                  {savingEdit ? "جاري الحفظ..." : "حفظ التعديل"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {confirmDeleteDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setConfirmDeleteDoc(null)}
        >
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <Card className="p-6">
              <p className="text-base font-bold text-p-black">تأكيد حذف الوثيقة</p>
              <p className="mt-2 text-sm text-p-black/70">
                هل أنت متأكد من حذف الوثيقة{" "}
                <span className="font-semibold">{confirmDeleteDoc.name}</span>؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setConfirmDeleteDoc(null)}>
                  إلغاء
                </Button>
                <Button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deletingDoc}
                  className="bg-p-red hover:bg-p-red/90 focus-visible:ring-p-red"
                >
                  {deletingDoc ? "جاري الحذف..." : "حذف"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
