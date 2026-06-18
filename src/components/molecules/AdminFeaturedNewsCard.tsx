"use client";

import { Calendar } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { NewsCover } from "@/components/molecules/NewsCover";
import { ExpandableText } from "@/components/molecules/ExpandableText";
import type { PublicNewsItem } from "@/types/news";
import { Pencil, Trash2 } from "lucide-react";

type AdminFeaturedNewsCardProps = {
  item: PublicNewsItem;
  onEdit: (item: PublicNewsItem) => void;
  onDelete: (id: string) => void;
};

export function AdminFeaturedNewsCard({ item, onEdit, onDelete }: AdminFeaturedNewsCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <NewsCover
        imageUrl={item.imageUrl}
        gradient={item.gradient}
        className="h-56 sm:h-64 lg:h-72"
      >
        <span className="absolute bottom-4 end-4 rounded-full bg-[var(--brand-magenta)] px-3 py-1 text-xs font-semibold text-white">
          أخبار المدرسة
        </span>
        <span className="absolute top-4 start-4">
          <Badge variant="success">مميز</Badge>
        </span>
      </NewsCover>

      <div className="p-5 sm:p-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant="info">{item.category}</Badge>
        </div>

        <h3 className="text-xl font-bold leading-snug text-[#1a1a1a] sm:text-2xl">
          {item.title}
        </h3>
        <ExpandableText maxLines={3} className="mt-3 text-sm text-[#1a1a1a]/60 sm:text-base">
          {item.description}
        </ExpandableText>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm text-[#1a1a1a]/50">
            <Calendar className="h-4 w-4" />
            {item.date}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-full px-4 py-2 text-sm"
              onClick={() => onEdit(item)}
            >
              <Pencil className="h-3.5 w-3.5" />
              تعديل
            </Button>
            <Button
              variant="danger"
              className="rounded-full px-4 py-2 text-sm"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              حذف
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
