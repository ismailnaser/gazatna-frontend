import { submissionGradePath } from "@/lib/teacherHomeworkGrading";
import { quizSubmissionGradePath } from "@/lib/teacherQuizGrading";
import type { TeacherAlert } from "@/types";

export function teacherAlertKey(alert: TeacherAlert): string {
  return `${alert.type}-${alert.submissionId}`;
}

export function teacherAlertHref(alert: TeacherAlert): string {
  if (alert.type === "quiz_submission" && alert.quizId) {
    return quizSubmissionGradePath(alert.quizId, alert.submissionId);
  }
  if (alert.type === "homework_submission" && alert.homeworkId) {
    return submissionGradePath(alert.homeworkId, alert.submissionId);
  }
  return alert.type === "quiz_submission" ? "/teacher/quizzes" : "/teacher/homework";
}

export function sortTeacherAlerts(alerts: TeacherAlert[]): TeacherAlert[] {
  return [...alerts].sort((a, b) => {
    if (a.needsGrading !== b.needsGrading) {
      return a.needsGrading ? -1 : 1;
    }
    return b.submittedAt.localeCompare(a.submittedAt);
  });
}

export function countPendingTeacherAlerts(alerts: TeacherAlert[]): number {
  return alerts.filter((a) => a.needsGrading).length;
}

export function countUnreadTeacherAlerts(alerts: TeacherAlert[]): number {
  return alerts.filter((a) => !a.opened).length;
}

export function isTeacherAlertOpened(alert: TeacherAlert): boolean {
  return Boolean(alert.opened);
}
