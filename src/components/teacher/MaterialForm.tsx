"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { ClassSelect, getSelectedClassIds } from "@/components/teacher/ClassSelect";
import { FileUploadField } from "@/components/molecules/FileUploadField";
import { MATERIAL_CATEGORY_OPTIONS } from "@/lib/materialGroups";
import type { HomeworkAttachmentItem, SubjectMaterial } from "@/types";
import type { SchoolClass } from "@/types/teacher";
import { Paperclip, Trash2, X } from "lucide-react";

export type MaterialFormData = {
  classIds?: string[];
  subject: string;
  title: string;
  description: string;
  category: SubjectMaterial["category"];
  attachments?: File[];
  removeAttachmentIds?: string[];
};

export function buildMaterialFormData(
  data: MaterialFormData,
  options?: { applyToGroup?: boolean; syncClasses?: boolean }
): FormData {
  const fd = new FormData();
  if (data.classIds?.length) {
    for (const id of data.classIds) fd.append("classIds", id);
    if (options?.syncClasses) fd.append("syncClasses", "true");
  }
  fd.append("subject", data.subject);
  fd.append("title", data.title);
  fd.append("description", data.description);
  fd.append("category", data.category);
  if (options?.applyToGroup) fd.append("applyToGroup", "true");
  for (const file of data.attachments ?? []) {
    fd.append("attachments", file);
  }
  for (const id of data.removeAttachmentIds ?? []) {
    fd.append("removeAttachmentIds", id);
  }
  return fd;
}

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
        {description && <p className="mt-0.5 text-xs text-p-black/50">{description}</p>}
      </header>
      <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">{children}</div>
    </section>
  );
}

export function MaterialForm({
  initial,
  classes,
  subjects = [],
  showClassSelect = false,
  defaultSelected,
  embedded = false,
  onSubmit,
  onCancel,
}: {
  initial?: SubjectMaterial & { targets?: { classId: string }[] };
  classes?: SchoolClass[];
  subjects?: string[];
  showClassSelect?: boolean;
  defaultSelected?: string[];
  embedded?: boolean;
  onSubmit: (data: MaterialFormData) => void;
  onCancel: () => void;
}) {
  const selectedClassIds =
    defaultSelected ?? initial?.targets?.map((t) => t.classId) ?? (initial?.classId ? [initial.classId] : undefined);

  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [keptExisting, setKeptExisting] = useState<HomeworkAttachmentItem[]>(
    () => initial?.attachments ?? []
  );

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const picked = Array.from(fileList);
    setNewFiles((prev) => [...prev, ...picked]);
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExisting(att: HomeworkAttachmentItem) {
    setKeptExisting((prev) => prev.filter((a) => a.id !== att.id));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const classIds = showClassSelect ? getSelectedClassIds(form) : undefined;
    if (showClassSelect && (!classIds || classIds.length === 0)) {
      alert("اختر فصلاً واحداً على الأقل.");
      return;
    }
    if (!initial && newFiles.length === 0) {
      alert("يرجى إرفاق ملف واحد على الأقل.");
      return;
    }
    if (initial && newFiles.length === 0 && keptExisting.length === 0) {
      alert("يجب أن يبقى ملف واحد على الأقل.");
      return;
    }
    const initialIds = new Set((initial?.attachments ?? []).map((a) => a.id));
    const removeAttachmentIds = [...initialIds].filter(
      (id) => !keptExisting.some((a) => a.id === id)
    );
    onSubmit({
      classIds,
      subject: String(form.get("subject") ?? ""),
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      category: String(form.get("category") ?? "resources") as SubjectMaterial["category"],
      attachments: newFiles.length ? newFiles : undefined,
      removeAttachmentIds: removeAttachmentIds.length ? removeAttachmentIds : undefined,
    });
  }

  const form = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showClassSelect && classes && classes.length > 0 && (
        <FormSection
          title="الفصول المستهدفة"
          description={
            initial
              ? "يمكنك إضافة أو إزالة الفصول المستهدفة للمرفق."
              : "يُنشأ نسخة من المرفق لكل فصل تحدده."
          }
        >
          <ClassSelect
            classes={classes}
            multiple
            defaultSelected={selectedClassIds}
            defaultValue={!selectedClassIds?.length ? initial?.classId : undefined}
          />
        </FormSection>
      )}

      <FormSection title="المادة والتصنيف" description="يظهر المرفق ضمن محتوى هذه المادة.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            label="المادة"
            name="subject"
            required
            defaultValue={initial?.subject ?? subjects[0] ?? "عام"}
            options={
              subjects.length
                ? subjects.map((s) => ({ value: s, label: s }))
                : [{ value: "عام", label: "عام" }]
            }
          />
          <Select
            label="نوع المرفق"
            name="category"
            required
            defaultValue={initial?.category ?? "resources"}
            options={MATERIAL_CATEGORY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
        </div>
      </FormSection>

      <FormSection title="العنوان والوصف">
        <Input label="عنوان المرفق" name="title" required defaultValue={initial?.title} />
        <Textarea
          label="وصف (اختياري)"
          name="description"
          defaultValue={initial?.description ?? ""}
          placeholder="مثال: سلايدات الفصل الثالث..."
          className="min-h-[100px]"
        />
      </FormSection>

      <FormSection
        title="الملفات المرفقة"
        description="كتاب، سلايدات، PDF، Word، PowerPoint، أو صور."
      >
        {(keptExisting.length > 0 || newFiles.length > 0) && (
          <ul className="space-y-2">
            {keptExisting.map((att) => (
              <li
                key={att.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5 text-sm"
              >
                <a
                  href={att.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 flex-1 items-center gap-2 truncate text-brand-blue hover:underline"
                >
                  <Paperclip className="h-4 w-4 shrink-0" />
                  {att.name}
                </a>
                <button
                  type="button"
                  onClick={() => removeExisting(att)}
                  className="rounded-lg p-1.5 text-p-red hover:bg-p-red/10"
                  aria-label="حذف المرفق"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
            {newFiles.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-2 rounded-xl border border-brand-blue/20 bg-brand-blue/5 px-3 py-2.5 text-sm"
              >
                <span className="flex min-w-0 flex-1 items-center gap-2 truncate text-p-black">
                  <Paperclip className="h-4 w-4 shrink-0 text-brand-blue" />
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeNewFile(index)}
                  className="rounded-lg p-1.5 text-p-black/50 hover:bg-white"
                  aria-label="إزالة"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <FileUploadField
          label="إضافة ملفات"
          preset="documents"
          buttonText="اضغط لإضافة ملفات"
          hint="يمكنك الضغط أكثر من مرة لإضافة عدة ملفات"
          multiple
          selectedCount={newFiles.length || undefined}
          onChange={(files) => addFiles(files)}
        />
      </FormSection>

      <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button type="submit" className="w-full sm:w-auto">
          {initial ? "حفظ التعديلات" : "نشر المرفق"}
        </Button>
        <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  );

  if (embedded) return form;
  return <Card className="mb-6 border-brand-blue/20 p-4 sm:p-5">{form}</Card>;
}
