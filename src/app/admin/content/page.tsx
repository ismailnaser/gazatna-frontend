"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { PageHeader } from "@/components/molecules/PageHeader";
import { mockNews } from "@/data/mock";
import type { NewsItem } from "@/types";
import { Pencil, Plus, Trash2 } from "lucide-react";

export default function AdminContentPage() {
  const [news, setNews] = useState<NewsItem[]>([...mockNews]);
  const [showForm, setShowForm] = useState(false);

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const item: NewsItem = {
      id: `n${Date.now()}`,
      title: form.get("title") as string,
      body: form.get("body") as string,
      date: form.get("date") as string,
      gradient: "from-[#064E3B] to-[#0d6b4f]",
    };
    setNews((prev) => [item, ...prev]);
    setShowForm(false);
    e.currentTarget.reset();
  }

  function handleDelete(id: string) {
    setNews((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeader title="إدارة المحتوى" description="الأخبار والفعاليات في الصفحة الرئيسية" />
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          إضافة خبر
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleAdd} className="space-y-4">
            <Input label="العنوان" name="title" required />
            <Textarea label="نص الخبر" name="body" required />
            <Input label="تاريخ الفعالية" name="date" type="date" required />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-p-black/80">صورة</label>
              <input type="file" accept="image/*" className="text-sm" />
            </div>
            <Button type="submit">نشر</Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {news.map((item) => (
          <Card key={item.id} className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-p-black">{item.title}</h3>
              <p className="mt-1 text-xs text-p-black/50">{item.date}</p>
              <p className="mt-2 text-sm text-p-black/60">{item.body}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="px-3 py-1.5 text-xs">
                <Pencil className="h-3 w-3" />
                تعديل
              </Button>
              <Button
                variant="danger"
                className="px-3 py-1.5 text-xs"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="h-3 w-3" />
                حذف
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
