"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/atoms/Button";
import { AdminScheduleFormPanel } from "@/components/admin/AdminScheduleFormPanel";
import { PageBusy, PageHeader } from "@/components/molecules/PageHeader";
import { useSchool } from "@/context/SchoolContext";
import { api } from "@/lib/api";
import type { Schedule, ScheduleEntry, ScheduleType } from "@/types/schedules";
import { mapSchedule } from "@/types/schedules";
import { ArrowRight } from "lucide-react";

export default function AdminScheduleEditPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const router = useRouter();
  const { classes, grades, subjects, teachers } = useSchool();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [existingClassSchedules, setExistingClassSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([api.getAdminSchedules(), api.getAdminSchedules("class")])
      .then(([all, classOnly]) => {
        const mappedAll = (all as Array<Record<string, unknown>>).map(mapSchedule);
        const found = mappedAll.find((row) => String(row.id) === id) ?? null;
        setSchedule(found);
        setExistingClassSchedules((classOnly as Array<Record<string, unknown>>).map(mapSchedule));
      })
      .catch(() => {
        setSchedule(null);
        setExistingClassSchedules([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(payload: {
    name: string;
    scheduleType: ScheduleType;
    classIds: string[];
    entries: ScheduleEntry[];
    isPublished: boolean;
  }) {
    if (!schedule) return;
    setSubmitting(true);
    setError("");
    try {
      await api.updateAdminSchedule(schedule.id, {
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
    return <PageBusy title="تعديل الجدول" description="تحديث بيانات الجدول" />;
  }

  if (!schedule) {
    return (
      <div className="space-y-4">
        <PageHeader title="تعديل الجدول" description="تعذر العثور على الجدول" />
        <Button href="/admin/schedules" variant="outline">
          العودة للقائمة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader title="تعديل الجدول" description={schedule.name} />
        <Button href="/admin/schedules" variant="outline" className="gap-2">
          <ArrowRight className="h-4 w-4" />
          العودة للقائمة
        </Button>
      </div>

      <AdminScheduleFormPanel
        key={schedule.id}
        mode="edit"
        scheduleType={schedule.scheduleType}
        editing={schedule}
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
