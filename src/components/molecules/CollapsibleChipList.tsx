"use client";

import { useState } from "react";
import { ChipList } from "@/components/molecules/ChipList";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

export function CollapsibleChipList({
  items,
  className,
  defaultOpen = false,
}: {
  items: string[];
  className?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (items.length === 0) return null;

  if (items.length === 1) {
    return <ChipList items={items} className={className} />;
  }

  return (
    <div className={cn(className)}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((value) => !value);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs font-semibold text-p-black/70 hover:bg-neutral-100"
      >
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {open ? "إخفاء الفصول" : `عرض الفصول (${items.length})`}
      </button>
      {open && <ChipList items={items} className="mt-2" />}
    </div>
  );
}
