"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import {
  AdminScheduleRolloverPanel,
  mapScheduleRolloverContext,
  type ScheduleRolloverContext,
} from "@/components/admin/schedules/AdminScheduleRolloverPanel";
import { AdminSchedulesTable } from "@/components/admin/AdminSchedulesTable";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { PageHeader } from "@/components/molecules/PageHeader";
import { ScheduleTable } from "@/components/schedules/ScheduleTable";
import { useSchedulePdfExport } from "@/hooks/useSchedulePdfExport";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Schedule, ScheduleType } from "@/types/schedules";
import { mapSchedule, SCHEDULE_TYPE_LABELS } from "@/types/schedules";
import { CalendarDays, ClipboardList, Plus, Search } from "lucide-react";

type TabId = ScheduleType;

const TABS: Array<{ id: TabId; label: string; icon: typeof CalendarDays }> = [
  { id: "exam", label: "جدول الاختبارات", icon: ClipboardList },
  { id: "class", label: "جدول الحصص", icon: CalendarDays },
];

export default function AdminSchedulesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("exam");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [rolloverContext, setRolloverContext] = useState<ScheduleRolloverContext | null>(null);
  const [showRollover, setShowRollover] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<Schedule | null>(null);
  const { exportingId, requestExport } = useSchedulePdfExport(
    useCallback((message: string) => setError(message), [])
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getAdminSchedules(tab);
      setSchedules((data as Array<Record<string, unknown>>).map(mapSchedule));
    } catch {
      setSchedules([]);
      setError("تعذر تحميل الجداول");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  const loadRollover = useCallback(async () => {
    try {
      const contextRaw = await api.getAdminScheduleRolloverContext(tab);
      setRolloverContext(mapScheduleRolloverContext(contextRaw as Record<string, unknown>));
    } catch {
      setRolloverContext(null);
    }
  }, [tab]);

  useEffect(() => {
    setRolloverContext(null);
    setShowRollover(false);
    void load();
  }, [load]);

  async function openRollover() {
    setShowRollover(true);
    if (!rolloverContext) await loadRollover();
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return schedules;
    return schedules.filter((schedule) => {
      const haystack = [schedule.name, ...schedule.classLabels].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [schedules, search]);

  function openCreate(classIds: string[] = []) {
    const params = new URLSearchParams({ type: tab });
    if (classIds.length === 1) {
      params.set("classId", classIds[0]);
    } else if (classIds.length > 1) {
      params.set("classIds", classIds.join(","));
    }
    router.push(`/admin/schedules/create?${params.toString()}`);
  }

  function openEdit(schedule: Schedule) {
    router.push(`/admin/schedules/${schedule.id}/edit`);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError("");
    try {
      await api.deleteAdminSchedule(deleteTarget.id);
      setSchedules((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setSuccess("تم حذف الجدول.");
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حذف الجدول");
    } finally {
      setDeleting(false);
    }
  }

  function handleExportPdf(schedule: Schedule) {
    setError("");
    requestExport(schedule);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="الجداول"
          description="إنشاء جداول الاختبارات والحصص وربطها بالفصول، مع إمكانية التصدير كملف PDF."
        />
        <Button onClick={() => openCreate()} className="shrink-0">
          <Plus className="h-4 w-4" />
          {tab === "exam" ? "جدول اختبارات جديد" : "جدول حصص جديد"}
        </Button>
      </div>

      {showRollover && rolloverContext ? (
        <AdminScheduleRolloverPanel
          scheduleType={tab}
          context={rolloverContext}
          onChanged={async () => {
            await load();
            await loadRollover();
          }}
          onCreateFresh={(classId) => openCreate([classId])}
        />
      ) : (
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={() => void openRollover()}>
            خيارات ترحيل الجداول
          </Button>
        </div>
      )}

      {success ? <Alert variant="success">{success}</Alert> : null}
      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card className="p-3 sm:p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {TABS.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTab(item.id);
                    setSearch("");
                  }}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                      : "border-neutral-200 bg-white text-p-black/75 hover:border-brand-blue/30"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="relative min-w-[200px] flex-1 lg:max-w-xs">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-p-black/35" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث باسم الجدول أو الفصل..."
              className="w-full rounded-xl border border-neutral-200 py-2.5 pe-3 ps-9 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-p-black/72">جاري تحميل الجداول...</p>
        ) : (
          <AdminSchedulesTable
            schedules={filtered}
            hasActiveFilters={Boolean(search.trim())}
            exportingId={exportingId}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onPreview={setPreviewTarget}
            onExportPdf={handleExportPdf}
          />
        )}
      </Card>

      {previewTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewTarget(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-p-black">{previewTarget.name}</h3>
                <p className="mt-1 text-sm text-p-black/78">
                  {SCHEDULE_TYPE_LABELS[previewTarget.scheduleType]}
                  {previewTarget.classLabels.length > 0
                    ? ` · ${previewTarget.classLabels.join(" · ")}`
                    : ""}
                </p>
              </div>
              <Button type="button" variant="outline" onClick={() => setPreviewTarget(null)}>
                إغلاق
              </Button>
            </div>
            <ScheduleTable schedule={previewTarget} />
            <div className="mt-4 flex justify-end">
              <Button type="button" onClick={() => handleExportPdf(previewTarget)}>
                تصدير PDF
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="تأكيد حذف الجدول"
        description={
          deleteTarget
            ? `هل أنت متأكد من حذف «${deleteTarget.name}»؟ لا يمكن التراجع عن هذا الإجراء.`
            : ""
        }
        confirmLabel={deleting ? "جاري الحذف..." : "حذف"}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
