"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { ClassSelect, getSelectedClassIds } from "@/components/teacher/ClassSelect";
import { NumberFieldWithKeypad } from "@/components/teacher/NumberFieldWithKeypad";
import { FileUploadField } from "@/components/molecules/FileUploadField";
import type { Homework, HomeworkAttachmentItem } from "@/types";
import type { SchoolClass } from "@/types/teacher";
import { Paperclip, Trash2, X } from "lucide-react";

export type HomeworkFormData = {
  classIds?: string[];
  subject: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  gradesVisible: boolean;
  maxScore: number;
  status: Homework["status"];
  attachments?: File[];
  removeAttachmentIds?: string[];
};

function toInputDatetime(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function buildHomeworkFormData(
  data: HomeworkFormData,
  initial?: Homework,
  options?: { applyToGroup?: boolean; syncClasses?: boolean }
): FormData {
  const fd = new FormData();
  if (data.classIds?.length) {
    for (const id of data.classIds) fd.append("classIds", id);
    if (options?.syncClasses) fd.append("syncClasses", "true");
  } else if (initial?.classId) {
    fd.append("classId", initial.classId);
  }
  fd.append("subject", data.subject);
  fd.append("title", data.title);
  fd.append("description", data.description);
  fd.append("startAt", new Date(data.startAt).toISOString());
  fd.append("endAt", new Date(data.endAt).toISOString());
  fd.append("dueDate", data.endAt.slice(0, 10));
  fd.append("gradesVisible", data.gradesVisible ? "true" : "false");
  fd.append("maxScore", String(data.maxScore));
  fd.append("status", data.status);
  if (options?.applyToGroup) fd.append("applyToGroup", "true");
  for (const file of data.attachments ?? []) {
    fd.append("attachments", file);
  }
  for (const id of data.removeAttachmentIds ?? []) {
    fd.append("removeAttachmentIds", id);
  }
  return fd;
}

function initialAttachments(initial?: Homework): HomeworkAttachmentItem[] {
  if (initial?.attachments?.length) return initial.attachments;
  if (initial?.attachmentUrl) {
    return [
      {
        id: `legacy-${initial.id}`,
        url: initial.attachmentUrl,
        name: initial.attachmentName || "مرفق",
      },
    ];
  }
  return [];
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

export function HomeworkForm({
  initial,
  classes,
  subjects = [],
  showClassSelect = false,
  defaultSelected,
  embedded = false,
  onSubmit,
  onCancel,
}: {
  initial?: Homework;
  classes?: SchoolClass[];
  subjects?: string[];
  showClassSelect?: boolean;
  defaultSelected?: string[];
  embedded?: boolean;
  onSubmit: (data: HomeworkFormData) => void;
  onCancel: () => void;
}) {
  const defaultEnd = initial?.endAt
    ? toInputDatetime(initial.endAt)
    : toInputDatetime(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
  const defaultStart = initial?.startAt
    ? toInputDatetime(initial.startAt)
    : toInputDatetime(new Date().toISOString());

  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [keptExisting, setKeptExisting] = useState<HomeworkAttachmentItem[]>(() =>
    initialAttachments(initial)
  );
  const [maxScore, setMaxScore] = useState(String(initial?.maxScore ?? 100));

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

  const form = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const classIds = showClassSelect ? getSelectedClassIds(form) : undefined;
        if (showClassSelect && (!classIds || classIds.length === 0)) {
          alert("اختر فصلاً واحداً على الأقل.");
          return;
        }
        const startAt = String(form.get("startAt") ?? "");
        const endAt = String(form.get("endAt") ?? "");
        if (!startAt || !endAt) {
          alert("حدد وقت البداية والنهاية.");
          return;
        }
        if (new Date(endAt) <= new Date(startAt)) {
          alert("وقت النهاية يجب أن يكون بعد وقت البداية.");
          return;
        }
        const maxScore = Number(form.get("maxScore") ?? 100);
        if (!Number.isFinite(maxScore) || maxScore <= 0) {
          alert("حدد علامة كاملة صحيحة للواجب.");
          return;
        }
        const initialIds = new Set(initialAttachments(initial).map((a) => a.id));
        const removeAttachmentIds = [...initialIds].filter(
          (id) => !id.startsWith("legacy-") && !keptExisting.some((a) => a.id === id)
        );
        onSubmit({
          classIds,
          subject: String(form.get("subject") ?? ""),
          title: String(form.get("title") ?? ""),
          description: String(form.get("description") ?? ""),
          startAt,
          endAt,
          maxScore,
          gradesVisible: form.get("gradesVisible") === "on",
          status: form.get("status") as Homework["status"],
          attachments: newFiles,
          removeAttachmentIds: removeAttachmentIds.length ? removeAttachmentIds : undefined,
        });
      }}
      className="space-y-4"
    >
      {showClassSelect && classes && classes.length > 0 && (
        <FormSection
          title="الفصول المستهدفة"
          description={
            initial
              ? "يمكنك إضافة أو إزالة الفصول. لا يمكن إزالة فصل فيه تسليمات."
              : "يُنشأ نسخة من الواجب لكل فصل تحدده."
          }
        >
          <ClassSelect
            classes={classes}
            multiple
            defaultSelected={defaultSelected}
            defaultValue={!defaultSelected?.length ? initial?.classId : undefined}
          />
        </FormSection>
      )}

      <FormSection title="المادة والمحتوى" description="ما الذي يُطلب من الطالب؟">
        <Select
          label="المادة"
          name="subject"
          required
          defaultValue={initial?.subject ?? subjects[0] ?? ""}
          options={
            subjects.length
              ? subjects.map((s) => ({ value: s, label: s }))
              : [{ value: "عام", label: "عام" }]
          }
        />
        <Input label="عنوان الواجب" name="title" required defaultValue={initial?.title} />
        <Textarea
          label="تعليمات الواجب"
          name="description"
          required
          defaultValue={initial?.description}
          placeholder="اشرح المطلوب من الطالب بوضوح..."
        />
      </FormSection>

      <FormSection
        title="مواعيد التسليم"
        description="يفتح الواجب تلقائياً عند البداية ويُغلق عند النهاية."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="يبدأ في"
            name="startAt"
            type="datetime-local"
            required
            defaultValue={defaultStart}
          />
          <Input
            label="ينتهي في"
            name="endAt"
            type="datetime-local"
            required
            defaultValue={defaultEnd}
          />
        </div>
      </FormSection>

      <FormSection title="التقييم والإعدادات">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumberFieldWithKeypad
            fieldId="maxScore"
            label="العلامة الكاملة"
            name="maxScore"
            value={maxScore}
            onChange={setMaxScore}
            min={1}
            max={1000}
            allowDecimal
            maxDecimalPlaces={1}
            required
          />
          <Select
            label="الحالة"
            name="status"
            defaultValue={initial?.status ?? "active"}
            options={[
              { value: "active", label: "نشط (حسب الموعد)" },
              { value: "closed", label: "مغلق يدوياً" },
            ]}
          />
        </div>
        <label className="flex items-start gap-2.5 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-3 text-sm text-p-black/80">
          <input
            type="checkbox"
            name="gradesVisible"
            defaultChecked={initial?.gradesVisible}
            className="mt-0.5 rounded text-brand-blue"
          />
          <span>إظهار العلامة والملاحظة للطالب بعد التقييم</span>
        </label>
      </FormSection>

      <FormSection title="المرفقات" description="صور أو PDF — اختياري">
        <FileUploadField
          label="إضافة ملفات"
          preset="image-pdf"
          buttonText="اضغط لإضافة ملفات"
          multiple
          selectedCount={newFiles.length || undefined}
          onChange={(files) => addFiles(files)}
        />

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
                {!att.id.startsWith("legacy-") && (
                  <button
                    type="button"
                    onClick={() => removeExisting(att)}
                    className="rounded-lg p-1.5 text-p-red hover:bg-p-red/10"
                    aria-label="حذف المرفق"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
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
      </FormSection>

      <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button type="submit" className="w-full sm:w-auto">
          {initial ? "حفظ التعديلات" : "إنشاء الواجب"}
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
