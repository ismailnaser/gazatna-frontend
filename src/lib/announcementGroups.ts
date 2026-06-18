import type { SubjectAnnouncement } from "@/types";

export type AnnouncementTarget = {
  id: string;
  classId: string;
  className?: string;
};

export type AnnouncementGroup = SubjectAnnouncement & {
  groupId: string;
  targets: AnnouncementTarget[];
};

export function groupAnnouncementList(items: SubjectAnnouncement[]): AnnouncementGroup[] {
  const map = new Map<string, SubjectAnnouncement[]>();

  for (const item of items) {
    const key = item.groupId ?? item.id;
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }

  return Array.from(map.values())
    .map((rows) => {
      const sorted = [...rows].sort((a, b) =>
        (a.className ?? "").localeCompare(b.className ?? "", "ar")
      );
      const primary = sorted[0];
      return {
        ...primary,
        groupId: primary.groupId ?? primary.id,
        targets: sorted.map((row) => ({
          id: row.id,
          classId: row.classId,
          className: row.className,
        })),
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
