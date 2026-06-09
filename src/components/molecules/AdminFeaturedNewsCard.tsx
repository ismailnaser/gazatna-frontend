"use client";

import { Calendar } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import type { NewsItem } from "@/data/home";
import { Pencil, Trash2 } from "lucide-react";

type AdminFeaturedNewsCardProps = {
  item: NewsItem;
  onDelete: (id: string) => void;
};

export function AdminFeaturedNewsCard({ item, onDelete }: AdminFeaturedNewsCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <div className={cn("relative h-56 bg-gradient-to-br sm:h-64 lg:h-72", item.gradient)}>
        <span className="absolute bottom-4 end-4 rounded-full bg-[#881337] px-3 py-1 text-xs font-semibold text-white">
          أخبار المدرسة
        </span>
        <span className="absolute top-4 start-4">
          <Badge variant="success">مميز</Badge>
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant="info">{item.category}</Badge>
        </div>

        <h3 className="text-xl font-bold leading-snug text-[#1a1a1a] sm:text-2xl">
          {item.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[#1a1a1a]/60 sm:text-base">
          {item.description}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm text-[#1a1a1a]/50">
            <Calendar className="h-4 w-4" />
            {item.date}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full px-4 py-2 text-sm">
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
