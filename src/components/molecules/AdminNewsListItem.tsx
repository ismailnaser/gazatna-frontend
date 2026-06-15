"use client";

import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { NewsCover } from "@/components/molecules/NewsCover";
import type { PublicNewsItem } from "@/types/news";
import { Pencil, Star, Trash2 } from "lucide-react";

type AdminNewsListItemProps = {
  item: PublicNewsItem;
  onEdit: (item: PublicNewsItem) => void;
  onDelete: (id: string) => void;
  onSetFeatured: (id: string) => void;
};

export function AdminNewsListItem({
  item,
  onEdit,
  onDelete,
  onSetFeatured,
}: AdminNewsListItemProps) {
  return (
    <article className="flex gap-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
      <NewsCover
        imageUrl={item.imageUrl}
        gradient={item.gradient}
        className="h-20 w-20 shrink-0 rounded-xl sm:h-24 sm:w-24"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-bold leading-snug text-[#1a1a1a]">{item.title}</h3>
          <Badge variant="info">{item.category}</Badge>
        </div>
        <p className="text-xs text-[#1a1a1a]/50">{item.date}</p>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="px-3 py-1 text-xs" onClick={() => onEdit(item)}>
            <Pencil className="h-3 w-3" />
            تعديل
          </Button>
          {!item.featured && (
            <Button
              variant="ghost"
              className="px-3 py-1 text-xs"
              onClick={() => onSetFeatured(item.id)}
            >
              <Star className="h-3 w-3" />
              تمييز
            </Button>
          )}
          <Button
            variant="danger"
            className="px-3 py-1 text-xs"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-3 w-3" />
            حذف
          </Button>
        </div>
      </div>
    </article>
  );
}
