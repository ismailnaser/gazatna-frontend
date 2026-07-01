"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { StudentScheduleGridData } from "@/types/schedules";

type ClassScheduleGridViewProps = {
  grid: StudentScheduleGridData;
  pdfMode?: boolean;
  showTeacher?: boolean;
  showClass?: boolean;
  compact?: boolean;
  emptyMessage?: string;
};

const thClass =
  "border border-neutral-300 bg-neutral-100 px-2 py-2 text-center text-xs font-bold text-p-black";
const tdDayClass =
  "border border-neutral-300 bg-neutral-50 px-2 py-2 text-xs font-semibold text-p-black whitespace-nowrap";
const tdClass = "border border-neutral-300 px-2 py-2 text-center align-middle text-sm text-p-black";

const pdfThStyle: CSSProperties = {
  border: "1px solid #d4d4d4",
  background: "#f5f5f5",
  padding: "6px 8px",
  textAlign: "center",
  fontSize: "11px",
  fontWeight: 700,
  color: "#111",
};

const pdfTdDayStyle: CSSProperties = {
  border: "1px solid #d4d4d4",
  background: "#fafafa",
  padding: "6px 10px",
  fontSize: "12px",
  fontWeight: 600,
  color: "#111",
  textAlign: "right",
  whiteSpace: "nowrap",
};

const pdfTdStyle: CSSProperties = {
  border: "1px solid #d4d4d4",
  padding: "6px 8px",
  fontSize: "12px",
  color: "#111",
  textAlign: "center",
  verticalAlign: "middle",
};

function renderCellContent(
  cell: { subject: string; teacher: string; classLabel?: string },
  showTeacher: boolean,
  showClass: boolean,
  pdfMode: boolean
): ReactNode {
  const hasSubject = cell.subject && cell.subject !== "—";
  if (!hasSubject) {
    return <span className={cn(!pdfMode && "text-p-black/35")}>—</span>;
  }

  const secondaryLine =
    showClass && cell.classLabel
      ? `الفصل: ${cell.classLabel}`
      : showTeacher && cell.teacher
        ? `المعلم: ${cell.teacher}`
        : "";

  return (
    <div className="flex min-h-[2.25rem] flex-col items-center justify-center gap-0.5 leading-tight">
      <span className={cn("font-semibold", !pdfMode && "text-xs sm:text-sm")}>{cell.subject}</span>
      {secondaryLine ? (
        <span
          className={cn(!pdfMode && "text-[10px] font-normal text-p-black/55")}
          style={pdfMode ? { fontSize: "10px", fontWeight: 400, color: "#666" } : undefined}
        >
          {secondaryLine}
        </span>
      ) : null}
    </div>
  );
}

export function ClassScheduleGridView({
  grid,
  pdfMode = false,
  showTeacher = false,
  showClass = false,
  compact = false,
  emptyMessage = "لا توجد حصص في هذا الجدول",
}: ClassScheduleGridViewProps) {
  const thProps = pdfMode ? { style: pdfThStyle } : { className: thClass };
  const tdDayProps = pdfMode ? { style: pdfTdDayStyle } : { className: tdDayClass };
  const tdProps = pdfMode ? { style: pdfTdStyle } : { className: tdClass };
  const columnMinWidth = compact ? "min-w-[5.5rem]" : "min-w-[6.5rem]";

  return (
    <table
      className={cn(
        "w-full border-collapse text-sm",
        compact ? "min-w-[420px]" : "min-w-[480px]",
        pdfMode && "min-w-0"
      )}
      style={pdfMode ? { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" } : undefined}
    >
      <thead>
        <tr>
          <th
            {...thProps}
            className={cn(!pdfMode && thClass, !pdfMode && "min-w-[4.5rem] w-[4.5rem]")}
            style={pdfMode ? { ...pdfThStyle, textAlign: "right" } : undefined}
          >
            اليوم
          </th>
          {grid.lessonColumns.map((column) => (
            <th
              key={column.key}
              {...thProps}
              className={cn(!pdfMode && thClass, !pdfMode && columnMinWidth)}
            >
              <div className={cn(!pdfMode && "text-xs")}>{column.period}</div>
              {column.timeLabel && column.timeLabel !== "—" ? (
                <div
                  className={cn(!pdfMode && "mt-0.5 text-[10px] font-medium text-p-black/55")}
                  style={
                    pdfMode
                      ? { marginTop: "2px", fontSize: "10px", fontWeight: 500, color: "#666" }
                      : undefined
                  }
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
              {emptyMessage}
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
              {row.cells.map((cell, cellIndex) => (
                <td key={`${row.day}-${cellIndex}`} {...tdProps}>
                  {renderCellContent(cell, showTeacher, showClass, pdfMode)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
