"use client";

import { useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Textarea } from "@/components/atoms/Textarea";
import { FileUploadField } from "@/components/molecules/FileUploadField";
import { isHomeworkMissed } from "@/components/parent/HomeworkWindowBanner";
import { SubjectMetaGrid } from "@/components/parent/ParentSubjectItemCard";
import {
  attachmentLabel,
  isImageAttachment,
  resolveMediaUrl,
} from "@/lib/media";
import type { Homework, HomeworkSubmission } from "@/types";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Download,
  FileText,
  Paperclip,
  User,
} from "lucide-react";

function windowBadge(hw: Homework, submission?: HomeworkSubmission) {
  if (submission) return null;
  if (hw.windowStatus === "scheduled") return <Badge variant="warning">لم يبدأ بعد</Badge>;
  if (hw.windowStatus === "ended" || hw.windowStatus === "closed") {
    return <Badge variant="danger">منتهٍ</Badge>;
  }
  return <Badge variant="success">نشط</Badge>;
}

import { formatDisplayDateTime } from "@/lib/dateDisplay";

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h4 className="mb-2.5 text-xs font-bold text-p-black/50">{title}</h4>
      {children}
    </section>
  );
}

function InfoChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-neutral-50 px-3 py-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-orange shadow-sm">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-p-black/45">{label}</p>
        <p className="truncate text-sm font-semibold text-p-black">{value}</p>
      </div>
    </div>
  );
}

function AttachmentBlock({
  url,
  name,
}: {
  url?: string | null;
  name?: string | null;
}) {
  const resolved = resolveMediaUrl(url);
  if (!resolved) return null;

  const fileName = attachmentLabel(resolved, name);
  const isImage = isImageAttachment(resolved, fileName);

  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
      {isImage ? (
        <a href={resolved} target="_blank" rel="noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolved}
            alt={fileName}
            className="max-h-64 w-full rounded-lg border border-neutral-200 bg-white object-contain"
          />
        </a>
      ) : (
        <div className="flex items-center gap-3 rounded-lg bg-white p-3">
          <FileText className="h-8 w-8 shrink-0 text-brand-blue" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-900">{fileName}</p>
            <p className="text-xs text-neutral-500">ملف مرفق</p>
          </div>
        </div>
      )}
      <a
        href={resolved}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:underline"
      >
        {isImage ? <Paperclip className="h-4 w-4" /> : <Download className="h-4 w-4" />}
        {isImage ? "فتح بحجم كامل" : "تحميل"}
      </a>
    </div>
  );
}

