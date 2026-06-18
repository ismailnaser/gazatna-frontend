import { Calendar } from "lucide-react";
import { formatMetaDate } from "@/lib/dateDisplay";
import { cn } from "@/lib/utils";

export function DateMetaChip({
  label,
  dateTime,
  compact = false,
}: {
  label: string;
  dateTime: string;
  compact?: boolean;
}) {
  const { date, time } = formatMetaDate(dateTime);

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-neutral-100 bg-white shadow-sm",
        compact ? "px-2.5 py-2" : "px-3 py-2.5"
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue",
          compact ? "h-8 w-8" : "h-9 w-9"
        )}
      >
        <Calendar className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-p-black/45">{label}</p>
        <p
          className={cn(
            "mt-0.5 font-bold leading-snug text-p-black",
            compact ? "text-xs" : "text-sm"
          )}
          dir="ltr"
        >
          {date}
        </p>
        {time ? (
          <p className="mt-0.5 text-[11px] font-medium text-p-black/55" dir="ltr">
            {time}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function DateMetaGrid({
  items,
  compact = false,
  className,
}: {
  items: Array<{ label: string; dateTime: string }>;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-2", className)}>
      {items.map((item) => (
        <DateMetaChip
          key={item.label}
          label={item.label}
          dateTime={item.dateTime}
          compact={compact}
        />
      ))}
    </div>
  );
}
