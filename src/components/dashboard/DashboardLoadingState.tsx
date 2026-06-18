import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardLoadingStateProps = {
  message?: string;
  hint?: string;
  className?: string;
  compact?: boolean;
};

export function DashboardLoadingState({
  message = "جاري التحميل...",
  hint = "يرجى الانتظار قليلاً",
  className,
  compact = false,
}: DashboardLoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-neutral-100 bg-gradient-to-b from-white to-neutral-50/70 text-center shadow-sm",
        compact
          ? "px-4 py-8"
          : "min-h-[min(420px,calc(100dvh-12rem))] px-6 py-12",
        className
      )}
    >
      <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue/10 ring-1 ring-brand-blue/15">
        <Loader2 className="h-7 w-7 animate-spin text-brand-blue" aria-hidden />
      </div>

      <p className="text-base font-semibold text-p-black">{message}</p>
      {hint ? <p className="mt-2 max-w-xs text-sm leading-relaxed text-p-black/45">{hint}</p> : null}

      <div className="mt-6 h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-neutral-100">
        <div className="loading-bar h-full w-2/5 rounded-full bg-gradient-to-r from-brand-blue via-brand-blue-light to-brand-blue" />
      </div>

      <div className="mt-5 flex items-center gap-1.5" aria-hidden>
        <span className="loading-dot h-2 w-2 rounded-full bg-brand-blue" />
        <span className="loading-dot loading-dot-delay-1 h-2 w-2 rounded-full bg-brand-blue-light" />
        <span className="loading-dot loading-dot-delay-2 h-2 w-2 rounded-full bg-brand-orange" />
      </div>
    </div>
  );
}
