"use client";

import { useRef, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import {
  galleryFromNewsItem,
  NewsGalleryEditor,
  type GallerySlot,
} from "@/components/molecules/NewsGalleryEditor";
import { api } from "@/lib/api";
import {
  buildNewsFormData,
  buildNewsPayload,
  hasGalleryChanges,
  NEWS_IMAGE_ASPECT,
  NEWS_IMAGE_SIZE,
} from "@/lib/adminNewsForm";
import { cropImageToFile } from "@/lib/imageCrop";
import { mapNewsItem, type PublicNewsItem } from "@/types/news";
import { ImageIcon, Newspaper, Save, Sparkles, Type } from "lucide-react";
import Cropper from "react-easy-crop";

type AdminNewsFormProps = {
  editing?: PublicNewsItem | null;
  hasFeaturedNews?: boolean;
  onCancel: () => void;
  onSaved: (item: PublicNewsItem) => void;
};

function revokeGalleryPreviews(slots: GallerySlot[]) {
  slots.forEach((slot) => {
    if (slot.file && slot.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(slot.previewUrl);
    }
  });
}

export function AdminNewsForm({
  editing = null,
  hasFeaturedNews = false,
  onCancel,
  onSaved,
}: AdminNewsFormProps) {
  const isEdit = Boolean(editing);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [gallery, setGallery] = useState<GallerySlot[]>(() =>
    editing ? galleryFromNewsItem(editing.images ?? []) : []
  );
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState("news.jpg");
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
  const [cropPixels, setCropPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [cropping, setCropping] = useState(false);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setCropFileName(file.name || "news.jpg");
    setCropZoom(1);
    setCropPos({ x: 0, y: 0 });
    setCropPixels(null);
    setCropImageUrl(url);
    setCropOpen(true);
    e.target.value = "";
  }

  async function applyCrop() {
    if (!cropImageUrl || !cropPixels) return;
    setCropping(true);
    try {
      const cropped = await cropImageToFile(
        cropImageUrl,
        cropPixels,
        cropFileName,
        NEWS_IMAGE_SIZE
      );
      const previewUrl = URL.createObjectURL(cropped);
      const key = `new-${Date.now()}`;
      setGallery((prev) => {
        const next: GallerySlot[] = [
          ...prev,
          { key, file: cropped, previewUrl, isCover: prev.length === 0 },
        ];
        if (prev.length > 0 && !next.some((slot) => slot.isCover)) {
          next[0] = { ...next[0], isCover: true };
        }
        return next;
      });
      setCropOpen(false);
      URL.revokeObjectURL(cropImageUrl);
      setCropImageUrl(null);
    } catch {
      setError("فشل قص الصورة");
    } finally {
      setCropping(false);
    }
  }

  function cancelCrop() {
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    setCropImageUrl(null);
    setCropOpen(false);
  }

  function setCoverImage(key: string) {
    setGallery((prev) => prev.map((slot) => ({ ...slot, isCover: slot.key === key })));
  }

  function removeGallerySlot(key: string) {
    setGallery((prev) => {
      const target = prev.find((slot) => slot.key === key);
      if (!target) return prev;
      if (target.existingId) {
        setDeletedImageIds((ids) => [...ids, target.existingId!]);
      }
      if (target.file && target.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const next = prev.filter((slot) => slot.key !== key);
      if (target.isCover && next.length > 0) {
        next[0] = { ...next[0], isCover: true };
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const formEl = e.currentTarget;
    const form = new FormData(formEl);

    try {
      const payload = buildNewsPayload(form, !isEdit);
      const galleryChanged = hasGalleryChanges(gallery, deletedImageIds, editing);

      let raw: Record<string, unknown>;
      if (isEdit && editing) {
        raw = galleryChanged
          ? ((await api.updateAdminNewsImage(
              editing.id,
              buildNewsFormData(form, payload, gallery, deletedImageIds)
            )) as Record<string, unknown>)
          : ((await api.updateAdminNews(editing.id, payload)) as Record<string, unknown>);
      } else {
        raw = galleryChanged
          ? ((await api.createAdminNews(
              buildNewsFormData(form, payload, gallery, deletedImageIds)
            )) as Record<string, unknown>)
          : ((await api.createAdminNews(payload)) as Record<string, unknown>);
      }

      revokeGalleryPreviews(gallery.filter((slot) => slot.file));
      onSaved(mapNewsItem(raw));
      if (!isEdit) formEl.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : isEdit ? "فشل تحديث الخبر" : "فشل حفظ الخبر");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <Alert variant="error">{error}</Alert>
        )}

        <Card className="overflow-hidden p-0">
          <div className="border-b border-neutral-100 bg-gradient-to-br from-brand-blue/5 to-indigo-50 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                <Type className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold text-p-black">المعلومات الأساسية</h3>
                <p className="text-xs text-p-black/50">العنوان والتصنيف الظاهر للزوار</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <Input
              label="العنوان"
              name="title"
              required
              className="sm:col-span-2"
              defaultValue={editing?.title}
            />
            <Select
              label="التصنيف"
              name="category"
              defaultValue={editing?.category ?? "أخبار"}
              options={[
                { value: "أخبار", label: "أخبار" },
                { value: "فعاليات", label: "فعاليات" },
                { value: "إنجازات", label: "إنجازات" },
              ]}
            />
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-neutral-100 bg-gradient-to-br from-violet-500/5 to-purple-50 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
                <ImageIcon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold text-p-black">صور الخبر</h3>
                <p className="text-xs text-p-black/50">غلاف رئيسي وصور إضافية لصفحة التفاصيل</p>
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <NewsGalleryEditor
              gallery={gallery}
              onAddClick={() => imageInputRef.current?.click()}
              onSetCover={setCoverImage}
              onRemove={removeGallerySlot}
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label="إضافة صورة للخبر"
              onChange={handleImageChange}
            />
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-neutral-100 bg-gradient-to-br from-p-green/5 to-emerald-50 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-p-green/10 text-p-green">
                <Newspaper className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold text-p-black">نص الخبر</h3>
                <p className="text-xs text-p-black/50">الوصف المختصر المعروض في القائمة وصفحة الخبر</p>
              </div>
            </div>
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            <Textarea
              label="الوصف"
              name="description"
              required
              rows={6}
              defaultValue={editing?.description}
            />
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={editing?.featured ?? !hasFeaturedNews}
                className="mt-0.5 rounded text-brand-blue"
              />
              <span className="text-sm text-p-black/80">
                <span className="inline-flex items-center gap-1.5 font-semibold text-p-black">
                  <Sparkles className="h-3.5 w-3.5 text-brand-orange" />
                  خبر مميز
                </span>
                <span className="mt-1 block text-xs text-neutral-500">
                  يظهر الخبر بشكل بارز في المقدمة. عند تفعيله يُلغى تمييز الخبر المميز السابق.
                </span>
              </span>
            </label>
          </div>
        </Card>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            إلغاء
          </Button>
          <Button type="submit" disabled={submitting} className="sm:min-w-[160px]">
            <Save className="h-4 w-4" />
            {submitting ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "نشر الخبر"}
          </Button>
        </div>
      </form>

      {cropOpen && cropImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={cancelCrop}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-neutral-100 px-5 py-4">
              <p className="text-base font-bold text-p-black">قص صورة الخبر</p>
              <p className="mt-1 text-sm text-neutral-500">
                حرّك الصورة وكبّرها لتحديد الإطار. سيتم حفظها بأبعاد{" "}
                {NEWS_IMAGE_SIZE.width}×{NEWS_IMAGE_SIZE.height} بكسل.
              </p>
            </div>

            <div className="relative h-[360px] bg-black">
              <Cropper
                image={cropImageUrl}
                crop={cropPos}
                zoom={cropZoom}
                aspect={NEWS_IMAGE_ASPECT}
                onCropChange={setCropPos}
                onZoomChange={setCropZoom}
                onCropComplete={(_, pixels) => setCropPixels(pixels)}
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
                value={cropZoom}
                onChange={(e) => setCropZoom(Number(e.target.value))}
                className="w-full"
              />

              <div className="mt-4 flex flex-wrap justify-end gap-3">
                <Button type="button" variant="outline" onClick={cancelCrop}>
                  إلغاء
                </Button>
                <Button type="button" onClick={applyCrop} disabled={cropping || !cropPixels}>
                  {cropping ? "جاري القص..." : "تطبيق القص"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
