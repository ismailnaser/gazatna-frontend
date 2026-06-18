import type { MatchingPair, QuizQuestion } from "@/types";

export function quizTotalPoints(questions: QuizQuestion[]): number {
  return questions.reduce((sum, q) => sum + (q.points || 1), 0);
}

function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase("ar");
}

function scoreQuestion(question: QuizQuestion, answer: unknown): number {
  const points = question.points || 1;
  if (answer == null || answer === "") return 0;

  const type = question.questionType ?? "choice";

  if (type === "choice" || type === "true_false") {
    if (question.correctIndex == null) return 0;
    return Number(answer) === question.correctIndex ? points : 0;
  }

  if (type === "term") {
    return 0;
  }

  if (type === "essay") {
    return 0;
  }

  if (type === "matching") {
    const pairs = question.pairs ?? [];
    if (!pairs.length) return 0;
    const expected = new Set(
      pairs.map((p) => `${normalizeText(p.left)}::${normalizeText(p.right)}`)
    );
    if (typeof answer === "object" && answer !== null && !Array.isArray(answer)) {
      const student = new Set(
        Object.entries(answer as Record<string, string>).map(
          ([left, right]) => `${normalizeText(left)}::${normalizeText(right)}`
        )
      );
      return student.size === expected.size && [...expected].every((k) => student.has(k))
        ? points
        : 0;
    }
    if (Array.isArray(answer)) {
      const student = new Set(
        (answer as MatchingPair[]).map(
          (p) => `${normalizeText(p.left)}::${normalizeText(p.right)}`
        )
      );
      return student.size === expected.size && [...expected].every((k) => student.has(k))
        ? points
        : 0;
    }
    return 0;
  }

  return 0;
}

export function calculateQuizScore(
  questions: QuizQuestion[],
  answers: unknown[]
): { score: number; maxScore: number } {
  const maxScore = quizTotalPoints(questions);
  const score = questions.reduce(
    (sum, q, i) => sum + scoreQuestion(q, answers[i]),
    0
  );
  return { score, maxScore };
}

export type QuestionReviewStatus = "correct" | "incorrect" | "partial" | "pending" | "manual";

export function getQuestionReviewStatus(
  question: QuizQuestion,
  answer: unknown,
  manualScore?: number | null
): QuestionReviewStatus {
  const type = question.questionType ?? "choice";
  const points = question.points || 1;

  if (type === "essay" || type === "term") {
    if (manualScore != null) {
      if (manualScore >= points) return "correct";
      if (manualScore > 0) return "partial";
      return "incorrect";
    }
    return "pending";
  }

  const earned = scoreQuestion(question, answer);
  if (earned >= points) return "correct";
  if (earned > 0) return "partial";
  return "incorrect";
}

export function formatStudentAnswer(question: QuizQuestion, answer: unknown): string {
  const type = question.questionType ?? "choice";
  if (type === "choice" || type === "true_false") {
    if (typeof answer === "number" && answer >= 0) {
      return question.options?.[answer] ?? "—";
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

export function formatCorrectAnswer(question: QuizQuestion): string {
  const type = question.questionType ?? "choice";
  if (type === "choice" || type === "true_false") {
    if (question.correctIndex != null && question.options?.[question.correctIndex]) {
      return question.options[question.correctIndex];
    }
    return "—";
  }
  if (type === "term") {
    return question.correctText?.trim() || "—";
  }
  if (type === "matching") {
    const pairs = question.pairs ?? [];
    return pairs.map((p) => `${p.left} → ${p.right}`).join(" | ") || "—";
  }
  return "يُقيَّم من المعلم";
}
