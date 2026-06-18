"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { AdminNewsForm } from "@/components/admin/AdminNewsForm";
import { PageHeader } from "@/components/molecules/PageHeader";
import { api } from "@/lib/api";
import { mapNewsItem, type PublicNewsItem } from "@/types/news";

export default function AdminEditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id ?? "");
  const [item, setItem] = useState<PublicNewsItem | null>(null);
  const [hasFeaturedNews, setHasFeaturedNews] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    Promise.all([api.getAdminNewsItem(id), api.getAdminNews()])
      .then(([newsRow, allNews]) => {
        setItem(mapNewsItem(newsRow as Record<string, unknown>));
        const items = (allNews as Array<Record<string, unknown>>).map((row) => mapNewsItem(row));
        setHasFeaturedNews(items.some((row) => row.featured && row.id !== id));
      })
      .catch(() => setError("تعذّر تحميل الخبر"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  if (error || !item) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Alert variant="error">{error || "الخبر غير موجود"}</Alert>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/content")}>
          العودة للمحتوى
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="تعديل الخبر"
        description={item.title}
        className="mb-6"
      />
      <AdminNewsForm
        key={item.id}
        editing={item}
        hasFeaturedNews={hasFeaturedNews}
        onCancel={() => router.push("/admin/content")}
        onSaved={() => router.push("/admin/content")}
      />
    </div>
  );
}
