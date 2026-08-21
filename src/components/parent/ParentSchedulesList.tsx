"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { EmptyState } from "@/components/molecules/EmptyState";
import { ScheduleTable } from "@/components/schedules/ScheduleTable";
import { StudentScheduleGrid } from "@/components/schedules/StudentScheduleGrid";
import { useSchedulePdfExport } from "@/hooks/useSchedulePdfExport";
import { api } from "@/lib/api";
import type { Schedule, ScheduleType } from "@/types/schedules";
import { mapSchedule, SCHEDULE_TYPE_LABELS } from "@/types/schedules";
import { Download } from "lucide-react";

export function ParentSchedulesList({ type }: { type: ScheduleType }) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { exportingId, requestExport } = useSchedulePdfExport(
    useCallback((message: string) => setError(message), [])
  );

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .getParentSchedules(type)
      .then((data) => setSchedules((data as Array<Record<string, unknown>>).map(mapSchedule)))
      .catch(() => {
        setSchedules([]);
        setError("تعذر تحميل الجداول");
      })
      .finally(() => setLoading(false));
  }, [type]);

  if (loading) {
    return <p className="py-10 text-center text-sm text-p-black/72">جاري تحميل الجداول...</p>;
  }

  return (
    <div className="space-y-4">
      {error ? <Alert variant="error">{error}</Alert> : null}
      {schedules.length === 0 ? (
        <EmptyState title={`لا يوجد ${SCHEDULE_TYPE_LABELS[type]} منشور لشعبتك حالياً.`} />
      ) : (
        schedules.map((schedule) => {
          const expanded = expandedId === schedule.id;
          const isClassSchedule = schedule.scheduleType === "class";
          return (
            <Card key={schedule.id} className="overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div>
                  <h3 className="text-base font-bold text-p-black">{schedule.name}</h3>
                  <p className="mt-1 text-xs text-p-black/72">
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
                    className="gap-1.5 px-3 py-1.5 text-xs"
                    onClick={() => {
                      setError("");
                      requestExport(schedule, schedule.scheduleType === "class" ? "student" : "exam");
                    }}
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
                    <ScheduleTable schedule={schedule} />
                  )}
                </div>
              ) : null}
            </Card>
          );
        })
      )}
    </div>
  );
}
