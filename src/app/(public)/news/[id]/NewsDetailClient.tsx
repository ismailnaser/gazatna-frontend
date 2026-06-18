"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { NewsImageCarousel } from "@/components/molecules/NewsImageCarousel";
import { api } from "@/lib/api";
import { mapNewsItem, newsSlideUrls, type PublicNewsItem } from "@/types/news";
import { ArrowRight, Calendar } from "lucide-react";

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
    return <p className="py-20 text-center text-neutral-500">جاري تحميل الخبر...</p>;
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-neutral-500">{error || "الخبر غير موجود"}</p>
        <Button href="/" variant="outline" className="mt-6">
          العودة للرئيسية
        </Button>
      </div>
    );
  }

  const slideUrls = newsSlideUrls(item);

  return (
    <article className="mx-auto max-w-4xl px-4 pb-10 pt-[var(--nav-height)] sm:px-6 sm:pb-10 lg:px-8">
      <Link
        href="/news"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-teal)] hover:underline"
      >
        <ArrowRight className="h-4 w-4" />
        العودة للأخبار
      </Link>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="info">{item.category}</Badge>
        {item.featured && <Badge variant="success">مميز</Badge>}
      </div>

      <h1 className="text-3xl font-bold leading-tight text-[#1a1a1a] sm:text-4xl">{item.title}</h1>

      <p className="mt-3 flex items-center gap-2 text-sm text-[#1a1a1a]/50">
        <Calendar className="h-4 w-4" />
        {item.date}
      </p>

      <NewsImageCarousel
        images={slideUrls}
        gradient={item.gradient}
        className="mt-8 h-56 rounded-2xl sm:h-80 lg:h-[28rem]"
        alt={item.title}
      />

      <div className="mt-8 space-y-4 whitespace-pre-line text-base leading-8 text-[#1a1a1a]/80">
        {(item.body || item.description).split("\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
