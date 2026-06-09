"use client";

import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { cn } from "@/lib/utils";
import type { NewsItem } from "@/data/home";
import { Pencil, Star, Trash2 } from "lucide-react";

type AdminNewsListItemProps = {
  item: NewsItem;
  onDelete: (id: string) => void;
  onSetFeatured: (id: string) => void;
};

export function AdminNewsListItem({
  item,
  onDelete,
  onSetFeatured,
}: AdminNewsListItemProps) {
  return (
    <article className="flex gap-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
      <div
        className={cn(
          "h-20 w-20 shrink-0 rounded-xl bg-gradient-to-br sm:h-24 sm:w-24",
          item.gradient
        )}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-bold leading-snug text-[#1a1a1a]">{item.title}</h3>
          <Badge variant="info">{item.category}</Badge>
        </div>
        <p className="text-xs text-[#1a1a1a]/50">{item.date}</p>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="px-3 py-1 text-xs">
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
