import type { Quiz, QuizSubmission } from "@/types";

export function pickBestQuizSubmission(
  attempts: QuizSubmission[]
): QuizSubmission | undefined {
  if (!attempts.length) return undefined;
  return attempts.reduce((best, cur) => {
    const bestScore = best.score ?? -1;
    const curScore = cur.score ?? -1;
    if (curScore > bestScore) return cur;
    if (
      curScore === bestScore &&
      (cur.attemptNumber ?? 0) > (best.attemptNumber ?? 0)
    ) {
      return cur;
    }
    return best;
  });
}

export function quizAttemptsForStudent(
  submissions: QuizSubmission[],
  quizId: string,
  studentId: string
) {
  return submissions.filter(
    (s) => s.quizId === quizId && s.studentId === studentId
  );
}

export function quizCanRetake(quiz: Quiz) {
  return Boolean(quiz.canRetake);
}

export function quizAttemptLabel(quiz: Quiz) {
  const max = quiz.maxAttempts ?? 1;
  const used = quiz.attemptCount ?? 0;
  if (max <= 1) return null;
  const remaining = quiz.attemptsRemaining ?? Math.max(0, max - used);
  return `محاولة ${used}/${max} — متبقي ${remaining}`;
}
