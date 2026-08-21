"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import {
  AdminAdmissionsTable,
  type AdminAdmissionRow,
} from "@/components/admin/AdminAdmissionsTable";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { SearchField } from "@/components/molecules/SearchField";
import { api, peekCachedList } from "@/lib/api";
import { mapAdmission } from "@/lib/adminAdmissions";
import { cn } from "@/lib/utils";
import { CheckCircle2, ClipboardList, Clock, RefreshCw } from "lucide-react";

type TabId = "pending" | "approved" | "all";

const TABS: Array<{ id: TabId; label: string; icon: typeof Clock }> = [
  { id: "pending", label: "قيد المراجعة", icon: Clock },
  { id: "approved", label: "معتمدة", icon: CheckCircle2 },
  { id: "all", label: "كل الطلبات", icon: ClipboardList },
];

export default function AdminAdmissionsPage() {
  const cached = peekCachedList<Record<string, unknown>>("/admin/admissions/");
  const [items, setItems] = useState<AdminAdmissionRow[]>(
    cached ? cached.map((row) => mapAdmission(row)) : []
  );
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<TabId>("pending");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = (await api.getAdminAdmissions()) as unknown[];
      setItems(res.map((row) => mapAdmission(row as Record<string, unknown>)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const pendingCount = useMemo(() => items.filter((i) => i.status === "pending").length, [items]);
  const approvedCount = useMemo(() => items.filter((i) => i.status === "approved").length, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = items;
    if (tab === "pending") list = list.filter((i) => i.status === "pending");
    else if (tab === "approved") list = list.filter((i) => i.status === "approved");
    if (!q) return list;
    return list.filter((row) =>
      [row.studentName, row.nationalId, row.parentName, row.phone, row.grade]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [items, tab, search]);

  return (
    <WorkspacePage
      title="طلبات التسجيل"
      description="طلبات التسجيل بانتظار المراجعة."
      loading={loading && items.length === 0}
      loadingMessage="جاري تحميل الطلبات..."
    >
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}

      <Card className="mb-4" padding="sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold",
                  tab === id ? "bg-brand-blue text-white" : "bg-neutral-50 text-p-black/75 hover:bg-neutral-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
                <span className="rounded-md bg-black/10 px-1.5 py-0.5 text-[11px]">
                  {id === "pending" ? pendingCount : id === "approved" ? approvedCount : items.length}
                </span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SearchField value={search} onChange={setSearch} placeholder="بحث بالاسم أو الهاتف..." />
            <Button type="button" variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              تحديث
            </Button>
          </div>
        </div>
      </Card>

      <Card padding="sm">
        <AdminAdmissionsTable
          rows={filtered}
          variant={tab === "all" ? "all" : tab}
          hasActiveFilters={Boolean(search.trim())}
        />
      </Card>
    </WorkspacePage>
  );
}
