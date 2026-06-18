"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminNewsForm } from "@/components/admin/AdminNewsForm";
import { PageHeader } from "@/components/molecules/PageHeader";
import { api } from "@/lib/api";
import { mapNewsItem } from "@/types/news";

export default function AdminNewNewsPage() {
  const router = useRouter();
  const [hasFeaturedNews, setHasFeaturedNews] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAdminNews()
      .then((data) => {
        const items = (data as Array<Record<string, unknown>>).map((row) => mapNewsItem(row));
        setHasFeaturedNews(items.some((item) => item.featured));
      })
      .catch(() => setHasFeaturedNews(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="إضافة خبر جديد"
        description="أنشئ خبراً أو فعالية أو إنجازاً لعرضه في الموقع العام"
        className="mb-6"
      />
      <AdminNewsForm
        hasFeaturedNews={hasFeaturedNews}
        onCancel={() => router.push("/admin/content")}
        onSaved={() => router.push("/admin/content")}
      />
    </div>
  );
}
