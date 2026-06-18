import type { Quiz } from "@/types";
import { DateMetaGrid } from "@/components/molecules/DateMetaGrid";
import { cn } from "@/lib/utils";

export function QuizWindowBanner({
  quiz,
  compact = false,
  className,
}: {
  quiz: Quiz;
  compact?: boolean;
  className?: string;
}) {
  const endAt = quiz.endAt || quiz.dueDate;

  return (
    <DateMetaGrid
      compact={compact}
      className={cn(
        "rounded-xl border border-brand-blue/25 bg-brand-blue/5",
        compact ? "p-2.5" : "p-3.5",
        className
      )}
      items={[
        { label: "موعد البداية", dateTime: quiz.startAt },
        { label: "موعد النهاية", dateTime: endAt },
      ]}
    />
  );
}
