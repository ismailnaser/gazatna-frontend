"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { ClassScheduleEntry, Schedule } from "@/types/schedules";
import {
  buildStudentScheduleGrid,
  SCHEDULE_TYPE_LABELS,
  type StudentScheduleGridData,
} from "@/types/schedules";

type StudentScheduleGridProps = {
  schedule: Schedule;
  className?: string;
  pdfMode?: boolean;
};

const thClass =
  "border border-neutral-300 bg-neutral-100 px-3 py-2 text-center text-xs font-bold text-p-black";
const tdDayClass =
  "border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm font-semibold text-p-black";
const tdClass = "border border-neutral-300 px-3 py-2 text-center text-sm text-p-black";

const pdfThStyle: CSSProperties = {
  border: "1px solid #d4d4d4",
  background: "#f5f5f5",
  padding: "8px 10px",
  textAlign: "center",
  fontSize: "11px",
  fontWeight: 700,
  color: "#111",
};

const pdfTdDayStyle: CSSProperties = {
  border: "1px solid #d4d4d4",
  background: "#fafafa",
  padding: "8px 12px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#111",
  textAlign: "right",
};

const pdfTdStyle: CSSProperties = {
  border: "1px solid #d4d4d4",
  padding: "8px 10px",
  fontSize: "13px",
  color: "#111",
  textAlign: "center",
};

function renderGrid(
  schedule: Schedule,
  grid: StudentScheduleGridData,
  pdfMode: boolean
) {
  const thProps = pdfMode ? { style: pdfThStyle } : { className: thClass };
  const tdDayProps = pdfMode ? { style: pdfTdDayStyle } : { className: tdDayClass };
  const tdProps = pdfMode ? { style: pdfTdStyle } : { className: tdClass };

  return (
    <table
      className={cn("w-full min-w-[480px] border-collapse text-sm", pdfMode && "min-w-0")}
      style={pdfMode ? { width: "100%", borderCollapse: "collapse" } : undefined}
    >
      <thead>
        <tr>
          <th {...thProps}>اليوم</th>
          {grid.lessonColumns.map((column) => (
            <th key={column.key} {...thProps}>
              <div>{column.period}</div>
              {column.timeLabel && column.timeLabel !== "—" ? (
                <div
                  className={cn(!pdfMode && "mt-0.5 text-[10px] font-medium text-p-black/55")}
                  style={pdfMode ? { marginTop: "2px", fontSize: "10px", fontWeight: 500, color: "#666" } : undefined}
                >
                  {column.timeLabel}
                </div>
              ) : null}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {grid.rows.length === 0 ? (
          <tr>
            <td
              colSpan={Math.max(grid.lessonColumns.length + 1, 2)}
              {...(pdfMode
                ? { style: { ...pdfTdStyle, textAlign: "center", color: "#666" } }
                : { className: cn(tdClass, "text-center text-p-black/50") })}
            >
              لا توجد حصص في هذا الجدول
            </td>
          </tr>
        ) : (
          grid.rows.map((row, index) => (
            <tr
              key={row.day}
              style={pdfMode && index % 2 === 1 ? { background: "#fafafa" } : undefined}
              className={!pdfMode && index % 2 === 1 ? "bg-neutral-50/80" : undefined}
            >
              <td {...tdDayProps}>{row.day}</td>
              {row.subjects.map((subject, subjectIndex) => (
                <td
                  key={`${row.day}-${subjectIndex}`}
                  {...(pdfMode
                    ? { style: { ...pdfTdStyle, fontWeight: subject !== "—" ? 600 : 400 } }
                    : { className: cn(tdClass, subject !== "—" && "font-semibold") })}
                >
                  {subject}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

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
        {renderGrid(schedule, grid, pdfMode)}
      </div>
    </div>
  );
}

export function getStudentScheduleGridData(schedule: Schedule) {
  return buildStudentScheduleGrid(schedule.entries as ClassScheduleEntry[]);
}
