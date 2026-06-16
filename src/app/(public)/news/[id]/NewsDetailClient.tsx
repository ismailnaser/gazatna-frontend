"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { NewsCover } from "@/components/molecules/NewsCover";
import { api } from "@/lib/api";
import { mapNewsItem, type PublicNewsItem } from "@/types/news";
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

  const gallery = (item.images ?? []).filter((image) => !image.isCover);

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
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

      <NewsCover
        imageUrl={item.imageUrl}
        gradient={item.gradient}
        className="mt-8 h-56 rounded-2xl sm:h-80 lg:h-[28rem]"
      />

      <div className="mt-8 space-y-4 text-base leading-8 text-[#1a1a1a]/80 whitespace-pre-line">
        {(item.body || item.description).split("\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {gallery.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-[#1a1a1a]">معرض الصور</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {gallery.map((image, index) => (
              <a
                key={image.id ?? `gallery-${index}`}
                href={image.url}
                target="_blank"
                rel="noreferrer"
                className="overflow-hidden rounded-2xl border border-neutral-100 shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="" className="h-56 w-full object-cover transition-transform hover:scale-[1.02]" />
              </a>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
