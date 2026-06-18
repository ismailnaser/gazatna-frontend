"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { ImagePlus, Star, Trash2 } from "lucide-react";

export type GallerySlot = {
  key: string;
  existingId?: string;
  file?: File;
  previewUrl: string;
  isCover: boolean;
};

type NewsGalleryEditorProps = {
  gallery: GallerySlot[];
  onAddClick: () => void;
  onSetCover: (key: string) => void;
  onRemove: (key: string) => void;
};

export function NewsGalleryEditor({
  gallery,
  onAddClick,
  onSetCover,
  onRemove,
}: NewsGalleryEditorProps) {
  return (
    <div className="flex flex-col gap-3 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-medium text-p-black/80">صور الخبر</label>
        <Button
          type="button"
          variant="outline"
          className="border-brand-blue/30 bg-brand-blue/5 px-4 py-2 text-sm font-semibold text-brand-blue hover:bg-brand-blue/10"
          onClick={onAddClick}
        >
          <ImagePlus className="h-5 w-5" />
          اضغط لإضافة صورة
        </Button>
      </div>

      <p className="text-xs text-neutral-500">
        اختر صورة واحدة كغلاف للخبر. باقي الصور تظهر في صفحة تفاصيل الخبر.
      </p>

      {gallery.length === 0 ? (
        <button
          type="button"
          onClick={onAddClick}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-brand-blue/30 bg-brand-blue/5 px-5 py-8 text-center transition-colors hover:border-brand-blue hover:bg-brand-blue/10 sm:flex-row sm:text-start"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-blue/15 text-brand-blue">
            <ImagePlus className="h-7 w-7" />
          </span>
          <span>
            <span className="block text-base font-bold text-p-black">اضغط لإضافة صور الخبر</span>
            <span className="mt-1 block text-xs text-neutral-500">صور JPG أو PNG من جهازك</span>
          </span>
        </button>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {gallery.map((slot) => (
            <div
              key={slot.key}
              className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slot.previewUrl} alt="" className="h-36 w-full object-cover" />
              <div className="flex flex-wrap items-center justify-between gap-2 p-3">
                {slot.isCover ? (
                  <Badge variant="success">غلاف</Badge>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="px-2 py-1 text-xs"
                    onClick={() => onSetCover(slot.key)}
                  >
                    <Star className="h-3.5 w-3.5" />
                    تعيين كغلاف
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  className="px-2 py-1 text-xs text-p-red hover:text-p-red"
                  onClick={() => onRemove(slot.key)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  حذف
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function appendGalleryToFormData(
  formData: FormData,
  gallery: GallerySlot[],
  deletedImageIds: string[]
) {
  const newSlots = gallery.filter((slot) => slot.file);
  newSlots.forEach((slot) => formData.append("galleryImages", slot.file!));

  const cover = gallery.find((slot) => slot.isCover);
  if (cover?.existingId) {
    formData.append("coverImageId", cover.existingId);
  } else if (cover?.file) {
    const index = newSlots.findIndex((slot) => slot.key === cover.key);
    if (index >= 0) formData.append("coverNewIndex", String(index));
  }

  deletedImageIds.forEach((id) => formData.append("deleteImageIds", id));
}

export function galleryFromNewsItem(images: Array<{ id: string | null; url: string; isCover: boolean }>) {
  return images.map((image, index) => ({
    key: image.id ?? `legacy-${index}`,
    existingId: image.id ?? undefined,
    previewUrl: image.url,
    isCover: image.isCover,
  }));
}
