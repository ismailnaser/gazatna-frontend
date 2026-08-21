import Link from "next/link";
import { cn } from "@/lib/utils";

export type PageBreadcrumb = {
  label: string;
  href?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: PageBreadcrumb[];
  className?: string;
}) {
  return (
    <div className={cn("mb-6", className)}>
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav aria-label="مسار الصفحة" className="mb-3 flex flex-wrap items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, index) => {
            const last = index === breadcrumbs.length - 1;
            return (
              <span key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                {index > 0 ? <span className="text-neutral-300">/</span> : null}
                {crumb.href && !last ? (
                  <Link
                    href={crumb.href}
                    prefetch={false}
                    className="font-medium text-p-black/60 hover:text-brand-blue"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={last ? "font-semibold text-p-black" : "text-p-black/60"}>
                    {crumb.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-p-black sm:text-3xl">{title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-1.5 w-12 rounded-full bg-brand-orange" />
            <span className="h-1.5 w-5 rounded-full bg-brand-yellow" />
          </div>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-p-black/70 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function PageBusy({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <PageHeader title={title} description={description} className="mb-4" />
      <div className="space-y-3">
        <div className="h-20 animate-pulse rounded-2xl bg-neutral-100" />
        <div className="h-36 animate-pulse rounded-2xl bg-neutral-100" />
      </div>
    </div>
  );
}
