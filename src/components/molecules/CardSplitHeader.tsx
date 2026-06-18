import { cn } from "@/lib/utils";

export function CardSplitHeader({
  children,
  actions,
  className,
  contentClassName,
  actionsClassName,
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  actionsClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className={cn("min-w-0 w-full flex-1", contentClassName)}>{children}</div>
      {actions ? (
        <div
          className={cn(
            "flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end",
            actionsClassName
          )}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}
