import Link from "next/link";
import { Calendar } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { NewsImageCarousel } from "@/components/molecules/NewsImageCarousel";
import { ExpandableText } from "@/components/molecules/ExpandableText";
import { newsSlideUrls, type PublicNewsItem } from "@/types/news";

export function FeaturedNewsCard({ item }: { item: PublicNewsItem }) {
  const slideUrls = newsSlideUrls(item);

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <NewsImageCarousel
        images={slideUrls}
        gradient={item.gradient}
        className="h-56 sm:h-64 lg:h-72"
        alt={item.title}
        href={`/news/${item.id}`}
      >
        <span className="pointer-events-none absolute start-4 top-4 z-10 rounded-full bg-[var(--brand-magenta)] px-3 py-1 text-xs font-semibold text-white">
          {item.category}
        </span>
      </NewsImageCarousel>

      <div className="p-5 sm:p-6">
        <Link href={`/news/${item.id}`}>
          <h3 className="text-xl font-bold leading-snug text-[#1a1a1a] transition-colors hover:text-[var(--brand-teal)] sm:text-2xl">
            {item.title}
          </h3>
        </Link>
        <ExpandableText maxLines={3} className="mt-3 text-sm text-[#1a1a1a]/60 sm:text-base">
          {item.description}
        </ExpandableText>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm text-[#1a1a1a]/50">
            <Calendar className="h-4 w-4" />
            {item.date}
          </span>
          <Button href={`/news/${item.id}`} variant="outline" className="rounded-full px-5 py-2 text-sm">
            اقرأ المزيد
          </Button>
        </div>
      </div>
    </article>
  );
}
