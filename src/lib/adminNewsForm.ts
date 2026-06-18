import { appendGalleryToFormData, type GallerySlot } from "@/components/molecules/NewsGalleryEditor";
import { categoryGradients, type NewsCategory, type PublicNewsItem } from "@/types/news";

export const NEWS_IMAGE_ASPECT = 16 / 9;
export const NEWS_IMAGE_SIZE = { width: 1280, height: 720 };

export function isFeaturedChecked(form: FormData) {
  return form.get("featured") === "on";
}

export function buildNewsPayload(form: FormData, includeDate = true) {
  const category = form.get("category") as NewsCategory;
  const payload: Record<string, unknown> = {
    title: String(form.get("title") ?? ""),
    description: String(form.get("description") ?? ""),
    body: String(form.get("description") ?? ""),
    category,
    gradient: categoryGradients[category],
    featured: isFeaturedChecked(form),
  };
  if (includeDate) {
    payload.date = new Date().toISOString().split("T")[0];
  }
  return payload;
}

export function buildNewsFormData(
  form: FormData,
  payload: Record<string, unknown>,
  gallery: GallerySlot[],
  deletedImageIds: string[]
) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    formData.append(key, String(value));
  }
  appendGalleryToFormData(formData, gallery, deletedImageIds);
  return formData;
}

export function hasGalleryChanges(
  gallery: GallerySlot[],
  deletedImageIds: string[],
  editing?: PublicNewsItem | null
) {
  if (gallery.some((slot) => slot.file) || deletedImageIds.length > 0) return true;
  if (!editing) return false;
  const originalCoverId = editing.images?.find((image) => image.isCover)?.id ?? null;
  const currentCoverId = gallery.find((slot) => slot.isCover)?.existingId ?? null;
  return originalCoverId !== currentCoverId;
}
