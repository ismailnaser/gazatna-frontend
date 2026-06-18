"use client";

import Link from "next/link";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import { quizSubmissionGradePath } from "@/lib/teacherQuizGrading";
import type { QuizSubmission } from "@/types";
import { CheckCircle2, Clock, Pencil } from "lucide-react";

function formatSubmittedAt(value: string) {
  return new Date(value).toLocaleString("ar-PS", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function QuizSubmissionsGradeList({
  submissions,
  maxScore,
  className,
}: {
  submissions: QuizSubmission[];
  maxScore: number;
  className?: string;
}) {
  if (submissions.length === 0) {
    return <p className="text-sm text-neutral-500">لا تسليمات في هذا الفصل.</p>;
  }

  return (
    <div className={cn("overflow-x-auto rounded-xl border border-neutral-100 bg-white", className)}>
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50 text-xs text-p-black/60">
            <th className="px-3 py-2 text-start font-semibold">الطالب</th>
            <th className="px-3 py-2 text-start font-semibold">المحاولة</th>
            <th className="px-3 py-2 text-start font-semibold">الوقت</th>
            <th className="px-3 py-2 text-start font-semibold">الحالة</th>
            <th className="w-28 px-3 py-2 text-start font-semibold">إجراء</th>
          </tr>
        </thead>
        <tbody>
          {[...submissions]
            .sort((a, b) => {
              const nameCmp = (a.studentName ?? "").localeCompare(b.studentName ?? "", "ar");
              if (nameCmp !== 0) return nameCmp;
              return (a.attemptNumber ?? 0) - (b.attemptNumber ?? 0);
            })
            .map((sub) => {
            const graded = sub.fullyGraded === true;
            const pending = sub.needsManualGrading === true;
            const hasScore = sub.score != null;
            return (
              <tr key={sub.id} className="border-b border-neutral-50 last:border-0">
                <td className="px-3 py-2">
                  <p className="font-medium text-p-black">{sub.studentName ?? "طالب"}</p>
                </td>
                <td className="px-3 py-2 text-xs text-p-black/60">
                  {sub.attemptNumber ?? 1}
                  {sub.isBestAttempt && (
                    <Badge variant="info" className="ms-1">
                      الأعلى
                    </Badge>
                  )}
                </td>
                <td className="px-3 py-2 text-xs text-p-black/50">
                  {formatSubmittedAt(sub.submittedAt)}
                </td>
                <td className="px-3 py-2">
                  {pending ? (
                    <Badge variant="warning">
                      <Clock className="me-1 inline h-3 w-3" />
                      بانتظار التصحيح اليدوي
                    </Badge>
                  ) : hasScore ? (
                    <Badge variant="success">
                      <CheckCircle2 className="me-1 inline h-3 w-3" />
                      {sub.score}/{maxScore}
                    </Badge>
                  ) : graded ? (
                    <Badge variant="success">
                      <CheckCircle2 className="me-1 inline h-3 w-3" />
                      مُقيَّم
                    </Badge>
                  ) : (
                    <Badge variant="success">
                      <CheckCircle2 className="me-1 inline h-3 w-3" />
                      مُسلّم
                    </Badge>
                  )}
                </td>
                <td className="px-3 py-2">
                  <Link href={quizSubmissionGradePath(sub.quizId, sub.id)}>
                    <Button variant="outline" className="px-2.5 py-1.5 text-xs">
                      {pending ? (
                        "تقييم"
                      ) : (
                        <>
                          <Pencil className="h-3.5 w-3.5" />
                          تعديل
                        </>
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
