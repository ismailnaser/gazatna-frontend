"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardLoadingState } from "./DashboardLoadingState";

export type WorkspaceBreadcrumb = {
  label: string;
  href?: string;
};

export function WorkspacePage({
  title,
  description,
  actions,
  breadcrumbs,
  children,
  loading = false,
  loadingMessage = "جاري التحميل...",
  loadingHint = "يرجى الانتظار قليلاً",
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: WorkspaceBreadcrumb[];
  children?: React.ReactNode;
  loading?: boolean;
  loadingMessage?: string;
  loadingHint?: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl", className)}>
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav aria-label="مسار الصفحة" className="mb-4 flex flex-wrap items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, index) => {
            const last = index === breadcrumbs.length - 1;
            return (
              <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                {index > 0 ? (
                  <ChevronLeft className="h-3.5 w-3.5 text-neutral-400" aria-hidden />
                ) : null}
                {crumb.href && !last ? (
                  <Link
                    href={crumb.href}
                    prefetch={false}
                    className="font-medium text-p-black/65 transition-colors hover:text-brand-blue"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={last ? "font-semibold text-p-black" : "text-p-black/65"}>
                    {crumb.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      ) : null}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-p-black sm:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-p-black/70 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>

      {loading ? (
        <DashboardLoadingState compact message={loadingMessage} hint={loadingHint} />
      ) : (
        children
      )}
    </div>
  );
}
