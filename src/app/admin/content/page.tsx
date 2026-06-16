"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { AdminFeaturedNewsCard } from "@/components/molecules/AdminFeaturedNewsCard";
import { AdminNewsListItem } from "@/components/molecules/AdminNewsListItem";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import {
  appendGalleryToFormData,
  galleryFromNewsItem,
  NewsGalleryEditor,
  type GallerySlot,
} from "@/components/molecules/NewsGalleryEditor";
import { NewsFilterBar } from "@/components/molecules/NewsFilterBar";
import { PageHeader } from "@/components/molecules/PageHeader";
import { api } from "@/lib/api";
import { cropImageToFile } from "@/lib/imageCrop";
import {
  categoryGradients,
  mapNewsItem,
  type NewsCategory,
  type NewsFilter,
  type PublicNewsItem,
} from "@/types/news";
import { Plus, X } from "lucide-react";
import Cropper from "react-easy-crop";

const NEWS_IMAGE_ASPECT = 16 / 9;
const NEWS_IMAGE_SIZE = { width: 1280, height: 720 };

function isFeaturedChecked(form: FormData) {
  return form.get("featured") === "on";
}

function applyFeaturedState(items: PublicNewsItem[], item: PublicNewsItem) {
  if (!item.featured) return items;
  return items.map((n) => ({ ...n, featured: n.id === item.id }));
}

