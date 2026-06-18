"use client";

import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { ClassSelect, getSelectedClassIds } from "@/components/teacher/ClassSelect";
import type { SubjectAnnouncement } from "@/types";
import type { SchoolClass } from "@/types/teacher";

export type AnnouncementFormData = {
  classIds?: string[];
  subject: string;
  title: string;
  body: string;
};

export function buildAnnouncementPayload(
  data: AnnouncementFormData,
  options?: { applyToGroup?: boolean; syncClasses?: boolean }
) {
  const payload: Record<string, unknown> = {
    subject: data.subject,
    title: data.title,
    body: data.body,
  };
  if (data.classIds?.length) {
    payload.classIds = data.classIds;
    if (options?.syncClasses) payload.syncClasses = true;
  }
  if (options?.applyToGroup) payload.applyToGroup = true;
  return payload;
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

export function AnnouncementForm({
  initial,
  classes,
  subjects = [],
  showClassSelect = false,
  defaultSelected,
  embedded = false,
  onSubmit,
  onCancel,
}: {
  initial?: SubjectAnnouncement & { targets?: { classId: string }[] };
  classes?: SchoolClass[];
  subjects?: string[];
  showClassSelect?: boolean;
  defaultSelected?: string[];
  embedded?: boolean;
  onSubmit: (data: AnnouncementFormData) => void;
  onCancel: () => void;
}) {
  const selectedClassIds =
    defaultSelected ?? initial?.targets?.map((t) => t.classId) ?? (initial?.classId ? [initial.classId] : undefined);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const classIds = showClassSelect ? getSelectedClassIds(form) : undefined;
    if (showClassSelect && (!classIds || classIds.length === 0)) {
      alert("اختر فصلاً واحداً على الأقل.");
      return;
    }
    onSubmit({
      classIds,
      subject: String(form.get("subject") ?? ""),
      title: String(form.get("title") ?? ""),
      body: String(form.get("body") ?? ""),
    });
  }

  const form = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showClassSelect && classes && classes.length > 0 && (
        <FormSection
          title="الفصول المستهدفة"
          description={
            initial
              ? "يمكنك إضافة أو إزالة الفصول المستهدفة للإعلان."
              : "يُنشأ نسخة من الإعلان لكل فصل تحدده."
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

      <FormSection title="المادة والعنوان" description="يظهر الإعلان ضمن محتوى هذه المادة.">
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
        <Input label="عنوان الإعلان" name="title" required defaultValue={initial?.title} />
      </FormSection>

      <FormSection title="نص الإعلان" description="اكتب ما تريد إبلاغ الطلاب به.">
        <Textarea
          label="المحتوى"
          name="body"
          required
          defaultValue={initial?.body}
          placeholder="مثال: يوم الخميس عطلة رسمية..."
          className="min-h-[140px]"
        />
      </FormSection>

      <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button type="submit" className="w-full sm:w-auto">
          {initial ? "حفظ التعديلات" : "نشر الإعلان"}
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
