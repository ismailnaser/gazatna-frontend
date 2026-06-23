"use client";

import type { CSSProperties } from "react";
import { formatClassLessonTimeRange } from "@/lib/scheduleTime";
import { cn } from "@/lib/utils";
import type { TeacherScheduleRow } from "@/types/schedules";
import { parseClassDurationMinutes, sortTeacherScheduleRows } from "@/types/schedules";

type TeacherScheduleTableProps = {
  rows: TeacherScheduleRow[];
  title?: string;
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
  textAlign: "right",
};

export function TeacherScheduleTable({
  rows,
  title,
  className,
  pdfMode = false,
}: TeacherScheduleTableProps) {
  const displayRows = sortTeacherScheduleRows(rows);
  const thProps = pdfMode ? { style: pdfThStyle } : { className: thClass };
  const tdProps = pdfMode ? { style: pdfTdStyle } : { className: tdClass };

  return (
    <div
      className={cn("space-y-3", className)}
      dir="rtl"
      style={pdfMode ? { fontFamily: "Tahoma, Arial, sans-serif", background: "#fff", color: "#111" } : undefined}
    >
      {pdfMode && title ? (
        <div className="space-y-1 border-b border-neutral-300 pb-3">
          <h1 className="text-lg font-bold text-p-black">{title}</h1>
          <p className="text-sm text-p-black/70">جدول حصصي الأسبوعي</p>
        </div>
      ) : null}

      <div className={cn(!pdfMode && "overflow-x-auto rounded-xl border border-neutral-200")}>
        <table
          className={cn("w-full min-w-[560px] border-collapse text-sm", pdfMode && "min-w-0")}
          style={pdfMode ? { width: "100%", borderCollapse: "collapse" } : undefined}
        >
          <thead>
            <tr>
              <th {...thProps}>اليوم</th>
              <th {...thProps}>موعد الحصة</th>
              <th {...thProps}>الفصل والشعبة</th>
              <th {...thProps}>المادة</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  {...(pdfMode
                    ? { style: { ...pdfTdStyle, textAlign: "center", color: "#666" } }
                    : { className: cn(tdClass, "text-center text-p-black/50") })}
                >
                  لا توجد حصص مسندة إليك في الجداول المنشورة حالياً
                </td>
              </tr>
            ) : (
              displayRows.map((row, index) => (
                <tr
                  key={row.id}
                  style={pdfMode && index % 2 === 1 ? { background: "#fafafa" } : undefined}
                  className={!pdfMode && index % 2 === 1 ? "bg-neutral-50/80" : undefined}
                >
                  <td
                    {...(pdfMode
                      ? { style: { ...pdfTdStyle, fontWeight: 600 } }
                      : { className: cn(tdClass, "font-semibold") })}
                  >
                    {row.day || "—"}
                  </td>
                  <td {...tdProps}>
                    {formatClassLessonTimeRange(row.time, parseClassDurationMinutes(row.duration))}
                  </td>
                  <td {...tdProps}>{row.classLabel || "—"}</td>
                  <td
                    {...(pdfMode
                      ? { style: { ...pdfTdStyle, fontWeight: 600 } }
                      : { className: cn(tdClass, "font-semibold") })}
                  >
                    {row.subject || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
