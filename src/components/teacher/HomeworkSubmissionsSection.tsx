"use client";

import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { HomeworkSubmissionsGradeList } from "@/components/teacher/HomeworkSubmissionsGradeList";
import { homeworkGradePath } from "@/lib/teacherHomeworkGrading";
import type { HomeworkSubmission } from "@/types";
import type { HomeworkTarget } from "@/lib/homeworkGroups";
import { ClipboardList } from "lucide-react";

export function HomeworkSubmissionsSection({
  targets,
  getSubmissions,
  primaryHomeworkId,
  maxScore = 100,
}: {
  targets: HomeworkTarget[];
  getSubmissions: (homeworkId: string) => HomeworkSubmission[];
  primaryHomeworkId: string;
  maxScore?: number;
}) {
  const sections = targets.map((target) => ({
    ...target,
    submissions: getSubmissions(target.id),
  }));
  const total = sections.reduce((sum, s) => sum + s.submissions.length, 0);

  if (total === 0) {
    return <p className="text-sm text-neutral-500">لا توجد تسليمات بعد.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-p-black">تسليمات الطلاب ({total})</p>
        <Link href={homeworkGradePath(primaryHomeworkId)}>
          <Button variant="outline" className="px-3 py-1.5 text-xs">
            <ClipboardList className="h-3.5 w-3.5" />
            تقييم التسليمات
          </Button>
        </Link>
      </div>
      {sections.map((section) =>
        section.submissions.length === 0 ? null : (
          <div key={section.id}>
            <p className="mb-2 text-xs font-bold text-p-black/70">{section.className}</p>
            <HomeworkSubmissionsGradeList
              submissions={section.submissions}
              maxScore={maxScore}
            />
          </div>
        )
      )}
    </div>
  );
}
