"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { selectControlClassName } from "@/components/atoms/Select";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

export const TABLE_WRAP = "overflow-hidden rounded-xl border border-neutral-200 bg-white";
export const TABLE_BASE = "w-full border-collapse text-sm";
export const TABLE_TH =
  "border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-start text-xs font-bold text-p-black/75";
export const TABLE_TD = "border-b border-neutral-100 px-4 py-3 align-middle text-p-black";

export function useClientPagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages, items.length]);

  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, pageSize, safePage]);

  function go(next: number) {
    setPage(Math.min(totalPages, Math.max(1, next)));
  }

  return {
    page: safePage,
    totalPages,
    pageItems,
    pageSize,
    total: items.length,
    setPage: go,
    next: () => go(safePage + 1),
    prev: () => go(safePage - 1),
  };
}

export function TablePagination({
  page,
  totalPages,
  total,
  pageSize,
  onPrev,
  onNext,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPrev: () => void;
  onNext: () => void;
  onPage?: (page: number) => void;
}) {
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 bg-neutral-50/80 px-4 py-3">
      <p className="text-sm text-p-black/78">
        عرض {from}–{to} من {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="gap-1 px-3 py-1.5 text-xs"
          disabled={page <= 1}
          onClick={onPrev}
        >
          <ChevronRight className="h-3.5 w-3.5" />
          السابق
        </Button>
        <span className="min-w-16 text-center text-sm font-semibold text-p-black">
          {page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          className="gap-1 px-3 py-1.5 text-xs"
          disabled={page >= totalPages}
          onClick={onNext}
        >
          التالي
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        {onPage ? (
          <div className="relative">
            <select
              className={cn(selectControlClassName, "w-auto min-w-[7.5rem] py-1.5 pe-8 ps-2 text-xs")}
              value={page}
              onChange={(e) => onPage(Number(e.target.value))}
              aria-label="رقم الصفحة"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  صفحة {n}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute end-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-p-black/70"
              aria-hidden
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ExpandRowButton({
  open,
  onClick,
  label,
}: {
  open: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg px-2 py-2 text-start transition-colors",
        "hover:bg-brand-blue/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-p-green/30"
      )}
      aria-expanded={open}
    >
      <span className="font-semibold text-p-black">{label}</span>
      <span className="mt-0.5 block text-xs text-p-black/72">
        {open ? "إخفاء التفاصيل" : "عرض التفاصيل والإجراءات"}
      </span>
    </button>
  );
}
