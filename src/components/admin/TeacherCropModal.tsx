"use client";

import { Button } from "@/components/atoms/Button";
import { cropImageToFile } from "@/lib/imageCrop";
import Cropper from "react-easy-crop";

type TeacherCropModalProps = {
  open: boolean;
  imageUrl: string | null;
  zoom: number;
  cropPos: { x: number; y: number };
  cropPixels: { x: number; y: number; width: number; height: number } | null;
  saving?: boolean;
  onZoomChange: (zoom: number) => void;
  onCropChange: (pos: { x: number; y: number }) => void;
  onCropComplete: (pixels: { x: number; y: number; width: number; height: number }) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function TeacherCropModal({
  open,
  imageUrl,
  zoom,
  cropPos,
  cropPixels,
  saving = false,
  onZoomChange,
  onCropChange,
  onCropComplete,
  onCancel,
  onConfirm,
}: TeacherCropModalProps) {
  if (!open || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-neutral-100 px-5 py-4">
          <p className="text-base font-bold text-p-black">قص صورة العضو</p>
          <p className="mt-1 text-sm text-neutral-500">حرّك الصورة وحدد الإطار المربع قبل الحفظ.</p>
        </div>

        <div className="relative h-[360px] bg-black">
          <Cropper
            image={imageUrl}
            crop={cropPos}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={(_, pixels) => onCropComplete(pixels)}
          />
        </div>

        <div className="px-5 py-4">
          <label className="mb-2 block text-sm font-medium text-p-black/80">التكبير</label>
          <input
            aria-label="التكبير"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="mt-4 flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              إلغاء
            </Button>
            <Button type="button" onClick={onConfirm} disabled={saving || !cropPixels}>
              {saving ? "جاري الحفظ..." : "حفظ الصورة"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function cropTeacherImageFile(
  imageUrl: string,
  pixels: { x: number; y: number; width: number; height: number },
  fileName: string
) {
  return cropImageToFile(imageUrl, pixels, fileName);
}
