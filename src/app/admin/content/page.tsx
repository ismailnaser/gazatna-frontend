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
import { NewsFilterBar } from "@/components/molecules/NewsFilterBar";
import { PageHeader } from "@/components/molecules/PageHeader";
import { api } from "@/lib/api";
import {
  categoryGradients,
  mapNewsItem,
  type NewsCategory,
  type NewsFilter,
  type PublicNewsItem,
} from "@/types/news";
import { ImagePlus, Plus, X } from "lucide-react";

export default function AdminContentPage() {
  const [news, setNews] = useState<PublicNewsItem[]>([]);
  const [filter, setFilter] = useState<NewsFilter>("الكل");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PublicNewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
    if (!file) {
      setImagePreview(editing?.imageUrl ?? null);
      return;
    }
    setImagePreview(URL.createObjectURL(file));
  }

  function openCreateForm() {
    setEditing(null);
    setShowForm(true);
    setImagePreview(null);
    setError("");
  }

  function openEditForm(item: PublicNewsItem) {
    setShowForm(false);
    setEditing(item);
    setImagePreview(item.imageUrl ?? null);
    setError("");
    scrollToFormRef.current = true;
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setImagePreview(null);
    setError("");
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const formEl = e.currentTarget;
    const form = new FormData(formEl);

    try {
      const category = form.get("category") as NewsCategory;
      const image = form.get("image");
      const hasImage = image instanceof File && image.size > 0;
      const payload = {
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? ""),
        body: String(form.get("description") ?? ""),
        date: new Date().toISOString().split("T")[0],
        category,
        gradient: categoryGradients[category],
        featured: news.length === 0,
      };

      let created: Record<string, unknown>;
      if (hasImage) {
        const formData = new FormData();
        for (const [key, value] of Object.entries(payload)) {
          formData.append(key, String(value));
        }
        formData.append("image", image);
        created = (await api.createAdminNews(formData)) as Record<string, unknown>;
      } else {
        created = (await api.createAdminNews(payload)) as Record<string, unknown>;
      }
      const item = mapNewsItem(created);
      setNews((prev) => [item, ...prev]);
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
      const image = form.get("image");
      const hasImage = image instanceof File && image.size > 0;
      const payload = {
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? ""),
        body: String(form.get("description") ?? ""),
        category,
        gradient: categoryGradients[category],
      };

      let updated: Record<string, unknown>;
      if (hasImage) {
        const formData = new FormData();
        for (const [key, value] of Object.entries(payload)) {
          formData.append(key, String(value));
        }
        formData.append("image", image);
        updated = (await api.updateAdminNewsImage(editing.id, formData)) as Record<string, unknown>;
      } else {
        updated = (await api.updateAdminNews(editing.id, payload)) as Record<string, unknown>;
      }

      const item = mapNewsItem(updated);
      setNews((prev) => prev.map((n) => (n.id === editing.id ? item : n)));
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
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-p-black/80">صورة الخبر</label>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-sm text-neutral-600 transition-colors hover:border-brand-blue hover:bg-brand-blue/5">
                <ImagePlus className="h-6 w-6 text-brand-blue" />
                <span>{editing ? "تغيير الصورة (اختياري)" : "اضغط لاختيار صورة (اختياري)"}</span>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageChange}
                />
              </label>
              {imagePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="معاينة الصورة"
                  className="mt-2 h-40 w-full rounded-xl object-cover"
                />
              )}
            </div>
            <Textarea
              label="الوصف"
              name="description"
              required
              className="sm:col-span-2"
              defaultValue={editing?.description}
            />
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
                  onDelete={handleDelete}
                />
              )}
            </div>
            <div className="space-y-4 lg:col-span-2">
              {listItems.map((item) => (
                <AdminNewsListItem
                  key={item.id}
                  item={item}
                  onEdit={openEditForm}
                  onDelete={handleDelete}
                  onSetFeatured={handleSetFeatured}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
