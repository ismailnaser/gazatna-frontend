import { cn } from "@/lib/utils";

export function PremiumPageHero({
  title,
  description,
  badge,
}: {
  title: string;
  description?: string;
  badge?: string;
}) {
  return (
    <div className="relative mb-14 overflow-hidden rounded-[2rem_1rem_2rem_1.2rem] border-[3px] border-brand-yellow bg-[#fff8ec] px-6 py-12 shadow-[-7px_8px_0_0_rgba(249,180,40,0.35)] sm:px-10 sm:py-14 lg:px-14">
      <span className="pointer-events-none absolute -start-6 -top-6 h-24 w-24 rounded-full bg-brand-yellow/50" aria-hidden />
      <span className="pointer-events-none absolute -bottom-8 -end-4 h-28 w-28 rounded-full bg-brand-blue/15" aria-hidden />
      <div className="relative max-w-3xl">
        {badge && (
          <span className="font-display inline-block rounded-full bg-brand-yellow px-4 py-1.5 text-xs font-extrabold text-p-black shadow-[-2px_2px_0_0_rgba(234,102,34,0.45)]">
            {badge}
          </span>
        )}
        <h1 className="font-display mt-4 text-3xl font-extrabold leading-tight text-p-black sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <div className="mt-4 flex items-center gap-3">
          <span className="h-2 w-14 rounded-full bg-brand-orange" />
          <span className="h-2 w-6 rounded-full bg-brand-blue" />
          <span className="h-2 w-3 rounded-full bg-brand-yellow" />
        </div>
        {description && (
          <p className="mt-5 text-base font-semibold leading-relaxed text-p-black/75 sm:text-lg">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export function PremiumPanel({
  icon,
  label,
  title,
  children,
  className,
  gradient = "from-brand-yellow/25 via-white to-white",
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}) {
  return (
    <div
      className={cn(
        "group relative h-full overflow-hidden rounded-[1.8rem_0.8rem_1.8rem_1rem] border-[3px] border-black/10 bg-linear-to-br p-8 shadow-[-6px_7px_0_0_rgba(66,76,243,0.12)]",
        gradient,
        className
      )}
    >
      <div className="relative">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-white shadow-[-3px_3px_0_0_rgba(249,180,40,0.7)]">
            {icon}
          </div>
          <span className="font-display text-xs font-extrabold text-brand-blue">{label}</span>
        </div>
        <h3 className="font-display text-2xl font-extrabold text-p-black">{title}</h3>
        <div className="mt-5 text-base font-semibold leading-relaxed text-p-black/75">{children}</div>
      </div>
    </div>
  );
}
