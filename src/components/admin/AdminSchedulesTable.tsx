"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { scheduleTypeLabel } from "@/components/schedules/ScheduleTable";
import { cn } from "@/lib/utils";
import type { Schedule } from "@/types/schedules";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";

type AdminSchedulesTableProps = {
  schedules: Schedule[];
  hasActiveFilters: boolean;
  exportingId: string | null;
  onEdit: (schedule: Schedule) => void;
  onDelete: (schedule: Schedule) => void;
  onPreview: (schedule: Schedule) => void;
  onExportPdf: (schedule: Schedule) => void;
};

export function AdminSchedulesTable({
  schedules,
  hasActiveFilters,
  exportingId,
  onEdit,
  onDelete,
  onPreview,
  onExportPdf,
}: AdminSchedulesTableProps) {
  if (schedules.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-p-black/50">
        {hasActiveFilters ? "لا توجد نتائج مطابقة." : "لا توجد جداول في هذا القسم بعد."}
      </p>
    );
  }

  return (
    <div className="-mx-3 overflow-x-auto sm:mx-0">
      <table className="w-full min-w-[880px] border-collapse border border-neutral-200 text-sm">
        <thead>
          <tr className="bg-neutral-50 text-p-black/55">
            <th className="border border-neutral-200 px-3 py-3 text-start text-xs font-bold sm:px-4">
              اسم الجدول
            </th>
            <th className="border border-neutral-200 px-3 py-3 text-start text-xs font-bold sm:px-4">
              النوع
            </th>
            <th className="border border-neutral-200 px-3 py-3 text-start text-xs font-bold sm:px-4">
              الفصول
            </th>
            <th className="border border-neutral-200 px-3 py-3 text-start text-xs font-bold sm:px-4">
              الصفوف
            </th>
            <th className="border border-neutral-200 px-3 py-3 text-start text-xs font-bold sm:px-4">
              الحالة
            </th>
            <th className="border border-neutral-200 px-3 py-3 text-start text-xs font-bold sm:px-4">
              إجراءات
            </th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule, index) => (
            <tr key={schedule.id} className={cn(index % 2 === 1 && "bg-neutral-50/50")}>
              <td className="border border-neutral-200 px-3 py-3 align-top sm:px-4">
                <p className="font-semibold text-p-black">{schedule.name}</p>
              </td>
              <td className="border border-neutral-200 px-3 py-3 align-top sm:px-4">
                {scheduleTypeLabel(schedule.scheduleType)}
              </td>
              <td className="border border-neutral-200 px-3 py-3 align-top text-p-black/75 sm:px-4">
                {schedule.classLabels.length > 0 ? schedule.classLabels.join(" · ") : "—"}
              </td>
              <td className="border border-neutral-200 px-3 py-3 align-top sm:px-4" dir="ltr">
                {schedule.entries.length}
              </td>
              <td className="border border-neutral-200 px-3 py-3 align-top sm:px-4">
                <Badge variant={schedule.isPublished ? "success" : "warning"}>
                  {schedule.isPublished ? "منشور" : "مسودة"}
                </Badge>
              </td>
              <td className="border border-neutral-200 px-3 py-3 align-top sm:px-4">
                <div className="flex min-w-[10rem] flex-col gap-1.5">
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-1.5 px-2 py-1.5 text-xs"
                    onClick={() => onPreview(schedule)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    عرض
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-1.5 px-2 py-1.5 text-xs"
                    onClick={() => onExportPdf(schedule)}
                    disabled={exportingId === schedule.id}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {exportingId === schedule.id ? "جاري التصدير..." : "PDF"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-1.5 px-2 py-1.5 text-xs"
                    onClick={() => onEdit(schedule)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    تعديل
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-center gap-1.5 px-2 py-1.5 text-xs text-p-red"
                    onClick={() => onDelete(schedule)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    حذف
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
