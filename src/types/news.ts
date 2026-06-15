export type NewsCategory = "أخبار" | "فعاليات" | "إنجازات";

export type PublicNewsItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  category: NewsCategory;
  gradient: string;
  imageUrl?: string | null;
  featured?: boolean;
};

export const categoryGradients: Record<NewsCategory, string> = {
  أخبار: "from-[var(--brand-teal)] to-[var(--brand-teal-light)]",
  فعاليات: "from-[#1a1a1a] to-[#404040]",
  إنجازات: "from-[var(--brand-magenta)] to-[var(--brand-magenta-light)]",
};

export function mapNewsItem(
  n: Record<string, unknown>,
  gradients: Record<NewsCategory, string> = categoryGradients
): PublicNewsItem {
  const category = n.category as NewsCategory;
  return {
    id: String(n.id),
    title: String(n.title),
    description: String(n.description),
    date: String(n.date),
    category,
    gradient: String(n.gradient || gradients[category]),
    imageUrl: n.imageUrl ? String(n.imageUrl) : null,
    featured: Boolean(n.featured),
  };
}

export const newsFilters = ["الكل", "أخبار", "فعاليات", "إنجازات"] as const;
export type NewsFilter = (typeof newsFilters)[number];

export type AdminAnalytics = {
  avgGrade: number;
  feesCollected: number;
  urgentTasks: Array<{ id: string; text: string; type: string }>;
  gradeChart: Array<{ label: string; value: number }>;
  feesChart: Array<{ label: string; value: number }>;
};

export const emptyAdminAnalytics: AdminAnalytics = {
  avgGrade: 0,
  feesCollected: 0,
  urgentTasks: [],
  gradeChart: [],
  feesChart: [],
};
