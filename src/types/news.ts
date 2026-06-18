export type NewsCategory = "أخبار" | "فعاليات" | "إنجازات";

export type NewsImageItem = {
  id: string | null;
  url: string;
  isCover: boolean;
};

export type PublicNewsItem = {
  id: string;
  title: string;
  description: string;
  body?: string;
  date: string;
  category: NewsCategory;
  gradient: string;
  imageUrl?: string | null;
  images?: NewsImageItem[];
  featured?: boolean;
};

export const categoryGradients: Record<NewsCategory, string> = {
  أخبار: "from-[var(--brand-teal)] to-[var(--brand-teal-light)]",
  فعاليات: "from-[#1a1a1a] to-[#404040]",
  إنجازات: "from-[var(--brand-magenta)] to-[var(--brand-magenta-light)]",
};

function mapNewsImages(raw: unknown): NewsImageItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((img) => {
      const row = img as Record<string, unknown>;
      const url = row.url ? String(row.url) : "";
      if (!url) return null;
      return {
        id: row.id ? String(row.id) : null,
        url,
        isCover: Boolean(row.isCover),
      };
    })
    .filter((img): img is NewsImageItem => img !== null);
}

export function mapNewsItem(
  n: Record<string, unknown>,
  gradients: Record<NewsCategory, string> = categoryGradients
): PublicNewsItem {
  const category = n.category as NewsCategory;
  const images = mapNewsImages(n.images);
  return {
    id: String(n.id),
    title: String(n.title),
    description: String(n.description),
    body: n.body ? String(n.body) : String(n.description),
    date: String(n.date),
    category,
    gradient: String(n.gradient || gradients[category]),
    imageUrl: n.imageUrl ? String(n.imageUrl) : images.find((img) => img.isCover)?.url ?? images[0]?.url ?? null,
    images,
    featured: Boolean(n.featured),
  };
}

/** Ordered image URLs for carousels — cover first, then the rest. */
export function newsSlideUrls(item: Pick<PublicNewsItem, "imageUrl" | "images">): string[] {
  const gallery = item.images ?? [];
  if (gallery.length > 0) {
    const cover = gallery.find((image) => image.isCover);
    const rest = gallery.filter((image) => image !== cover);
    const ordered = cover ? [cover, ...rest] : gallery;
    return [...new Set(ordered.map((image) => image.url).filter(Boolean))];
  }
  return item.imageUrl ? [item.imageUrl] : [];
}

export function newsHasMultipleImages(item: Pick<PublicNewsItem, "imageUrl" | "images">) {
  return newsSlideUrls(item).length > 1;
}

export const newsFilters = ["الكل", "أخبار", "فعاليات", "إنجازات"] as const;
export type NewsFilter = (typeof newsFilters)[number];

export type AdminAnalytics = {
  avgGrade: number;
  feesCollected: number;
  pendingPayments?: number;
  inactiveStudents?: number;
  blockedStudents?: number;
  overdueInstallments?: number;
  pendingAdmissions?: number;
  newMessages?: number;
  urgentTasks: Array<{ id: string; text: string; type: string }>;
  gradeChart: Array<{ label: string; value: number }>;
  feesChart: Array<{ label: string; value: number }>;
};

export const emptyAdminAnalytics: AdminAnalytics = {
  avgGrade: 0,
  feesCollected: 0,
  pendingPayments: 0,
  inactiveStudents: 0,
  blockedStudents: 0,
  overdueInstallments: 0,
  pendingAdmissions: 0,
  newMessages: 0,
  urgentTasks: [],
  gradeChart: [],
  feesChart: [],
};
