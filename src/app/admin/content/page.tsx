"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { AdminNewsGrid } from "@/components/admin/AdminNewsGrid";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { NewsFilterBar } from "@/components/molecules/NewsFilterBar";
import { PageHeader } from "@/components/molecules/PageHeader";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { mapNewsItem, type NewsFilter, type PublicNewsItem } from "@/types/news";
import { CalendarDays, Newspaper, Plus, Search, Sparkles, Trophy } from "lucide-react";

function StatChip({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Newspaper;
  label: string;
  value: string | number;
  tone?: "default" | "success" | "accent";
}) {
  const tones = {
    default: "bg-brand-blue/10 text-brand-blue",
    success: "bg-p-green/10 text-p-green",
    accent: "bg-brand-orange/10 text-brand-orange",
  };

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-neutral-100 bg-white px-3 py-2.5 shadow-sm">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          tones[tone]
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-p-black/45">{label}</p>
        <p className="truncate text-sm font-bold text-p-black">{value}</p>
      </div>
    </div>
  );
}

export default function AdminContentPage() {
  const [news, setNews] = useState<PublicNewsItem[]>([]);
  const [filter, setFilter] = useState<NewsFilter>("الكل");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDeleteNews, setConfirmDeleteNews] = useState<PublicNewsItem | null>(null);
  const [deletingNews, setDeletingNews] = useState(false);

  useEffect(() => {
    api
      .getAdminNews()
      .then((data) => {
        const mapped = (data as Array<Record<string, unknown>>).map((row) => mapNewsItem(row));
        setNews(mapped);
      })
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const featured = news.find((item) => item.featured);
    return {
      total: news.length,
      featuredTitle: featured?.title ?? "—",
      news: news.filter((item) => item.category === "أخبار").length,
      events: news.filter((item) => item.category === "فعاليات").length,
      achievements: news.filter((item) => item.category === "إنجازات").length,
    };
  }, [news]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return news.filter((item) => {
      if (filter !== "الكل" && item.category !== filter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [news, filter, search]);

  async function handleDelete(id: string) {
    await api.deleteAdminNews(id);
    setNews((prev) => prev.filter((item) => item.id !== id));
  }

  function requestDeleteNews(id: string) {
    const item = news.find((row) => row.id === id);
    if (!item) return;
    setError("");
    setConfirmDeleteNews(item);
  }

  async function confirmDeleteNewsAction() {
    if (!confirmDeleteNews) return;
    setDeletingNews(true);
    setError("");
    try {
      await handleDelete(confirmDeleteNews.id);
      setConfirmDeleteNews(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حذف الخبر");
    } finally {
      setDeletingNews(false);
    }
  }

  async function handleSetFeatured(id: string) {
    await api.updateAdminNews(id, { featured: true });
    setNews((prev) => prev.map((item) => ({ ...item, featured: item.id === id })));
  }

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="إدارة المحتوى"
          description="الأخبار والفعاليات والإنجازات المعروضة للجمهور"
        />
        <Button href="/admin/content/new" className="shrink-0">
          <Plus className="h-4 w-4" />
          خبر جديد
        </Button>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatChip icon={Newspaper} label="إجمالي المحتوى" value={stats.total} />
        <StatChip
          icon={Sparkles}
          label="الخبر المميز"
          value={stats.featuredTitle}
          tone="accent"
        />
        <StatChip icon={CalendarDays} label="فعاليات" value={stats.events} tone="success" />
        <StatChip icon={Trophy} label="إنجازات" value={stats.achievements} />
      </div>

      <Card className="p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-bold text-p-black">قائمة المحتوى</h3>
            <p className="mt-1 text-sm text-p-black/55">
              {news.length === 0
                ? "لا يوجد محتوى منشور بعد"
                : `${filtered.length} من ${news.length} عنصر`}
            </p>
          </div>
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-p-black/35" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالعنوان أو الوصف..."
              className="w-full rounded-xl border border-neutral-200 py-2.5 pe-3 ps-9 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>
        </div>

        <NewsFilterBar filter={filter} onChange={setFilter} />

        {news.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
            <Newspaper className="mx-auto h-10 w-10 text-p-black/25" />
            <p className="mt-4 font-semibold text-p-black">لا توجد أخبار بعد</p>
            <p className="mt-1 text-sm text-p-black/55">ابدأ بإضافة أول خبر أو فعالية للموقع</p>
            <Button href="/admin/content/new" className="mt-5">
              <Plus className="h-4 w-4" />
              إضافة خبر
            </Button>
          </div>
        ) : (
          <div className="mt-6">
            <AdminNewsGrid
              items={filtered}
              onDelete={requestDeleteNews}
              onSetFeatured={handleSetFeatured}
            />
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(confirmDeleteNews)}
        title="تأكيد حذف الخبر"
        description={
          <>
            هل أنت متأكد من حذف الخبر{" "}
            <span className="font-semibold">{confirmDeleteNews?.title}</span>؟ لا يمكن التراجع عن هذا
            الإجراء.
          </>
        }
        loading={deletingNews}
        error={confirmDeleteNews ? error : undefined}
        onCancel={() => {
          setError("");
          setConfirmDeleteNews(null);
        }}
        onConfirm={confirmDeleteNewsAction}
      />
    </div>
  );
}
