"use client";

import { useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import {
  ExpandRowButton,
  TABLE_BASE,
  TABLE_TD,
  TABLE_TH,
  TABLE_WRAP,
  TablePagination,
  useClientPagination,
} from "@/components/shared/DataTable";
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { page, totalPages, pageItems, pageSize, total, next, prev, setPage } =
    useClientPagination(schedules, 10);

  if (schedules.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-p-black/72">
        {hasActiveFilters ? "لا توجد نتائج مطابقة." : "لا توجد جداول في هذا القسم بعد."}
      </p>
    );
  }

  return (
    <div className={TABLE_WRAP}>
      <div className="overflow-x-auto">
        <table className={TABLE_BASE}>
          <thead>
            <tr>
              <th className={TABLE_TH}>اسم الجدول</th>
              <th className={cn(TABLE_TH, "w-36")}>النوع</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((schedule, index) => {
              const open = expandedId === schedule.id;
              return (
                <tr key={schedule.id} className={cn(index % 2 === 1 && "bg-neutral-50/70")}>
                  <td className={TABLE_TD} colSpan={open ? 2 : 1}>
                    {!open ? (
                      <ExpandRowButton
                        open={false}
                        label={schedule.name}
                        onClick={() => setExpandedId(schedule.id)}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-bold text-p-black">{schedule.name}</p>
                            <p className="mt-1 text-sm text-p-black/72">
                              {scheduleTypeLabel(schedule.scheduleType)} · {schedule.entries.length}{" "}
                              صف
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="px-3 py-1.5 text-xs"
                            onClick={() => setExpandedId(null)}
                          >
                            إغلاق
                          </Button>
                        </div>

                        <dl className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <dt className="text-xs font-semibold text-p-black/72">الحالة</dt>
                            <dd className="mt-1">
                              <Badge variant={schedule.isPublished ? "success" : "warning"}>
                                {schedule.isPublished ? "منشور" : "مسودة"}
                              </Badge>
                            </dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="text-xs font-semibold text-p-black/72">الفصول</dt>
                            <dd className="mt-0.5 text-sm font-medium text-p-black/80">
                              {schedule.classLabels.length > 0
                                ? schedule.classLabels.join(" · ")
                                : "—"}
                            </dd>
                          </div>
                        </dl>

                        <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-1.5 px-3 py-1.5 text-xs"
                            onClick={() => onEdit(schedule)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            تعديل
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-1.5 px-3 py-1.5 text-xs"
                            onClick={() => onPreview(schedule)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            معاينة
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-1.5 px-3 py-1.5 text-xs"
                            disabled={exportingId === schedule.id}
                            onClick={() => onExportPdf(schedule)}
                          >
                            <Download className="h-3.5 w-3.5" />
                            {exportingId === schedule.id ? "جاري..." : "PDF"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-1.5 px-3 py-1.5 text-xs text-p-red hover:text-p-red"
                            onClick={() => onDelete(schedule)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    )}
                  </td>
                  {!open ? (
                    <td className={TABLE_TD}>
                      <button type="button" onClick={() => setExpandedId(schedule.id)}>
                        <Badge variant="info">{scheduleTypeLabel(schedule.scheduleType)}</Badge>
                      </button>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPrev={prev}
        onNext={next}
        onPage={setPage}
      />
    </div>
  );
}
