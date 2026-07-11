import { Logo } from "@/components/atoms/Logo";
import { cn } from "@/lib/utils";

type AppLoadingScreenProps = {
  message?: string;
  className?: string;
  fullScreen?: boolean;
};

export function AppLoadingScreen({
  message = "جاري تحميل المنصة...",
  className,
  fullScreen = true,
}: AppLoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center bg-gradient-to-b from-white via-brand-cream/40 to-brand-blue-light/10 px-6",
        fullScreen ? "fixed inset-0 z-[100] min-h-screen" : "min-h-[50vh] rounded-2xl",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -end-16 -top-16 h-56 w-56 rounded-full bg-brand-blue/5 blur-3xl" />
        <div className="absolute -bottom-20 -start-10 h-64 w-64 rounded-full bg-brand-orange/5 blur-3xl" />
      </div>

      <div className="relative flex w-full max-w-sm flex-col items-center text-center">
        <div className="loading-logo-pulse mb-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
          <Logo variant="icon" href={undefined} className="h-16 w-16 sm:h-20 sm:w-20" />
        </div>

        <h1 className="text-lg font-bold text-p-black sm:text-xl">مدرسة غزتنا الخاصة</h1>
        <div className="mt-2 h-1 w-14 rounded-full bg-p-red" />

        <p className="mt-5 text-sm font-medium text-p-black/55">{message}</p>

        <div className="mt-6 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-neutral-100">
          <div className="loading-bar h-full w-2/5 rounded-full bg-gradient-to-r from-brand-blue via-brand-blue-light to-brand-blue" />
        </div>

        <div className="mt-5 flex items-center gap-1.5" aria-hidden>
          <span className="loading-dot h-2 w-2 rounded-full bg-brand-blue" />
          <span className="loading-dot loading-dot-delay-1 h-2 w-2 rounded-full bg-brand-blue-light" />
          <span className="loading-dot loading-dot-delay-2 h-2 w-2 rounded-full bg-brand-orange" />
        </div>
      </div>
    </div>
  );
}
