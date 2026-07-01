"use client";

import { ClassScheduleGridView } from "@/components/schedules/ClassScheduleGridView";
import { cn } from "@/lib/utils";
import type { ClassScheduleEntry, Schedule } from "@/types/schedules";
import { buildStudentScheduleGrid, SCHEDULE_TYPE_LABELS } from "@/types/schedules";

type StudentScheduleGridProps = {
  schedule: Schedule;
  className?: string;
  pdfMode?: boolean;
};

export function StudentScheduleGrid({ schedule, className, pdfMode = false }: StudentScheduleGridProps) {
  const grid = buildStudentScheduleGrid(schedule.entries as ClassScheduleEntry[]);

  return (
    <div
      className={cn("space-y-3", className)}
      dir="rtl"
      style={pdfMode ? { fontFamily: "Tahoma, Arial, sans-serif", background: "#fff", color: "#111" } : undefined}
    >
      {pdfMode ? (
        <div className="space-y-1 border-b border-neutral-300 pb-3">
          <h1 className="text-lg font-bold text-p-black">{schedule.name}</h1>
          <p className="text-sm text-p-black/70">{SCHEDULE_TYPE_LABELS[schedule.scheduleType]}</p>
          {schedule.classLabels.length > 0 ? (
            <p className="text-xs text-p-black/60">الشعبة: {schedule.classLabels.join(" · ")}</p>
          ) : null}
        </div>
      ) : null}

      <div className={cn(!pdfMode && "overflow-x-auto rounded-xl border border-neutral-200")}>
        <ClassScheduleGridView grid={grid} pdfMode={pdfMode} compact />
      </div>
    </div>
  );
}

export function getStudentScheduleGridData(schedule: Schedule) {
  return buildStudentScheduleGrid(schedule.entries as ClassScheduleEntry[]);
}
