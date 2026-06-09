"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { AdminFeaturedNewsCard } from "@/components/molecules/AdminFeaturedNewsCard";
import { AdminNewsListItem } from "@/components/molecules/AdminNewsListItem";
import { NewsFilterBar } from "@/components/molecules/NewsFilterBar";
import { PageHeader } from "@/components/molecules/PageHeader";
import {
  newsItems as initialNews,
  type NewsCategory,
  type NewsFilter,
  type NewsItem,
} from "@/data/home";
import { Plus } from "lucide-react";

const categoryGradients: Record<NewsCategory, string> = {
  أخبار: "from-[#064E3B] to-[#0d6b4f]",
  فعاليات: "from-[#1a1a1a] to-[#404040]",
  إنجازات: "from-[#881337] to-[#9f1239]",
};

export default function AdminContentPage() {
  const [news, setNews] = useState<NewsItem[]>([...initialNews]);
  const [filter, setFilter] = useState<NewsFilter>("الكل");
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "الكل") return news;
    return news.filter((item) => item.category === filter);
  }, [news, filter]);

  const featured = filtered.find((item) => item.featured) ?? filtered[0];
  const listItems = filtered.filter((item) => item.id !== featured?.id);

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const category = form.get("category") as NewsCategory;
    const isFeatured = form.get("featured") === "on";

    const item: NewsItem = {
      id: `n${Date.now()}`,
      title: form.get("title") as string,
      description: form.get("description") as string,
      date: form.get("date") as string,
      category,
      gradient: categoryGradients[category],
      featured: isFeatured,
    };

    setNews((prev) => {
      const updated = isFeatured
        ? prev.map((n) => ({ ...n, featured: false }))
        : prev;
      return [item, ...updated];
    });
    setShowForm(false);
    e.currentTarget.reset();
  }

  function handleDelete(id: string) {
    setNews((prev) => prev.filter((n) => n.id !== id));
  }

  function handleSetFeatured(id: string) {
    setNews((prev) =>
      prev.map((n) => ({ ...n, featured: n.id === id }))
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="إدارة المحتوى"
          description="إدارة الأخبار والفعاليات المعروضة في الصفحة الرئيسية"
        />
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          إضافة خبر
        </Button>
      </div>

      <div className="mb-6">
        <NewsFilterBar filter={filter} onChange={setFilter} />
      </div>

      {showForm && (
        <Card className="mb-8">
          <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
            <Input label="العنوان" name="title" required className="sm:col-span-2" />
            <Textarea
              label="نص الخبر"
              name="description"
              required
              className="sm:col-span-2"
            />
            <Input label="التاريخ" name="date" type="date" required />
            <Select
              label="التصنيف"
              name="category"
              options={[
                { value: "أخبار", label: "أخبار" },
                { value: "فعاليات", label: "فعاليات" },
                { value: "إنجازات", label: "إنجازات" },
              ]}
            />
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-[#1a1a1a]/80">
                صورة
              </label>
              <input type="file" accept="image/*" className="text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm text-[#1a1a1a]/80 sm:col-span-2">
              <input type="checkbox" name="featured" className="rounded" />
              عرض كخبر مميز في الصفحة الرئيسية
            </label>
            <div className="sm:col-span-2">
              <Button type="submit">نشر</Button>
            </div>
          </form>
        </Card>
      )}

      {filtered.length === 0 ? (
        <Card className="text-center text-[#1a1a1a]/50">
          لا توجد أخبار في هذا التصنيف
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
          <div className="order-2 space-y-4 lg:order-1 lg:col-span-2">
            {listItems.map((item) => (
              <AdminNewsListItem
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onSetFeatured={handleSetFeatured}
              />
            ))}
          </div>

          <div className="order-1 lg:order-2 lg:col-span-3">
            {featured && (
              <AdminFeaturedNewsCard item={featured} onDelete={handleDelete} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
