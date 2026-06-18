import { api } from "@/lib/api";
import type { TeacherAssessmentItem } from "@/types";

export async function loadHomeworkGradingBundle(
  homeworkId: string
): Promise<TeacherAssessmentItem | null> {
  const items = (await api.getTeacherAssessments()) as TeacherAssessmentItem[];
  return (
    items.find(
      (row) =>
        row.homework.id === homeworkId ||
        row.groupId === homeworkId ||
        row.targets.some((target) => target.id === homeworkId)
    ) ?? null
  );
}

export function homeworkGradePath(homeworkId: string) {
  return `/teacher/homework/${homeworkId}/grade`;
}

export function submissionGradePath(homeworkId: string, submissionId: string) {
  return `/teacher/homework/${homeworkId}/grade/${submissionId}`;
}
