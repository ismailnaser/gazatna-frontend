"use client";

import Link from "next/link";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { ExpandableText } from "@/components/molecules/ExpandableText";
import { CollapsibleChipList } from "@/components/molecules/CollapsibleChipList";
import type { MaterialGroup } from "@/lib/materialGroups";
import { BookOpen, FolderOpen, Paperclip, Pencil, Trash2 } from "lucide-react";

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

export function TeacherMaterialGroupCard({
  group,
  onDelete,
}: {
  group: MaterialGroup;
  onDelete: () => void;
}) {
  const when = formatCreatedAt(group.createdAt);
  const fileCount = group.attachments?.length ?? 0;

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <div className="h-1 bg-p-green" aria-hidden />

      <header className="flex flex-wrap items-center gap-2 border-b border-neutral-100 bg-neutral-50/60 px-3 py-2.5 sm:px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-p-green/10 text-p-green">
          <FolderOpen className="h-4 w-4" />
        </span>
        <span className="text-xs font-bold text-p-black/55">مرفق</span>
        <Badge variant="info">{group.categoryLabel ?? group.category}</Badge>
        {group.subject && <Badge variant="default">{group.subject}</Badge>}
      </header>

      <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
        <div>
          <h3 className="text-base font-bold leading-snug text-p-black sm:text-lg">{group.title}</h3>
          {group.description?.trim() && (
            <ExpandableText maxLines={2} className="mt-1.5 text-sm text-p-black/65">
              {group.description}
            </ExpandableText>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <MetaChip icon={BookOpen} label="الفصول" value={group.targets.length} />
          <MetaChip icon={Paperclip} label="الملفات" value={fileCount} />
        </div>

        <div className="rounded-xl bg-neutral-50 px-3 py-2">
          <p className="text-[11px] text-p-black/45">تاريخ الإضافة</p>
          <p className="mt-0.5 text-sm font-bold leading-snug text-p-black">{when.date}</p>
          {when.time && <p className="text-xs font-medium text-p-black/70">{when.time}</p>}
        </div>

        {fileCount > 0 && (
          <ul className="space-y-1.5">
            {group.attachments!.slice(0, 3).map((att) => (
              <li
                key={att.id}
                className="flex items-center gap-2 truncate rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2 text-xs text-p-black/70"
              >
                <Paperclip className="h-3.5 w-3.5 shrink-0 text-p-green" />
                <span className="truncate">{att.name}</span>
              </li>
            ))}
            {fileCount > 3 && (
              <li className="text-xs text-p-black/45">+{fileCount - 3} ملفات أخرى</li>
            )}
          </ul>
        )}

        {group.targets.length > 1 && (
          <CollapsibleChipList
            items={group.targets.map((target) => target.className ?? "فصل")}
          />
        )}

        <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
          <Link href={`/teacher/materials/edit/${group.id}`} className="flex-1 sm:flex-none">
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
