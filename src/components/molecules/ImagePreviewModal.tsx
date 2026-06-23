"use client";

import { isImageAttachment, resolveMediaUrl } from "@/lib/media";
import { X } from "lucide-react";

type ImagePreviewModalProps = {
  open: boolean;
  src: string | null;
  title?: string;
  fileName?: string | null;
  onClose: () => void;
};

export function ImagePreviewModal({
  open,
  src,
  title,
  fileName,
  onClose,
}: ImagePreviewModalProps) {
  if (!open || !src) return null;

  const resolved = resolveMediaUrl(src) ?? src;
  const showImage = isImageAttachment(src, fileName ?? title);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? "معاينة المرفق"}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3">
          <p className="truncate text-sm font-semibold text-p-black">{title ?? "معاينة المرفق"}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-p-black/60 transition-colors hover:bg-neutral-100 hover:text-p-black"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex max-h-[calc(90vh-3.5rem)] items-center justify-center overflow-auto bg-neutral-50 p-4">
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolved}
              alt={title ?? "معاينة المرفق"}
              className="max-h-[calc(90vh-6rem)] max-w-full rounded-lg object-contain"
            />
          ) : (
            <iframe
              src={resolved}
              title={title ?? "معاينة المرفق"}
              className="h-[calc(90vh-6rem)] w-full rounded-lg border border-neutral-200 bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
}
