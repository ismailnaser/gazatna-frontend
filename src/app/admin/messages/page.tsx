"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { AdminContactMessageCard } from "@/components/admin/AdminContactMessageCard";
import { PageHeader } from "@/components/molecules/PageHeader";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ContactMessage } from "@/types/contact";
import { Archive, Inbox, Mail, RefreshCw, Search } from "lucide-react";

type Tab = "new" | "archived";

function StatChip({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Inbox;
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

export default function AdminMessagesPage() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [tab, setTab] = useState<Tab>("new");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [archivingId, setArchivingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = (await api.getAdminMessages()) as ContactMessage[];
      setItems(
        res.map((item) => ({
          ...item,
          email: item.email ?? "",
          phone: item.phone ?? "",
        }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحميل الرسائل");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const newMsgs = useMemo(() => items.filter((m) => m.status === "new"), [items]);
  const archived = useMemo(() => items.filter((m) => m.status === "archived"), [items]);

  const visible = useMemo(() => {
    const source = tab === "new" ? newMsgs : archived;
    const q = search.trim().toLowerCase();
    if (!q) return source;
    return source.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q)
    );
  }, [tab, newMsgs, archived, search]);

  async function archive(id: string) {
    setError("");
    setSuccess("");
    setArchivingId(id);
    try {
      await api.archiveAdminMessage(id);
      setItems((prev) => prev.map((m) => (m.id === id ? { ...m, status: "archived" } : m)));
      setSuccess("تمت أرشفة الرسالة.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر الأرشفة");
    } finally {
      setArchivingId("");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="رسائل تواصل معنا"
          description="الرسائل المرسلة من صفحة تواصل معنا — ردّ عبر البريد أو الاتصال مباشرة"
        />
        <Button type="button" variant="outline" onClick={load} disabled={loading} className="shrink-0">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          {loading ? "جاري التحديث..." : "تحديث"}
        </Button>
      </div>

      {success && (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      )}
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <StatChip icon={Inbox} label="إجمالي الرسائل" value={items.length} />
        <StatChip icon={Mail} label="جديدة" value={newMsgs.length} tone="accent" />
        <StatChip icon={Archive} label="مؤرشفة" value={archived.length} tone="success" />
      </div>

      <Card className="p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTab("new")}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                tab === "new"
                  ? "bg-brand-blue text-white"
                  : "border border-neutral-200 bg-white text-p-black/70 hover:border-brand-blue/30"
              )}
            >
              جديدة ({newMsgs.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("archived")}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                tab === "archived"
                  ? "bg-brand-blue text-white"
                  : "border border-neutral-200 bg-white text-p-black/70 hover:border-brand-blue/30"
              )}
            >
              مؤرشفة ({archived.length})
            </button>
          </div>
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-p-black/35" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو البريد أو الهاتف..."
              className="w-full rounded-xl border border-neutral-200 py-2.5 pe-3 ps-9 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-p-black/50">جاري تحميل الرسائل...</p>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
            <Mail className="mx-auto h-10 w-10 text-p-black/25" />
            <p className="mt-4 font-semibold text-p-black">
              {tab === "new" ? "لا توجد رسائل جديدة" : "لا توجد رسائل مؤرشفة"}
            </p>
            <p className="mt-1 text-sm text-p-black/55">
              {search.trim()
                ? "لا توجد نتائج مطابقة للبحث."
                : tab === "new"
                  ? "ستظهر هنا الرسائل الواردة من صفحة تواصل معنا."
                  : "الرسائل المؤرشفة تظهر هنا للمراجعة لاحقاً."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {visible.map((message) => (
              <AdminContactMessageCard
                key={message.id}
                message={message}
                archived={message.status === "archived"}
                archiving={archivingId === message.id}
                onArchive={message.status === "new" ? archive : undefined}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
