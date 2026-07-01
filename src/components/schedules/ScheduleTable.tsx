"use client";

import type { CSSProperties } from "react";
import { ClassScheduleGridView } from "@/components/schedules/ClassScheduleGridView";
import { formatScheduleTime12 } from "@/lib/scheduleTime";
import { cn } from "@/lib/utils";
import type { ClassScheduleEntry, Schedule, ScheduleType } from "@/types/schedules";
import {
  buildStudentScheduleGrid,
  SCHEDULE_TYPE_LABELS,
} from "@/types/schedules";

type ScheduleTableProps = {
  schedule: Schedule;
  className?: string;
  pdfMode?: boolean;
};

const thClass = "border border-neutral-300 bg-neutral-100 px-3 py-2 text-start text-xs font-bold text-p-black";
const tdClass = "border border-neutral-300 px-3 py-2 text-sm text-p-black align-top";

const pdfThStyle: CSSProperties = {
  border: "1px solid #d4d4d4",
  background: "#f5f5f5",
  padding: "8px 12px",
  textAlign: "right",
  fontSize: "12px",
  fontWeight: 700,
  color: "#111",
};

const pdfTdStyle: CSSProperties = {
  border: "1px solid #d4d4d4",
  padding: "8px 12px",
  fontSize: "13px",
  color: "#111",
  verticalAlign: "top",
};

export function ScheduleTable({ schedule, className, pdfMode = false }: ScheduleTableProps) {
  const isExam = schedule.scheduleType === "exam";
  const classGrid = isExam ? null : buildStudentScheduleGrid(schedule.entries as ClassScheduleEntry[]);
  const thProps = pdfMode ? { style: pdfThStyle } : { className: thClass };
  const tdProps = pdfMode ? { style: pdfTdStyle } : { className: tdClass };

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
            <p className="text-xs text-p-black/60">الفصول: {schedule.classLabels.join(" · ")}</p>
          ) : null}
        </div>
      ) : null}

      {isExam ? (
        <div className={cn(!pdfMode && "overflow-x-auto rounded-xl border border-neutral-200")}>
          <table
            className={cn("w-full min-w-[640px] border-collapse text-sm", pdfMode && "min-w-0")}
            style={pdfMode ? { width: "100%", borderCollapse: "collapse" } : undefined}
          >
            <thead>
              <tr>
                <th {...thProps}>المادة</th>
                <th {...thProps}>التاريخ</th>
                <th {...thProps}>الوقت</th>
                <th {...thProps}>المدة (دقيقة)</th>
                <th {...thProps}>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {schedule.entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    {...(pdfMode
                      ? { style: { ...pdfTdStyle, textAlign: "center", color: "#666" } }
                      : { className: cn(tdClass, "text-center text-p-black/50") })}
                  >
                    لا توجد صفوف في هذا الجدول
                  </td>
                </tr>
              ) : (
                schedule.entries.map((entry, index) => (
                  <tr
                    key={index}
                    style={pdfMode && index % 2 === 1 ? { background: "#fafafa" } : undefined}
                    className={!pdfMode && index % 2 === 1 ? "bg-neutral-50/80" : undefined}
                  >
                    <td
                      {...(pdfMode
                        ? { style: { ...pdfTdStyle, fontWeight: 600 } }
                        : { className: cn(tdClass, "font-semibold") })}
                    >
                      {(entry as { subject?: string }).subject || "—"}
                    </td>
                    <td
                      {...(pdfMode
                        ? { style: { ...pdfTdStyle, direction: "ltr" } }
                        : { className: tdClass, dir: "ltr" })}
                    >
                      {(entry as { date?: string }).date || "—"}
                    </td>
                    <td {...(pdfMode ? { style: pdfTdStyle } : { className: tdClass })}>
                      {formatScheduleTime12((entry as { time?: string }).time)}
                    </td>
                    <td
                      {...(pdfMode
                        ? { style: { ...pdfTdStyle, direction: "ltr" } }
                        : { className: tdClass, dir: "ltr" })}
                    >
                      {(entry as { duration?: string }).duration || "—"}
                    </td>
                    <td {...(pdfMode ? { style: pdfTdStyle } : { className: tdClass })}>
                      {(entry as { notes?: string }).notes || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={cn(!pdfMode && "overflow-x-auto rounded-xl border border-neutral-200")}>
          {classGrid ? (
            <ClassScheduleGridView grid={classGrid} pdfMode={pdfMode} showTeacher compact />
          ) : null}
        </div>
      )}
    </div>
  );
}

export function scheduleTypeLabel(type: ScheduleType) {
  return SCHEDULE_TYPE_LABELS[type];
}
