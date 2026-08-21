"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import { NewsImageCarousel } from "@/components/molecules/NewsImageCarousel";
import { ExpandableText } from "@/components/molecules/ExpandableText";
import { cn } from "@/lib/utils";
import { newsSlideUrls, type NewsCategory, type PublicNewsItem } from "@/types/news";

const CATEGORY_TONE: Record<NewsCategory, string> = {
  أخبار: "bg-brand-blue text-white",
  فعاليات: "bg-brand-yellow text-p-black",
  إنجازات: "bg-brand-orange text-white",
};

export function FeaturedNewsCard({
  item,
  showFullBody = false,
  compact = false,
}: {
  item: PublicNewsItem;
  showFullBody?: boolean;
  compact?: boolean;
}) {
  const slideUrls = newsSlideUrls(item);
  const href = compact ? `/news#reel-${item.id}` : `/news/${item.id}`;
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  async function sharePost() {
    const url = `${window.location.origin}${href}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-[1.6rem] border-[3px] border-black/10 bg-white shadow-[-6px_8px_0_0_rgba(66,76,243,0.14)]",
        compact && "rounded-[1.3rem] shadow-[-4px_5px_0_0_rgba(66,76,243,0.12)]"
      )}
    >
      <header className={cn("flex items-center gap-3 px-3.5 py-3", compact && "gap-2 px-2.5 py-2")}>
        <Link
          href="/"
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-brand-yellow via-brand-orange to-brand-blue p-0.5",
            compact && "h-8 w-8"
          )}
          aria-label="مدرسة غَزتنا"
        >
          <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.webp" alt="" className={cn("h-8 w-8 object-contain", compact && "h-5 w-5")} />
          </span>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn("truncate text-sm font-extrabold text-p-black", compact && "text-xs")}>
              مدرسة غَزتنا
            </p>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", CATEGORY_TONE[item.category])}>
              {item.category}
            </span>
          </div>
          <p className={cn("text-xs font-semibold text-p-black/50", compact && "text-[10px]")}>{item.date}</p>
        </div>
      </header>

      <NewsImageCarousel
        images={slideUrls}
        gradient={item.gradient}
        className="aspect-square w-full"
        alt={item.title}
        href={showFullBody ? undefined : href}
        compact={compact}
      />

      <div className={cn("flex flex-1 flex-col px-3.5 pb-4 pt-2", compact && "px-2.5 pb-3 pt-1.5")}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setLiked((value) => !value)}
              className="rounded-full p-1.5 transition-transform hover:scale-110"
              aria-label={liked ? "إلغاء الإعجاب" : "إعجاب"}
              aria-pressed={liked}
            >
              <Heart
                className={cn(
                  compact ? "h-5 w-5" : "h-7 w-7",
                  liked ? "fill-brand-orange text-brand-orange" : "text-p-black"
                )}
              />
            </button>
            <Link
              href={href}
              className="rounded-full p-1.5 text-p-black transition-transform hover:scale-110"
              aria-label="قراءة الخبر"
            >
              <MessageCircle className={compact ? "h-5 w-5" : "h-7 w-7"} />
            </Link>
            <button
              type="button"
              onClick={sharePost}
              className="rounded-full p-1.5 text-p-black transition-transform hover:scale-110"
              aria-label="نسخ الرابط"
            >
              <Send className={compact ? "h-5 w-5" : "h-7 w-7"} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSaved((value) => !value)}
            className="rounded-full p-1.5 transition-transform hover:scale-110"
            aria-label={saved ? "إلغاء الحفظ" : "حفظ"}
            aria-pressed={saved}
          >
            <Bookmark
              className={cn(
                compact ? "h-5 w-5" : "h-7 w-7",
                saved ? "fill-brand-yellow text-brand-yellow" : "text-p-black"
              )}
            />
          </button>
        </div>
        {copied ? (
          <p className="mt-1 text-xs font-bold text-brand-blue">تم نسخ رابط البوست</p>
        ) : null}

        <div className={cn("mt-2 text-sm leading-relaxed text-p-black", compact && "mt-1.5 text-xs")}>
          <p className="font-extrabold">{item.title}</p>
          {showFullBody ? (
            <div className="mt-2 whitespace-pre-line text-[15px] leading-7 text-p-black/80">
              {item.body || item.description}
            </div>
          ) : (
            <ExpandableText
              maxLines={compact ? 2 : 2}
              moreLabel="المزيد"
              lessLabel="أقل"
              className={cn("mt-1 text-p-black/75", compact ? "text-xs" : "text-[15px]")}
              buttonClassName="text-p-black/45"
            >
              {item.description}
            </ExpandableText>
          )}
        </div>
      </div>
    </article>
  );
}