export default function AdminContentPage() {
  const [news, setNews] = useState<PublicNewsItem[]>([]);
  const [filter, setFilter] = useState<NewsFilter>("الكل");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PublicNewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [gallery, setGallery] = useState<GallerySlot[]>([]);
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
  const [confirmDeleteNews, setConfirmDeleteNews] = useState<PublicNewsItem | null>(null);
  const [deletingNews, setDeletingNews] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const scrollToFormRef = useRef(false);

  useEffect(() => {
    api.getAdminNews()
      .then((data) => {
        const mapped = (data as Array<Record<string, unknown>>).map((n) => mapNewsItem(n));
        setNews(mapped);
      })
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === "الكل") return news;
    return news.filter((item) => item.category === filter);
  }, [news, filter]);

  const featured = filtered.find((item) => item.featured) ?? filtered[0];
  const listItems = filtered.filter((item) => item.id !== featured?.id);

  useEffect(() => {
    if (!scrollToFormRef.current || !formRef.current) return;
    if (!editing && !showForm) return;
    formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    scrollToFormRef.current = false;
  }, [editing, showForm]);

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

  function revokeGalleryPreviews(slots: GallerySlot[]) {
    slots.forEach((slot) => {
      if (slot.file && slot.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(slot.previewUrl);
      }
    });
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

  function openCreateForm() {
    setEditing(null);
    setShowForm(true);
    setGallery([]);
    setDeletedImageIds([]);
    setError("");
  }

  function openEditForm(item: PublicNewsItem) {
    setShowForm(false);
    setEditing(item);
    setGallery(galleryFromNewsItem(item.images ?? []));
    setDeletedImageIds([]);
    setError("");
    scrollToFormRef.current = true;
  }

  function closeForm() {
    revokeGalleryPreviews(gallery.filter((slot) => slot.file));
    setShowForm(false);
    setEditing(null);
    setGallery([]);
    setDeletedImageIds([]);
    setError("");
    cancelCrop();
  }

  function buildNewsFormData(form: FormData, payload: Record<string, unknown>) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(payload)) {
      formData.append(key, String(value));
    }
    appendGalleryToFormData(formData, gallery, deletedImageIds);
    return formData;
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const formEl = e.currentTarget;
    const form = new FormData(formEl);

    try {
      const category = form.get("category") as NewsCategory;
      const payload = {
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? ""),
        body: String(form.get("description") ?? ""),
        date: new Date().toISOString().split("T")[0],
        category,
        gradient: categoryGradients[category],
        featured: isFeaturedChecked(form),
      };

      const hasGalleryChanges = gallery.some((slot) => slot.file) || deletedImageIds.length > 0;
      const created = hasGalleryChanges
        ? ((await api.createAdminNews(buildNewsFormData(form, payload))) as Record<string, unknown>)
        : ((await api.createAdminNews(payload)) as Record<string, unknown>);
      const item = mapNewsItem(created);
      setNews((prev) => applyFeaturedState([item, ...prev], item));
      closeForm();
      formEl.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حفظ الخبر");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setError("");
    setSubmitting(true);

    const form = new FormData(e.currentTarget);

    try {
      const category = form.get("category") as NewsCategory;
      const hasImage = Boolean(imageFile);
      const payload = {
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? ""),
        body: String(form.get("description") ?? ""),
        category,
        gradient: categoryGradients[category],
        featured: isFeaturedChecked(form),
      };

      const hasGalleryChanges =
        gallery.some((slot) => slot.file) ||
        deletedImageIds.length > 0 ||
        (() => {
          const originalCoverId = editing.images?.find((image) => image.isCover)?.id ?? null;
          const currentCoverId = gallery.find((slot) => slot.isCover)?.existingId ?? null;
          return originalCoverId !== currentCoverId;
        })();

      const updated = hasGalleryChanges
        ? ((await api.updateAdminNewsImage(
            editing.id,
            buildNewsFormData(form, payload)
          )) as Record<string, unknown>)
        : ((await api.updateAdminNews(editing.id, payload)) as Record<string, unknown>);

      const item = mapNewsItem(updated);
      setNews((prev) =>
        applyFeaturedState(
          prev.map((n) => (n.id === editing.id ? item : n)),
          item
        )
      );
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تحديث الخبر");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    await api.deleteAdminNews(id);
    setNews((prev) => prev.filter((n) => n.id !== id));
    if (editing?.id === id) closeForm();
  }

  function requestDeleteNews(id: string) {
    const item = news.find((n) => n.id === id);
    if (!item) return;
    setError("");
    setConfirmDeleteNews(item);
  }

  async function confirmDeleteNewsAction() {
    if (!confirmDeleteNews) return;
    setDeletingNews(true);
    setError("");
    try {
      await handleDelete(confirmDeleteNews.id);
      setConfirmDeleteNews(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حذف الخبر");
    } finally {
      setDeletingNews(false);
    }
  }

  async function handleSetFeatured(id: string) {
    await api.updateAdminNews(id, { featured: true });
    setNews((prev) => prev.map((n) => ({ ...n, featured: n.id === id })));
  }

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  const formOpen = showForm || editing !== null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeader title="إدارة المحتوى" description="الأخبار والفعاليات المعروضة للجمهور" />
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4" />
          خبر جديد
        </Button>
      </div>

      {formOpen && (
        <div ref={formRef} className="mb-6 scroll-mt-24">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-p-black">
              {editing ? "تعديل الخبر" : "إضافة خبر"}
            </h3>
            <button type="button" onClick={closeForm} className="text-neutral-400 hover:text-neutral-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}
          <form
            key={editing?.id ?? "new"}
            onSubmit={editing ? handleUpdate : handleAdd}
            className="grid gap-4 sm:grid-cols-2"
          >
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
            <Textarea
              label="الوصف"
              name="description"
              required
              className="sm:col-span-2"
              defaultValue={editing?.description}
            />
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 sm:col-span-2">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={editing?.featured ?? !news.some((n) => n.featured)}
                className="mt-0.5 rounded text-brand-blue"
              />
              <span className="text-sm text-p-black/80">
                <span className="font-semibold text-p-black">خبر مميز</span>
                <span className="mt-1 block text-xs text-neutral-500">
                  يظهر الخبر بشكل كبير في المقدمة. عند تفعيله على خبر جديد يُلغى تمييز الخبر المميز السابق.
                </span>
              </span>
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "جاري الحفظ..." : editing ? "حفظ التعديلات" : "حفظ"}
              </Button>
            </div>
          </form>
        </Card>
        </div>
      )}

      {news.length === 0 ? (
        <Card className="text-center text-neutral-500">لا توجد أخبار. أضف خبراً جديداً.</Card>
      ) : (
        <>
          <NewsFilterBar filter={filter} onChange={setFilter} />

          <div className="mt-8 flex flex-col gap-8 lg:grid lg:grid-cols-5 lg:gap-10">
            <div className="lg:col-span-3">
              {featured && (
                <AdminFeaturedNewsCard
                  item={featured}
                  onEdit={openEditForm}
                  onDelete={requestDeleteNews}
                />
              )}
            </div>
            <div className="space-y-4 lg:col-span-2">
              {listItems.map((item) => (
                <AdminNewsListItem
                  key={item.id}
                  item={item}
                  onEdit={openEditForm}
                  onDelete={requestDeleteNews}
                  onSetFeatured={handleSetFeatured}
                />
              ))}
            </div>
          </div>
        </>
      )}

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

      <ConfirmDialog
        open={Boolean(confirmDeleteNews)}
        title="تأكيد حذف الخبر"
        description={
          <>
            هل أنت متأكد من حذف الخبر{" "}
            <span className="font-semibold">{confirmDeleteNews?.title}</span>؟ لا يمكن التراجع عن هذا
            الإجراء.
          </>
        }
        loading={deletingNews}
        error={confirmDeleteNews ? error : undefined}
        onCancel={() => {
          setError("");
          setConfirmDeleteNews(null);
        }}
        onConfirm={confirmDeleteNewsAction}
      />
    </div>
  );
}
