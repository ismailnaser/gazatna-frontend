import type { Homework, HomeworkSubmission } from "@/types";
import { AlertTriangle } from "lucide-react";
import { DateMetaGrid } from "@/components/molecules/DateMetaGrid";
import { formatDisplayDateTime } from "@/lib/dateDisplay";
import { cn } from "@/lib/utils";

export function formatHomeworkDateTime(value?: string) {
  return formatDisplayDateTime(value);
}

export function isHomeworkMissed(hw: Homework, submission?: HomeworkSubmission) {
  return (
    !submission &&
    (hw.windowStatus === "ended" || hw.windowStatus === "closed")
  );
}

export function HomeworkWindowBanner({
  hw,
  submission,
  compact = false,
  className,
}: {
  hw: Homework;
  submission?: HomeworkSubmission;
  compact?: boolean;
  className?: string;
}) {
  const missed = isHomeworkMissed(hw, submission);
  const endAt = hw.endAt || hw.dueDate;

  return (
    <div className={cn("space-y-3", className)}>
      {missed && (
        <div
          className={cn(
            "flex items-start gap-2 rounded-xl border border-red-200 bg-red-50",
            compact ? "px-3 py-2" : "px-4 py-3"
          )}
        >
          <AlertTriangle className={cn("shrink-0 text-red-600", compact ? "mt-0.5 h-4 w-4" : "h-5 w-5")} />
          <div>
            <p className={cn("font-bold text-red-700", compact ? "text-sm" : "text-base")}>فائت</p>
            <p className={cn("text-red-600", compact ? "text-xs" : "text-sm")}>
              انتهى موعد التسليم ولم يتم تسليم الواجب.
            </p>
          </div>
        </div>
      )}

      <DateMetaGrid
        compact={compact}
        className={cn(
          "rounded-xl border border-brand-blue/25 bg-brand-blue/5",
          compact ? "p-2.5" : "p-3.5"
        )}
        items={[
          { label: "موعد البداية", dateTime: hw.startAt ?? hw.dueDate },
          { label: "موعد النهاية", dateTime: endAt },
        ]}
      />
    </div>
  );
}
