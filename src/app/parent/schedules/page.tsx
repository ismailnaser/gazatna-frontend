"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { ScheduleTable } from "@/components/schedules/ScheduleTable";
import { StudentScheduleGrid } from "@/components/schedules/StudentScheduleGrid";
import { useSchedulePdfExport } from "@/hooks/useSchedulePdfExport";
import { api } from "@/lib/api";
import { buildStudentSchedulePrintHtml } from "@/lib/exportSchedulePdf";
import { printHtmlDocument } from "@/lib/printSchedule";
import { cn } from "@/lib/utils";
import type { Schedule, ScheduleType } from "@/types/schedules";
import { mapSchedule, SCHEDULE_TYPE_LABELS } from "@/types/schedules";
import { CalendarDays, ClipboardList, Download, Printer } from "lucide-react";

type TabId = ScheduleType;

const TABS: Array<{ id: TabId; label: string; icon: typeof CalendarDays }> = [
  { id: "exam", label: "جدول الاختبارات", icon: ClipboardList },
  { id: "class", label: "جدول الحصص", icon: CalendarDays },
];

export default function ParentSchedulesPage() {
  const [tab, setTab] = useState<TabId>("class");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [printingId, setPrintingId] = useState<string | null>(null);
  const { exportingId, requestExport } = useSchedulePdfExport(useCallback((message: string) => setError(message), []));

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .getParentSchedules(tab)
      .then((data) => setSchedules((data as Array<Record<string, unknown>>).map(mapSchedule)))
      .catch(() => {
        setSchedules([]);
        setError("تعذر تحميل الجداول");
      })
      .finally(() => setLoading(false));
  }, [tab]);

  function handleExportPdf(schedule: Schedule) {
    setError("");
    requestExport(
      schedule,
      schedule.scheduleType === "class" ? "student" : "exam"
    );
  }

  async function handlePrint(schedule: Schedule) {
    setError("");
    setPrintingId(schedule.id);
    try {
      if (schedule.scheduleType === "class") {
        const { title, bodyHtml } = buildStudentSchedulePrintHtml(schedule);
        await printHtmlDocument(title, bodyHtml);
        return;
      }
      const container = document.getElementById(`schedule-print-${schedule.id}`);
      if (!container) {
        setError("افتح الجدول أولاً ثم أعد محاولة الطباعة");
        return;
      }
      await printHtmlDocument(schedule.name, container.innerHTML);
    } catch {
      setError("تعذر طباعة الجدول");
    } finally {
      setPrintingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="الجداول"
        description="جداول الاختبارات والحصص الخاصة بشعبتك الدراسية."
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

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
                setExpandedId(null);
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
                active
                  ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                  : "border-neutral-200 bg-white text-p-black/65 hover:border-brand-blue/30"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-p-black/50">جاري تحميل الجداول...</p>
      ) : schedules.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-p-black/55">
            لا يوجد {SCHEDULE_TYPE_LABELS[tab].toLowerCase()} منشور لشعبتك حالياً.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => {
            const expanded = expandedId === schedule.id;
            const isClassSchedule = schedule.scheduleType === "class";
            return (
              <Card key={schedule.id} className="overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-3 p-4">
                  <div>
                    <h3 className="text-base font-bold text-p-black">{schedule.name}</h3>
                    <p className="mt-1 text-xs text-p-black/50">
                      {SCHEDULE_TYPE_LABELS[schedule.scheduleType]}
                      {schedule.classLabels.length > 0
                        ? ` · ${schedule.classLabels.join(" · ")}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-1.5 px-3 py-1.5 text-xs"
                      onClick={() => setExpandedId(expanded ? null : schedule.id)}
                    >
                      {expanded ? "إخفاء الجدول" : "عرض الجدول"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-1.5 px-3 py-1.5 text-xs"
                      onClick={() => handlePrint(schedule)}
                      disabled={printingId === schedule.id}
                    >
                      <Printer className="h-3.5 w-3.5" />
                      {printingId === schedule.id ? "جاري التحضير..." : "طباعة"}
                    </Button>
                    <Button
                      type="button"
                      className="gap-1.5 px-3 py-1.5 text-xs"
                      onClick={() => handleExportPdf(schedule)}
                      disabled={exportingId === schedule.id}
                    >
                      <Download className="h-3.5 w-3.5" />
                      {exportingId === schedule.id ? "جاري التصدير..." : "PDF"}
                    </Button>
                  </div>
                </div>
                {expanded ? (
                  <div className="border-t border-neutral-100 bg-neutral-50/40 p-4">
                    {isClassSchedule ? (
                      <StudentScheduleGrid schedule={schedule} />
                    ) : (
                      <div id={`schedule-print-${schedule.id}`}>
                        <ScheduleTable schedule={schedule} />
                      </div>
                    )}
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
