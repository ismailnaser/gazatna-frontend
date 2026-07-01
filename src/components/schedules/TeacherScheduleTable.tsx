"use client";

import { ClassScheduleGridView } from "@/components/schedules/ClassScheduleGridView";
import { cn } from "@/lib/utils";
import type { TeacherScheduleRow } from "@/types/schedules";
import { buildTeacherScheduleGrid } from "@/types/schedules";

type TeacherScheduleTableProps = {
  rows: TeacherScheduleRow[];
  title?: string;
  className?: string;
  pdfMode?: boolean;
};

export function TeacherScheduleTable({
  rows,
  title,
  className,
  pdfMode = false,
}: TeacherScheduleTableProps) {
  const grid = buildTeacherScheduleGrid(rows);

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
        <ClassScheduleGridView
          grid={grid}
          pdfMode={pdfMode}
          showClass
          compact
          emptyMessage="لا توجد حصص مسندة إليك في الجداول المنشورة حالياً"
        />
      </div>
    </div>
  );
}
