"use client";

import { useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { api } from "@/lib/api";
import type { Schedule, ScheduleType } from "@/types/schedules";
import { mapSchedule, SCHEDULE_TYPE_LABELS } from "@/types/schedules";
import { Archive, Copy, Plus } from "lucide-react";

export type SchedulePendingAdoption = {
  classId: string;
  classLabel: string;
  previousScheduleId: string;
  previousScheduleName: string;
};

export type ScheduleRolloverContext = {
  currentTerm: { id: string; name: string; academicYearName: string } | null;
  previousTerm: { id: string; name: string; academicYearName: string } | null;
  currentSchedules: Schedule[];
  previousSchedules: Schedule[];
  pendingAdoptions: SchedulePendingAdoption[];
};

export function mapScheduleRolloverContext(raw: Record<string, unknown>): ScheduleRolloverContext {
  const mapTerm = (term: unknown) => {
    const row = term as Record<string, unknown> | null | undefined;
    if (!row?.id) return null;
    return {
      id: String(row.id),
      name: String(row.name ?? ""),
      academicYearName: String(row.academicYearName ?? ""),
    };
  };

  return {
    currentTerm: mapTerm(raw.currentTerm),
    previousTerm: mapTerm(raw.previousTerm),
    currentSchedules: Array.isArray(raw.currentSchedules)
      ? raw.currentSchedules.map((item) => mapSchedule(item as Record<string, unknown>))
      : [],
    previousSchedules: Array.isArray(raw.previousSchedules)
      ? raw.previousSchedules.map((item) => mapSchedule(item as Record<string, unknown>))
      : [],
    pendingAdoptions: Array.isArray(raw.pendingAdoptions)
      ? raw.pendingAdoptions.map((item) => {
          const row = item as Record<string, unknown>;
          return {
            classId: String(row.classId ?? ""),
            classLabel: String(row.classLabel ?? ""),
            previousScheduleId: String(row.previousScheduleId ?? ""),
            previousScheduleName: String(row.previousScheduleName ?? ""),
          };
        })
      : [],
  };
}

type AdminScheduleRolloverPanelProps = {
  scheduleType: ScheduleType;
  context: ScheduleRolloverContext;
  onChanged: () => Promise<void> | void;
  onCreateFresh: (classId: string) => void;
};

export function AdminScheduleRolloverPanel({
  scheduleType,
  context,
  onChanged,
  onCreateFresh,
}: AdminScheduleRolloverPanelProps) {
  const [busyClassId, setBusyClassId] = useState("");
  const [error, setError] = useState("");

  if (!context.previousTerm) return null;

  const typeLabel = SCHEDULE_TYPE_LABELS[scheduleType];
  const hasPrevious = context.previousSchedules.length > 0;
  const hasPending = context.pendingAdoptions.length > 0;

  if (!hasPrevious && !hasPending) return null;

  async function handleAdopt(classId: string, mode: "copy" | "fresh") {
    setBusyClassId(classId);
    setError("");
    try {
      await api.adoptAdminSchedules({
        scheduleType,
        classIds: [classId],
        mode,
      });
      await onChanged();
      if (mode === "fresh") {
        onCreateFresh(classId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تنفيذ الاختيار");
    } finally {
      setBusyClassId("");
    }
  }

  return (
    <Card className="space-y-4 border-brand-blue/20 bg-brand-blue/5 p-4">
      <div className="flex flex-wrap items-start gap-2">
        <Archive className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-p-black">جداول {typeLabel} — {context.previousTerm?.name}</h3>
          <p className="mt-1 text-sm text-p-black/60">
            هذه الجداول من الفترة السابقة ولا تظهر للطلاب والمعلمين. لكل شعبة بدون جدول في الفترة
            الحالية، اختر الاحتفاظ بنفس الجدول أو البدء بجدول جديد.
          </p>
        </div>
        <Badge variant="info">للإدارة فقط</Badge>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {hasPending ? (
        <div className="space-y-2">
          {context.pendingAdoptions.map((item) => (
            <div
              key={item.classId}
              className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-p-black">{item.classLabel}</p>
                <p className="mt-0.5 text-xs text-p-black/50">
                  جدول سابق: «{item.previousScheduleName}»
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={busyClassId === item.classId}
                  onClick={() => handleAdopt(item.classId, "copy")}
                >
                  <Copy className="h-4 w-4" />
                  الاحتفاظ بنفس الجدول
                </Button>
                <Button
                  type="button"
                  disabled={busyClassId === item.classId}
                  onClick={() => handleAdopt(item.classId, "fresh")}
                >
                  <Plus className="h-4 w-4" />
                  إنشاء جدول جديد
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Alert variant="info">تمت معالجة كل الشعب لهذا النوع من الجداول.</Alert>
      )}

      {hasPrevious ? (
        <div className="rounded-xl border border-neutral-200 bg-white/80 p-3">
          <p className="text-xs font-semibold text-p-black/55">الجداول المحفوظة من الفترة السابقة</p>
          <ul className="mt-2 space-y-1 text-sm text-p-black/70">
            {context.previousSchedules.map((schedule) => (
              <li key={schedule.id}>
                {schedule.name}
                {schedule.classLabels.length > 0 ? ` — ${schedule.classLabels.join(" · ")}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
