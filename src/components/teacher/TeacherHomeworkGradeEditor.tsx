"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SaveFeedback } from "@/components/molecules/SaveFeedback";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Textarea } from "@/components/atoms/Textarea";
import { ScoreFieldWithKeypad } from "@/components/teacher/ScoreFieldWithKeypad";
import { homeworkGradePath } from "@/lib/teacherHomeworkGrading";
import {
  attachmentLabel,
  isImageAttachment,
  resolveMediaUrl,
} from "@/lib/media";
import { api } from "@/lib/api";
import { validateFinalScore } from "@/lib/scoreInput";
import type { Homework, HomeworkSubmission } from "@/types";
import { ChevronRight, Download, FileText, Save } from "lucide-react";

export function TeacherHomeworkGradeEditor({
  homework,
  submission,
  overviewHomeworkId,
  onSaved,
}: {
  homework: Homework;
  submission: HomeworkSubmission;
  overviewHomeworkId: string;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const maxScore = homework.maxScore ?? submission.maxScore ?? 100;
  const isEdit = submission.score != null;

  const [score, setScore] = useState(submission.score != null ? String(submission.score) : "");
  const [note, setNote] = useState(submission.teacherNote ?? "");
  const [scoreFieldActive, setScoreFieldActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const attachmentUrl = resolveMediaUrl(submission.attachmentUrl);
  const attachmentName = attachmentLabel(attachmentUrl, submission.attachmentName);

  async function handleSave() {
    setError("");
    setSuccess("");
    const validationError = validateFinalScore(score, maxScore);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    try {
      await api.gradeTeacherHomeworkSubmission(submission.homeworkId, submission.id, {
        score: score === "" ? null : Number(score),
        teacherNote: note,
      });
      setSuccess("تم حفظ التقييم بنجاح");
      onSaved?.();
      window.setTimeout(() => {
        router.push(homeworkGradePath(overviewHomeworkId));
      }, 1200);
    } catch {
      setError("تعذر حفظ التقييم");
    } finally {
      setSaving(false);
    }
  }

  function handleConfirm(): boolean {
    const validationError = validateFinalScore(score, maxScore);
    if (validationError) {
      setError(validationError);
      return false;
    }
    setError("");
    return true;
  }

  return (
    <div>
      <Link
        href={homeworkGradePath(overviewHomeworkId)}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
      >
        <ChevronRight className="h-4 w-4" />
        العودة لقائمة التسليمات
      </Link>

      <div className="mb-4">
        <p className="text-sm text-p-black/50">{homework.subject || "عام"}</p>
        <h1 className="text-xl font-bold text-p-black">{homework.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="default">{submission.studentName ?? "طالب"}</Badge>
          {submission.className && <Badge variant="default">{submission.className}</Badge>}
          <span className="text-xs text-p-black/45">
            سُلّم: {new Date(submission.submittedAt).toLocaleString("ar-PS")}
          </span>
        </div>
      </div>

      <SaveFeedback success={success} error={error} className="mb-4" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-bold text-p-black">تسليم الطالب</h2>
          {submission.content?.trim() ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-p-black/80">
              {submission.content}
            </p>
          ) : (
            <p className="text-sm text-neutral-500">لا يوجد نص في التسليم.</p>
          )}

          {attachmentUrl && (
            <div className="mt-4 rounded-xl border border-neutral-100 bg-neutral-50 p-3">
              <p className="mb-2 text-xs font-semibold text-neutral-500">مرفق التسليم</p>
              {isImageAttachment(attachmentUrl, attachmentName) ? (
                <a href={attachmentUrl} target="_blank" rel="noreferrer" className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachmentUrl}
                    alt={attachmentName}
                    className="max-h-64 w-full rounded-lg border border-neutral-200 object-contain"
                  />
                </a>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-5 w-5 text-brand-blue" />
                  <span className="truncate">{attachmentName}</span>
                </div>
              )}
              <a
                href={attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
              >
                <Download className="h-3.5 w-3.5" />
                فتح المرفق
              </a>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-bold text-p-black">
            {isEdit ? "تعديل التقييم" : "وضع التقييم"}
          </h2>
          <div className="space-y-4">
            <ScoreFieldWithKeypad
              active={scoreFieldActive}
              onActivate={() => setScoreFieldActive(true)}
              onDeactivate={() => setScoreFieldActive(false)}
              value={score}
              onChange={setScore}
              maxScore={maxScore}
              inputLabel={`العلامة (من ${maxScore})`}
              keypadLabel="علامة الواجب"
              onConfirm={handleConfirm}
              confirmLabel="تأكيد الدرجة"
            />
            <Textarea
              label="ملاحظة المعلم"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ملاحظة اختيارية للطالب..."
            />
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "حفظ التقييم وإظهار العلامة"}
            </Button>
            <SaveFeedback success={success} error={error} scrollIntoView />
            <Link href={homeworkGradePath(overviewHomeworkId)}>
              <Button variant="ghost">إلغاء</Button>
            </Link>
            <p className="text-xs text-p-black/45">أدخل الدرجة ثم احفظ التقييم من الزر أعلاه.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
