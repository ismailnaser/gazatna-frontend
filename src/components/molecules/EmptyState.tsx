import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[1.6rem_0.8rem_1.6rem_1rem] border-[3px] border-dashed border-brand-yellow bg-[#fff8ec] px-6 py-12 text-center",
        className
      )}
    >
      <p className="text-sm font-semibold text-p-black">{title}</p>
      {description ? (
        <p className="mt-1 max-w-md text-sm leading-relaxed text-p-black/65">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
