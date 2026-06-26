"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { TeacherScheduleTable } from "@/components/schedules/TeacherScheduleTable";
import { useSchedulePdfExport } from "@/hooks/useSchedulePdfExport";
import { api } from "@/lib/api";
import type { TeacherScheduleRow } from "@/types/schedules";
import { mapTeacherScheduleRow } from "@/types/schedules";
import { Download } from "lucide-react";

export default function TeacherSchedulesPage() {
  const [rows, setRows] = useState<TeacherScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { exportingId, requestTeacherExport } = useSchedulePdfExport(
    useCallback((message: string) => setError(message), [])
  );

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .getTeacherSchedules()
      .then((data) =>
        setRows((data as Array<Record<string, unknown>>).map(mapTeacherScheduleRow))
      )
      .catch(() => {
        setRows([]);
        setError("تعذر تحميل جدول الحصص");
      })
      .finally(() => setLoading(false));
  }, []);

  function handleExportPdf() {
    setError("");
    requestTeacherExport(rows);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="جدول حصصي"
        description="حصصك الأسبوعية حسب الجداول المنشورة للفصول والشعب المسندة إليك."
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 p-4">
          <p className="text-sm text-p-black/60">
            {loading ? "..." : `${rows.length} حصة في الجدول`}
          </p>
          <Button
            type="button"
            className="gap-1.5 px-3 py-1.5 text-xs"
            onClick={handleExportPdf}
            disabled={exportingId === "teacher" || loading || rows.length === 0}
          >
            <Download className="h-3.5 w-3.5" />
            {exportingId === "teacher" ? "جاري التصدير..." : "PDF"}
          </Button>
        </div>

        <div className="p-4">
          {loading ? (
            <p className="py-10 text-center text-sm text-p-black/50">جاري تحميل الجدول...</p>
          ) : (
            <TeacherScheduleTable rows={rows} />
          )}
        </div>
      </Card>
    </div>
  );
}
