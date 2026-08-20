"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/atoms/Button";
import { AdminScheduleFormPanel } from "@/components/admin/AdminScheduleFormPanel";
import { PageBusy, PageHeader } from "@/components/molecules/PageHeader";
import { useSchool } from "@/context/SchoolContext";
import { api } from "@/lib/api";
import type { Schedule, ScheduleEntry, ScheduleType } from "@/types/schedules";
import { mapSchedule } from "@/types/schedules";
import { ArrowRight } from "lucide-react";

function parseScheduleType(value: string | null): ScheduleType {
  return value === "class" ? "class" : "exam";
}

function parseClassIds(searchParams: URLSearchParams): string[] {
  const multi = searchParams.getAll("classIds").flatMap((v) => v.split(","));
  const single = searchParams.getAll("classId").flatMap((v) => v.split(","));
  return [...multi, ...single].map((v) => v.trim()).filter(Boolean);
}

function AdminScheduleCreatePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { classes, grades, subjects, teachers } = useSchool();
  const scheduleType = parseScheduleType(searchParams.get("type"));
  const initialClassIds = useMemo(() => parseClassIds(searchParams), [searchParams]);
  const [existingClassSchedules, setExistingClassSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .getAdminSchedules("class")
      .then((data) => setExistingClassSchedules((data as Array<Record<string, unknown>>).map(mapSchedule)))
      .catch(() => setExistingClassSchedules([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(payload: {
    name: string;
    scheduleType: ScheduleType;
    classIds: string[];
    entries: ScheduleEntry[];
    isPublished: boolean;
  }) {
    setSubmitting(true);
    setError("");
    try {
      await api.createAdminSchedule({
        name: payload.name,
        scheduleType: payload.scheduleType,
        classIds: payload.classIds.map(Number),
        entries: payload.entries,
        isPublished: payload.isPublished,
      });
      router.push("/admin/schedules");
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حفظ الجدول");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <PageBusy
        title={scheduleType === "exam" ? "جدول اختبارات جديد" : "جدول حصص جديد"}
        description="إنشاء جدول وربطه بالفصول"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title={scheduleType === "exam" ? "جدول اختبارات جديد" : "جدول حصص جديد"}
          description="إنشاء جدول وربطه بالفصول"
        />
        <Button href="/admin/schedules" variant="outline" className="gap-2">
          <ArrowRight className="h-4 w-4" />
          العودة للقائمة
        </Button>
      </div>

      <AdminScheduleFormPanel
        mode="create"
        scheduleType={scheduleType}
        initialClassIds={initialClassIds}
        classes={classes}
        grades={grades}
        subjects={subjects}
        teachers={teachers}
        existingClassSchedules={existingClassSchedules}
        error={error}
        submitting={submitting}
        onSubmit={handleSubmit}
        onClose={() => router.push("/admin/schedules")}
      />
    </div>
  );
}


export default function AdminScheduleCreatePage() {
  return (
    <Suspense
      fallback={
        <PageBusy title="جدول جديد" description="إنشاء جدول وربطه بالفصول" />
      }
    >
      <AdminScheduleCreatePageInner />
    </Suspense>
  );
}
