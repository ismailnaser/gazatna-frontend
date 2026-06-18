"use client";

import Link from "next/link";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { ExpandableText } from "@/components/molecules/ExpandableText";
import { cn } from "@/lib/utils";
import { submissionGradePath } from "@/lib/teacherHomeworkGrading";
import type { HomeworkSubmission } from "@/types";
import { CheckCircle2, Clock, Paperclip, Pencil } from "lucide-react";

import { formatMetaDate } from "@/lib/dateDisplay";

function studentInitial(name?: string) {
  const trimmed = (name ?? "").trim();
  return trimmed ? trimmed.charAt(0) : "?";
}

function SubmissionStatus({
  graded,
  score,
  maxScore,
}: {
  graded: boolean;
  score?: number | null;
  maxScore: number;
}) {
  if (graded) {
    return (
      <Badge variant="success">
        <CheckCircle2 className="me-1 inline h-3 w-3" />
        {score}/{maxScore}
      </Badge>
    );
  }

  return (
    <Badge variant="warning">
      <Clock className="me-1 inline h-3 w-3" />
      بانتظار التقييم
    </Badge>
  );
}

export function HomeworkSubmissionsGradeList({
  submissions,
  maxScore,
  className,
}: {
  submissions: HomeworkSubmission[];
  maxScore: number;
  className?: string;
}) {
  if (submissions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/60 px-4 py-8 text-center text-sm text-p-black/50">
        لا تسليمات في هذا الفصل.
      </div>
    );
  }

  return (
    <div className={cn("-mx-3 overflow-x-auto sm:mx-0", className)}>
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50 text-p-black/55">
            <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4 sm:py-3">
              الطالب
            </th>
            <th className="min-w-[140px] px-3 py-2.5 text-start text-xs font-bold sm:min-w-[180px] sm:px-4 sm:py-3">
              التسليم
            </th>
            <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4 sm:py-3">
              الحالة
            </th>
            <th className="w-24 px-3 py-2.5 text-start text-xs font-bold sm:w-28 sm:px-4 sm:py-3">
              إجراء
            </th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub, index) => {
            const graded = sub.score != null;
            const { date: whenDate, time: whenTime } = formatMetaDate(sub.submittedAt);
            const whenText = whenTime ? `${whenDate} · ${whenTime}` : whenDate;

            return (
              <tr
                key={sub.id}
                className={cn(
                  "border-b border-neutral-50 last:border-0",
                  index % 2 === 1 && "bg-neutral-50/40"
                )}
              >
                <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-[11px] font-bold text-brand-orange sm:h-8 sm:w-8 sm:text-xs">
                      {studentInitial(sub.studentName)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-p-black">{sub.studentName ?? "طالب"}</p>
                      <p className="mt-0.5 text-[11px] text-p-black/45 sm:text-xs" dir="ltr">
                        {whenText}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                  {sub.content?.trim() ? (
                    <ExpandableText maxLines={2} className="text-xs text-p-black/70">
                      {sub.content}
                    </ExpandableText>
                  ) : (
                    <span className="text-xs text-p-black/35">—</span>
                  )}
                  {sub.attachmentUrl && (
                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-brand-blue sm:text-xs">
                      <Paperclip className="h-3 w-3" />
                      مرفق
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                  <SubmissionStatus graded={graded} score={sub.score} maxScore={maxScore} />
                </td>
                <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                  <Link href={submissionGradePath(sub.homeworkId, sub.id)}>
                    <Button variant="outline" className="gap-1 px-2.5 py-1.5 text-[11px] sm:gap-1.5 sm:px-3 sm:py-2 sm:text-xs">
                      {graded ? (
                        <>
                          <Pencil className="h-3.5 w-3.5" />
                          تعديل
                        </>
                      ) : (
                        "تقييم"
                      )}
                    </Button>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function HomeworkSubmissionsGradeListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="-mx-3 overflow-x-auto sm:mx-0">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50 text-p-black/55">
            <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4 sm:py-3">
              الطالب
            </th>
            <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4 sm:py-3">
              التسليم
            </th>
            <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4 sm:py-3">
              الحالة
            </th>
            <th className="px-3 py-2.5 text-start text-xs font-bold sm:px-4 sm:py-3">
              إجراء
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, index) => (
            <tr
              key={index}
              className={cn(
                "border-b border-neutral-50 last:border-0",
                index % 2 === 1 && "bg-neutral-50/40"
              )}
            >
              <td className="px-3 py-3 sm:px-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-neutral-200 sm:h-8 sm:w-8" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="h-3.5 w-24 animate-pulse rounded bg-neutral-200" />
                    <div className="h-3 w-20 animate-pulse rounded bg-neutral-100" />
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 sm:px-4">
                <div className="space-y-1.5">
                  <div className="h-3 w-full max-w-[160px] animate-pulse rounded bg-neutral-200" />
                  <div className="h-3 w-2/3 max-w-[120px] animate-pulse rounded bg-neutral-100" />
                </div>
              </td>
              <td className="px-3 py-3 sm:px-4">
                <div className="h-6 w-24 animate-pulse rounded-full bg-neutral-200" />
              </td>
              <td className="px-3 py-3 sm:px-4">
                <div className="h-8 w-16 animate-pulse rounded-xl bg-neutral-200" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
