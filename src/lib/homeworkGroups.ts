import type { Homework } from "@/types";

export type HomeworkTarget = {
  id: string;
  classId: string;
  className?: string;
  submissionCount?: number;
};

export type HomeworkGroup = Homework & {
  groupId: string;
  targets: HomeworkTarget[];
  totalSubmissions: number;
};

export function groupHomeworkList(items: Homework[]): HomeworkGroup[] {
  const map = new Map<string, Homework[]>();

  for (const hw of items) {
    const key = hw.groupId ?? hw.id;
    const list = map.get(key) ?? [];
    list.push(hw);
    map.set(key, list);
  }

  return Array.from(map.values())
    .map((rows) => {
      const sorted = [...rows].sort((a, b) =>
        (a.className ?? "").localeCompare(b.className ?? "", "ar")
      );
      const primary = sorted[0];
      const targets: HomeworkTarget[] = sorted.map((row) => ({
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