export function ParentHomeworkCard({
  hw,
  submission,
  canSubmit,
  onSubmit,
}: {
  hw: Homework;
  submission?: HomeworkSubmission;
  canSubmit?: boolean;
  onSubmit?: (data: { content: string; attachment: File | null }) => Promise<void>;
}) {
  const [openSubmit, setOpenSubmit] = useState(false);
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const missed = isHomeworkMissed(hw, submission);
  const endAt = hw.endAt || hw.dueDate;
  const canEditSubmission = Boolean(canSubmit);

  const attachments =
    hw.attachments?.length
      ? hw.attachments
      : hw.attachmentUrl
        ? [{ id: "0", url: hw.attachmentUrl, name: hw.attachmentName || "مرفق" }]
        : [];

  function openSubmitForm() {
    setContent(submission?.content?.trim() ?? "");
    setAttachment(null);
    setOpenSubmit(true);
  }

  function closeSubmitForm() {
    setOpenSubmit(false);
    setContent("");
    setAttachment(null);
  }

  async function handleSubmit() {
    const hasText = Boolean(content.trim());
    const hasNewFile = Boolean(attachment);
    const hasExistingFile = Boolean(submission?.attachmentUrl);
    if (!onSubmit || (!hasText && !hasNewFile && !hasExistingFile)) return;
    setSaving(true);
    try {
      await onSubmit({ content: content.trim(), attachment });
      closeSubmitForm();
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <header className="flex flex-wrap items-center gap-2 border-b border-neutral-100 bg-neutral-50/60 px-3 py-3 sm:px-4">
        {submission ? (
          <Badge variant="success">
            <CheckCircle2 className="me-1 inline h-3 w-3" />
            مُسلّم
          </Badge>
        ) : (
          windowBadge(hw, submission)
        )}
        {hw.subject && <Badge variant="default">{hw.subject}</Badge>}
      </header>

      <div className="space-y-4 px-3 py-4 sm:space-y-5 sm:px-4 sm:py-5">
        {missed && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-bold text-red-700">فائت</p>
              <p className="text-xs text-red-600">انتهى موعد التسليم دون تسليم.</p>
            </div>
          </div>
        )}

        <Section title="مواعيد الواجب">
          <SubjectMetaGrid
            items={[
              { label: "البداية", dateTime: hw.startAt ?? hw.dueDate },
              { label: "النهاية", dateTime: endAt },
            ]}
          />
        </Section>

        {(hw.teacherName || hw.className) && (
          <Section title="معلومات">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {hw.teacherName && (
                <InfoChip icon={User} label="المعلم" value={hw.teacherName} />
              )}
              {hw.className && (
                <InfoChip icon={BookOpen} label="الفصل" value={hw.className} />
              )}
            </div>
          </Section>
        )}

        <Section title="تعليمات الواجب">
          {hw.description?.trim() ? (
            <p className="whitespace-pre-wrap rounded-xl bg-neutral-50 px-3 py-3 text-sm leading-relaxed text-p-black/80">
              {hw.description}
            </p>
          ) : (
            <p className="text-sm text-p-black/45">لا توجد تعليمات نصية.</p>
          )}
        </Section>

        {attachments.length > 0 && (
          <Section title="مرفقات الواجب">
            <div className="space-y-2">
              {attachments.map((att) => (
                <AttachmentBlock key={att.id} url={att.url} name={att.name} />
              ))}
            </div>
          </Section>
        )}

        {submission && (
          <Section title="تسليمك">
            <div className="space-y-3 rounded-xl border border-p-green/20 bg-p-green/5 p-3 sm:p-4">
              {submission.content?.trim() && (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-p-black/80">
                  {submission.content}
                </p>
              )}
              <AttachmentBlock
                url={submission.attachmentUrl}
                name={submission.attachmentName}
              />
              {submission.gradesVisible && submission.score != null && (
                <p className="text-sm font-bold text-p-green">
                  العلامة: {submission.score}/{hw.maxScore ?? submission.maxScore ?? 100}
                </p>
              )}
              {submission.gradesVisible && submission.teacherNote && (
                <p className="text-sm text-p-black/70">
                  ملاحظة المعلم: {submission.teacherNote}
                </p>
              )}
              <p className="text-xs text-p-black/45">
                {canEditSubmission
                  ? `آخر تحديث: ${formatDisplayDateTime(submission.submittedAt)}`
                  : `سُلّم: ${formatDisplayDateTime(submission.submittedAt)}`}
              </p>
            </div>
          </Section>
        )}

        {canEditSubmission && !openSubmit && (
          <Button className="w-full sm:w-auto" onClick={openSubmitForm}>
            {submission ? "تعديل التسليم" : "تسليم الواجب"}
          </Button>
        )}

        {canEditSubmission && openSubmit && (
          <Section title={submission ? "تعديل التسليم" : "تسليم الواجب"}>
            <div className="space-y-3 rounded-xl border border-neutral-100 bg-neutral-50/50 p-3 sm:p-4">
              <p className="text-sm text-p-black/60">
                {submission
                  ? "يمكنك التعديل حتى نهاية الموعد. أضف نصاً أو مرفقاً (أو كليهما)."
                  : "أضف نصاً أو مرفقاً على الأقل لإرسال التسليم."}
              </p>
              <Textarea
                label="الإجابة (اختياري مع مرفق)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="اكتب إجابتك هنا..."
              />
              <FileUploadField
                label="مرفق التسليم"
                preset="image-pdf"
                buttonText="اضغط لرفع صورة أو ملف"
                hint="اختياري إذا كتبت نصاً"
                selectedFileName={attachment?.name ?? null}
                onChange={(files) => setAttachment(files?.[0] ?? null)}
              />
              {submission?.attachmentUrl && !attachment && (
                <p className="text-xs text-p-black/45">
                  المرفق الحالي يُحتفظ به ما لم ترفع ملفاً جديداً.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={
                    saving ||
                    (!content.trim() && !attachment && !submission?.attachmentUrl)
                  }
                >
                  {saving ? "جاري الحفظ..." : submission ? "حفظ التعديلات" : "إرسال التسليم"}
                </Button>
                <Button variant="ghost" onClick={closeSubmitForm}>
                  إلغاء
                </Button>
              </div>
            </div>
          </Section>
        )}
      </div>
    </article>
  );
}
