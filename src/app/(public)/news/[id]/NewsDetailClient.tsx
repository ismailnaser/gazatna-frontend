"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { FeaturedNewsCard } from "@/components/molecules/FeaturedNewsCard";
import { api } from "@/lib/api";
import { mapNewsItem, type PublicNewsItem } from "@/types/news";
import { ArrowRight } from "lucide-react";

export function NewsDetailClient({ id }: { id: string }) {
  const [item, setItem] = useState<PublicNewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getNewsItem(id)
      .then((data) => setItem(mapNewsItem(data as Record<string, unknown>)))
      .catch(() => {
        setItem(null);
        setError("تعذر تحميل الخبر");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-10 pt-[var(--nav-height)] sm:px-6">
        <div className="h-8 w-40 animate-pulse rounded bg-white/70" />
        <div className="mt-6 aspect-square animate-pulse rounded-[1.6rem] bg-white/70" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="font-semibold text-p-black/70">{error || "الخبر غير موجود"}</p>
        <Button href="/news" variant="outline" className="mt-6">
          العودة للأخبار
        </Button>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-lg px-4 pb-12 pt-[var(--nav-height)] sm:px-6">
      <Link
        href="/news"
        className="mb-5 inline-flex items-center gap-2 text-sm font-extrabold text-brand-blue hover:underline"
      >
        <ArrowRight className="h-4 w-4" />
        العودة للبوستات
      </Link>
      <FeaturedNewsCard item={item} showFullBody />
    </article>
  );
}
