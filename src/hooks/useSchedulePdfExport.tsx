"use client";

import { useCallback, useEffect, useState } from "react";
import { exportSchedulePdf } from "@/lib/exportSchedulePdf";
import { api } from "@/lib/api";
import type { Schedule } from "@/types/schedules";

const DEFAULT_SCHOOL_NAME = "مدرسة غَزتنا";

export function useSchedulePdfExport(onError?: (message: string) => void) {
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState(DEFAULT_SCHOOL_NAME);

  useEffect(() => {
    api
      .getSiteSettings()
      .then((res) => {
        const name = (res as { hero?: { schoolName?: string } }).hero?.schoolName?.trim();
        if (name) setSchoolName(name);
      })
      .catch(() => {});
  }, []);

  const requestExport = useCallback(
    async (schedule: Schedule) => {
      setExportingId(schedule.id);
      try {
        await exportSchedulePdf(schedule, { schoolName });
      } catch {
        onError?.("تعذر تصدير ملف PDF");
      } finally {
        setExportingId(null);
      }
    },
    [onError, schoolName]
  );

  return { exportingId, requestExport };
}
