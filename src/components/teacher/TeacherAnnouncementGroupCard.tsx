"use client";

import Link from "next/link";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { CollapsibleChipList } from "@/components/molecules/CollapsibleChipList";
import type { AnnouncementGroup } from "@/lib/announcementGroups";
import { ACADEMIC_DESCRIPTION_CLASS } from "@/lib/expandableText";
import { BookOpen, Megaphone, Pencil, Trash2 } from "lucide-react";

function formatCreatedAt(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return { date: "—", time: "" };
  return {
    date: parsed.toLocaleDateString("ar-PS", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    time: parsed.toLocaleTimeString("ar-PS", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function MetaChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-p-black/45" />
      <div className="min-w-0">
        <p className="text-[11px] text-p-black/45">{label}</p>
        <p className="text-sm font-semibold text-p-black">{value}</p>
      </div>
    </div>
  );
}

export function TeacherAnnouncementGroupCard({
  group,
  onDelete,
}: {
  group: AnnouncementGroup;
  onDelete: () => void;
}) {
  const when = formatCreatedAt(group.createdAt);

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <div className="h-1 bg-amber-500" aria-hidden />

      <header className="flex flex-wrap items-center gap-2 border-b border-neutral-100 bg-neutral-50/60 px-3 py-2.5 sm:px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <Megaphone className="h-4 w-4" />
        </span>
        <span className="text-xs font-bold text-p-black/55">إعلان</span>
        {group.subject && <Badge variant="default">{group.subject}</Badge>}
      </header>

      <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
        <div>
          <h3 className="text-base font-bold leading-snug text-p-black sm:text-lg">{group.title}</h3>
          {group.body?.trim() && (
            <p className={ACADEMIC_DESCRIPTION_CLASS}>{group.body}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <MetaChip icon={BookOpen} label="الفصول" value={group.targets.length} />
          <div className="rounded-xl bg-neutral-50 px-3 py-2">
            <p className="text-[11px] text-p-black/45">تاريخ النشر</p>
            <p className="mt-0.5 text-sm font-bold leading-snug text-p-black">{when.date}</p>
            {when.time && <p className="text-xs font-medium text-p-black/70">{when.time}</p>}
          </div>
        </div>

        {group.targets.length > 1 && (
          <CollapsibleChipList
            items={group.targets.map((target) => target.className ?? "فصل")}
          />
        )}

        <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
          <Link href={`/teacher/announcements/edit/${group.id}`} className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full gap-1.5 px-3 py-2 text-xs sm:text-sm">
              <Pencil className="h-4 w-4" />
              تعديل
            </Button>
          </Link>
          <Button
            variant="danger"
            className="gap-1.5 px-3 py-2 text-xs sm:text-sm"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            حذف
          </Button>
        </div>
      </div>
    </article>
  );
}
