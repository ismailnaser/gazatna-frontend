import type { Quiz } from "@/types";

export type QuizTarget = {
  id: string;
  classId: string;
  className?: string;
  submissionCount?: number;
};

export type QuizGroup = Quiz & {
  groupId: string;
  targets: QuizTarget[];
  totalSubmissions: number;
};

export function groupQuizList(items: Quiz[]): QuizGroup[] {
  const map = new Map<string, Quiz[]>();

  for (const quiz of items) {
    const key = quiz.groupId ?? quiz.id;
    const list = map.get(key) ?? [];
    list.push(quiz);
    map.set(key, list);
  }

  return Array.from(map.values())
    .map((rows) => {
      const sorted = [...rows].sort((a, b) =>
        (a.className ?? "").localeCompare(b.className ?? "", "ar")
      );
      const primary = sorted[0];
      const targets: QuizTarget[] = sorted.map((row) => ({
        id: row.id,
        classId: row.classId,
        className: row.className,
        submissionCount: row.submissionCount,
      }));
      const totalSubmissions = targets.reduce((sum, t) => sum + (t.submissionCount ?? 0), 0);

      return {
        ...primary,
        groupId: primary.groupId ?? primary.id,
        targets,
        totalSubmissions,
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
