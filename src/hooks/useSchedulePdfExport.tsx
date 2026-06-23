"use client";

import { useCallback, useEffect, useState } from "react";
import {
  exportSchedulePdf,
  exportTeacherSchedulePdf,
  type SchedulePdfVariant,
} from "@/lib/exportSchedulePdf";
import { api } from "@/lib/api";
import type { Schedule, TeacherScheduleRow } from "@/types/schedules";

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
    async (schedule: Schedule, variant?: SchedulePdfVariant) => {
      setExportingId(schedule.id);
      try {
        await exportSchedulePdf(schedule, {
          schoolName,
          variant:
            variant ??
            (schedule.scheduleType === "exam" ? "exam" : "full"),
        });
      } catch {
        onError?.("تعذر تصدير ملف PDF");
      } finally {
        setExportingId(null);
      }
    },
    [onError, schoolName]
  );

  const requestTeacherExport = useCallback(
    async (rows: TeacherScheduleRow[], title?: string) => {
      setExportingId("teacher");
      try {
        await exportTeacherSchedulePdf(rows, { schoolName, title });
      } catch {
        onError?.("تعذر تصدير ملف PDF");
      } finally {
        setExportingId(null);
      }
    },
    [onError, schoolName]
  );

  return { exportingId, requestExport, requestTeacherExport };
}
