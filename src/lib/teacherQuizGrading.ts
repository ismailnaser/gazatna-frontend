import { api } from "@/lib/api";
import type { TeacherQuizGradingItem } from "@/types";

export async function loadQuizGradingBundle(
  quizId: string
): Promise<TeacherQuizGradingItem | null> {
  try {
    const data = (await api.getTeacherQuizGradingBundle(quizId)) as TeacherQuizGradingItem;
    const match =
      data.quiz.id === quizId ||
      data.groupId === quizId ||
      data.targets.some((target) => target.id === quizId);
    return match ? data : null;
  } catch {
    return null;
  }
}

export function quizGradePath(quizId: string) {
  return `/teacher/quizzes/${quizId}/grade`;
}

export function quizSubmissionGradePath(quizId: string, submissionId: string) {
  return `/teacher/quizzes/${quizId}/grade/${submissionId}`;
}

export function formatQuizAnswer(
  question: { questionType?: string; options?: string[] },
  answer: unknown
): string {
  const type = question.questionType ?? "choice";
  if (type === "choice" || type === "true_false") {
    if (typeof answer === "number" && answer >= 0) {
      return question.options?.[answer] ?? String(answer);
    }
    return "—";
  }
  if (type === "term" || type === "essay") {
    return typeof answer === "string" && answer.trim() ? answer : "(بدون نص)";
  }
  if (type === "matching") {
    if (typeof answer === "object" && answer !== null && !Array.isArray(answer)) {
      return Object.entries(answer as Record<string, string>)
        .map(([left, right]) => `${left} → ${right}`)
        .join(" | ");
    }
    return "—";
  }
  return answer != null ? String(answer) : "—";
}

export function isManualQuizQuestion(type?: string) {
  return type === "term" || type === "essay";
}
