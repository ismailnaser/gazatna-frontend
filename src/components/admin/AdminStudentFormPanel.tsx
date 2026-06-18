"use client";

import Link from "next/link";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { FileUploadField } from "@/components/molecules/FileUploadField";
import type { AdminStudent } from "@/types";
import type { SchoolClass } from "@/types/teacher";
import { FileText, Plus, X } from "lucide-react";

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <header className="border-b border-neutral-100 bg-neutral-50/70 px-3 py-2.5 sm:px-4">
        <h3 className="text-sm font-bold text-p-black">{title}</h3>
        {description ? <p className="mt-0.5 text-xs text-p-black/50">{description}</p> : null}
      </header>
      <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">{children}</div>
    </section>
  );
}

type DocRow = { name: string; file: File | null };

type AdminStudentFormPanelProps = {
  mode: "create" | "edit";
  editing?: AdminStudent | null;
  classes: SchoolClass[];
  classOptions: Array<{ value: string; label: string }>;
  editingClassId?: string;
  docRows: DocRow[];
  onDocRowsChange: (rows: DocRow[]) => void;
  error?: string;
  submitting: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export function AdminStudentFormPanel({
  mode,
  editing,
  classes,
  classOptions,
  editingClassId = "",
  docRows,
  onDocRowsChange,
  error,
  submitting,
  onSubmit,
  onClose,
}: AdminStudentFormPanelProps) {
  const isCreate = mode === "create";

  return (
    <article className="overflow-hidden rounded-2xl border border-brand-blue/20 bg-white shadow-sm">
      <header className="flex items-start justify-between gap-3 border-b border-neutral-100 bg-brand-blue/5 px-4 py-3 sm:px-5">
        <div>
          <p className="text-xs font-semibold text-brand-blue">
            {isCreate ? "إضافة طالب" : "تعديل بيانات طالب"}
          </p>
          <h2 className="mt-0.5 text-base font-bold text-p-black sm:text-lg">
            {isCreate ? "طالب جديد" : editing?.name}
          </h2>
          {!isCreate && editing?.studentNumber ? (
            <p className="mt-1 text-xs text-p-black/50" dir="ltr">
              #{editing.studentNumber}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="rounded-lg p-1.5 text-p-black/45 hover:bg-white hover:text-p-black"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="space-y-4 p-4 sm:p-5">
        {error ? <Alert variant="error">{error}</Alert> : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <FormSection
            title="البيانات الأساسية"
            description="اسم الطالب والفصل الدراسي المسجّل فيه."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="اسم الطالب"
                name="name"
                defaultValue={editing?.name}
                required
              />

              {classes.length === 0 ? (
                <div className="sm:col-span-2 rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center text-sm text-neutral-500">
                  لا توجد فصول مسجّلة.{" "}
                  <Link href="/admin/classes" className="font-semibold text-brand-blue hover:underline">
                    أضف الفصول أولاً
                  </Link>
                </div>
              ) : (
                <Select
                  label="الفصل والشعبة"
                  name="classId"
                  options={classOptions}
                  defaultValue={isCreate ? "" : editingClassId}
                  required
                />
              )}

              {!isCreate && editing?.studentNumber ? (
                <Input
                  label="رقم الطالب"
                  name="studentNumber"
                  defaultValue={editing.studentNumber}
                  readOnly
                  className="bg-neutral-50 sm:col-span-2"
                />
              ) : null}
            </div>
          </FormSection>

          {isCreate ? (
            <FormSection
              title="الوثائق (اختياري)"
              description="يمكنك إرفاق وثائق عند التسجيل أو إضافتها لاحقاً من صفحة الوثائق."
            >
              <div className="mb-2 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5 px-3 py-1.5 text-xs"
                  onClick={() => onDocRowsChange([...docRows, { name: "", file: null }])}
                >
                  <Plus className="h-3.5 w-3.5" />
                  إضافة وثيقة
                </Button>
              </div>
              <div className="space-y-3">
                {docRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-neutral-100 bg-neutral-50/80 p-3"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        label={`اسم الوثيقة ${docRows.length > 1 ? idx + 1 : ""}`.trim()}
                        value={row.name}
                        onChange={(e) =>
                          onDocRowsChange(
                            docRows.map((r, i) =>
                              i === idx ? { ...r, name: e.target.value } : r
                            )
                          )
                        }
                        placeholder="مثال: شهادة ميلاد"
                      />
                      <FileUploadField
                        compact
                        label="الملف"
                        preset="any"
                        buttonText="اختيار ملف"
                        selectedFileName={row.file?.name ?? null}
                        onChange={(files) => {
                          const f = files?.[0] ?? null;
                          onDocRowsChange(
                            docRows.map((r, i) => (i === idx ? { ...r, file: f } : r))
                          );
                        }}
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap justify-end gap-2">
                      {row.file ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-2 py-1 text-xs text-neutral-500"
                          onClick={() =>
                            onDocRowsChange(
                              docRows.map((r, i) => (i === idx ? { ...r, file: null } : r))
                            )
                          }
                        >
                          إزالة الملف
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="ghost"
                        className="px-2 py-1 text-xs text-p-red"
                        onClick={() => onDocRowsChange(docRows.filter((_, i) => i !== idx))}
                        disabled={docRows.length <= 1}
                      >
                        حذف الصف
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="flex items-center gap-1.5 text-xs text-p-black/45">
                <FileText className="h-3.5 w-3.5" />
                الوثائق تُحفظ مع ملف الطالب ويمكن إدارتها لاحقاً.
              </p>
            </FormSection>
          ) : null}

          <div className="flex flex-col-reverse gap-2 border-t border-neutral-100 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={submitting || classes.length === 0}>
              {submitting
                ? "جاري الحفظ..."
                : isCreate
                  ? "حفظ الطالب"
                  : "حفظ التعديلات"}
            </Button>
          </div>
        </form>
      </div>
    </article>
  );
}
