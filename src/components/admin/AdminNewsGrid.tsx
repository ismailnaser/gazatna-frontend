"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { NewsCover } from "@/components/molecules/NewsCover";
import type { PublicNewsItem } from "@/types/news";
import { ExpandableText } from "@/components/molecules/ExpandableText";
import { Calendar, Pencil, Sparkles, Star, Trash2 } from "lucide-react";

type AdminNewsGridProps = {
  items: PublicNewsItem[];
  onDelete: (id: string) => void;
  onSetFeatured: (id: string) => void;
};

export function AdminNewsGrid({ items, onDelete, onSetFeatured }: AdminNewsGridProps) {
  const router = useRouter();

  if (items.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-p-black/50">لا توجد أخبار مطابقة للبحث أو الفلتر.</p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all hover:border-brand-blue/20 hover:shadow-md"
        >
          <div className="relative">
            <NewsCover
              imageUrl={item.imageUrl}
              gradient={item.gradient}
              className="h-40 w-full sm:h-44"
            />
            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
              <Badge variant="info">{item.category}</Badge>
              {item.featured ? (
                <Badge variant="success" className="inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  مميز
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="flex flex-1 flex-col p-4">
            <ExpandableText maxLines={2} className="text-base font-bold leading-snug text-p-black">
              {item.title}
            </ExpandableText>
            <ExpandableText maxLines={2} className="mt-2 flex-1 text-sm text-p-black/55">
              {item.description}
            </ExpandableText>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-p-black/45">
              <Calendar className="h-3.5 w-3.5" />
              {item.date}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-50 pt-3">
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 text-xs"
                onClick={() => router.push(`/admin/content/${item.id}/edit`)}
              >
                <Pencil className="h-3.5 w-3.5" />
                تعديل
              </Button>
              {!item.featured && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 flex-1 text-xs"
                  onClick={() => onSetFeatured(item.id)}
                >
                  <Star className="h-3.5 w-3.5" />
                  تمييز
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                className="h-9 text-xs text-p-red hover:text-p-red"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                حذف
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
