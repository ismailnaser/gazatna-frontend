import type { SubjectMaterial } from "@/types";

export type MaterialTarget = {
  id: string;
  classId: string;
  className?: string;
};

export type MaterialGroup = SubjectMaterial & {
  groupId: string;
  targets: MaterialTarget[];
};

export function groupMaterialList(items: SubjectMaterial[]): MaterialGroup[] {
  const map = new Map<string, SubjectMaterial[]>();

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

export const MATERIAL_CATEGORY_OPTIONS = [
  { value: "book", label: "كتاب / كتيب" },
  { value: "slides", label: "سلايدات" },
  { value: "resources", label: "مصادر" },
  { value: "other", label: "أخرى" },
] as const;
