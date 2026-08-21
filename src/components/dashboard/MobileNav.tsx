"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getDashboardNav } from "@/data/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { LayoutGrid, MoreHorizontal, X } from "lucide-react";

export function MobileNav({
  role,
  newGradesCount = 0,
}: {
  role: UserRole;
  newGradesCount?: number;
}) {
  const pathname = usePathname();
  const items = getDashboardNav(role).filter(
    (item, index, arr) => arr.findIndex((i) => i.href === item.href) === index
  );

  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMoreOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const activeIndex = useMemo(() => {
    return items.findIndex((item) => pathname === item.href || pathname.startsWith(item.href + "/"));
  }, [items, pathname]);

  const { mainItems, overflowItems } = useMemo(() => {
    const MAX_MAIN = 4;
    if (items.length <= MAX_MAIN) return { mainItems: items, overflowItems: [] };

    const preferredMain = items.slice(0, MAX_MAIN - 1);
    const rest = items.slice(MAX_MAIN - 1);

    const activeItem = activeIndex >= 0 ? items[activeIndex] : null;
    if (!activeItem) {
      return { mainItems: preferredMain, overflowItems: rest };
    }

    const activeInPreferred = preferredMain.some((i) => i.href === activeItem.href);
    if (activeInPreferred) {
      return { mainItems: preferredMain, overflowItems: rest };
    }

    const swappedMain = [...preferredMain.slice(0, Math.max(0, preferredMain.length - 1)), activeItem];
    const nextOverflow = items.filter((i) => !swappedMain.some((m) => m.href === i.href));
    return { mainItems: swappedMain, overflowItems: nextOverflow };
  }, [items, activeIndex]);

  const overflowActive = overflowItems.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <>
      <nav
        className={cn(
          "fixed bottom-0 start-0 end-0 z-40 flex pb-[env(safe-area-inset-bottom)] md:hidden",
          role === "parent"
            ? "border-t-[3px] border-brand-yellow bg-[#fff8ec]"
            : "border-t border-neutral-200 bg-white"
        )}
        aria-label="التنقل السريع"
      >
        {mainItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          const showParentGradesBadge =
            role === "parent" && item.href === "/parent/grades" && newGradesCount > 0;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              prefetch={false}
              className={cn(
                "relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-medium leading-tight",
                active ? "text-brand-blue" : "text-p-black/72"
              )}
            >
              <span className="relative">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    active && role === "parent" && "bg-brand-yellow shadow-[-2px_2px_0_0_rgba(234,102,34,0.35)]"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                </span>
                {showParentGradesBadge && (
                  <span className="absolute -top-1.5 -start-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                    {newGradesCount > 9 ? "9+" : newGradesCount}
                  </span>
                )}
              </span>
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}

        {overflowItems.length > 0 && (
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-medium leading-tight",
              moreOpen || overflowActive ? "text-p-green" : "text-p-black/72"
            )}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
          >
            <MoreHorizontal className="h-5 w-5 shrink-0" />
            <span>المزيد</span>
          </button>
        )}
      </nav>

      {moreOpen && overflowItems.length > 0 && (
        <div className="fixed inset-0 z-50 md:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="إغلاق القائمة"
            onClick={() => setMoreOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-nav-sheet-title"
            className="absolute inset-x-0 bottom-0 flex max-h-[min(78vh,520px)] flex-col rounded-t-3xl bg-white shadow-2xl"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-p-green/10">
                  <LayoutGrid className="h-5 w-5 text-p-green" />
                </span>
                <div>
                  <h2 id="mobile-nav-sheet-title" className="text-base font-bold text-p-black">
                    القائمة
                  </h2>
                  <p className="text-xs text-p-black/72">الأقسام الأخرى في الحساب</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-p-black/78 transition-colors hover:bg-neutral-100"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                {overflowItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  const showParentGradesBadge =
                    role === "parent" && item.href === "/parent/grades" && newGradesCount > 0;
                  return (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      prefetch={false}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "relative flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-center text-sm font-semibold transition-colors",
                        active
                          ? "border-p-green/30 bg-p-green/10 text-p-green"
                          : "border-neutral-100 bg-neutral-50 text-p-black/75 active:bg-neutral-100"
                      )}
                    >
                      <span className="relative">
                        <Icon className="h-6 w-6 shrink-0" />
                        {showParentGradesBadge && (
                          <span className="absolute -top-1.5 -start-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                            {newGradesCount > 9 ? "9+" : newGradesCount}
                          </span>
                        )}
                      </span>
                      <span className="leading-snug">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
