"use client";

import { useCallback, useState } from "react";
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

  const resolveSchoolName = useCallback(async () => {
    if (schoolName !== DEFAULT_SCHOOL_NAME) return schoolName;
    try {
      const res = await api.getSiteSettings();
      const name = (res as { hero?: { schoolName?: string } }).hero?.schoolName?.trim();
      if (name) {
        setSchoolName(name);
        return name;
      }
    } catch {
      /* keep default */
    }
    return schoolName;
  }, [schoolName]);

  const requestExport = useCallback(
    async (schedule: Schedule, variant?: SchedulePdfVariant) => {
      setExportingId(schedule.id);
      try {
        const resolvedName = await resolveSchoolName();
        await exportSchedulePdf(schedule, {
          schoolName: resolvedName,
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
    [onError, resolveSchoolName]
  );

  const requestTeacherExport = useCallback(
    async (rows: TeacherScheduleRow[], title?: string) => {
      setExportingId("teacher");
      try {
        const resolvedName = await resolveSchoolName();
        await exportTeacherSchedulePdf(rows, { schoolName: resolvedName, title });
      } catch {
        onError?.("تعذر تصدير ملف PDF");
      } finally {
        setExportingId(null);
      }
    },
    [onError, resolveSchoolName]
  );

  return { exportingId, requestExport, requestTeacherExport };
}
