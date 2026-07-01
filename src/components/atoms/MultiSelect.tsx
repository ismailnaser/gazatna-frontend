"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type MultiSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  hint?: string;
};

type MultiSelectProps = {
  label?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  countLabel?: string;
  className?: string;
};

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "اختر...",
  countLabel = "فصول",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggle(id: string) {
    const option = options.find((item) => item.value === id);
    if (option?.disabled && !value.includes(id)) return;
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  }

  function selectAll() {
    onChange(options.filter((option) => !option.disabled).map((option) => option.value));
  }

  function clearAll() {
    onChange([]);
  }

  const summary =
    value.length === 0
      ? placeholder
      : value.length === 1
        ? (options.find((o) => o.value === value[0])?.label ?? `عنصر واحد`)
        : `${value.length} ${countLabel} محددة`;

  return (
    <div ref={rootRef} className={cn("relative flex flex-col gap-1.5", className)}>
      {label && <span className="text-sm font-medium text-p-black/80">{label}</span>}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-p-black",
          "focus:border-p-green focus:outline-none focus:ring-2 focus:ring-p-green/20"
        )}
      >
        <span className={cn("truncate text-start", value.length === 0 && "text-neutral-500")}>
          {summary}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-neutral-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-2 shadow-lg">
          <div className="mb-2 flex items-center justify-between gap-2 border-b border-neutral-100 px-2 pb-2 text-xs">
            <button
              type="button"
              onClick={selectAll}
              className="font-semibold text-brand-blue hover:underline"
            >
              تحديد الكل
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="font-semibold text-neutral-500 hover:underline"
            >
              إلغاء الكل
            </button>
          </div>
          <ul className="space-y-1">
            {options.map((opt) => {
              const checked = value.includes(opt.value);
              const disabled = Boolean(opt.disabled) && !checked;
              return (
                <li key={opt.value}>
                  <label
                    title={opt.hint}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
                      disabled
                        ? "cursor-not-allowed opacity-55"
                        : "cursor-pointer hover:bg-neutral-50",
                      checked && !disabled && "bg-p-green/5 font-medium text-p-green"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggle(opt.value)}
                      className="rounded text-p-green disabled:cursor-not-allowed"
                    />
                    <span className="min-w-0 truncate">
                      {opt.label}
                      {opt.hint ? (
                        <span className="mt-0.5 block text-[11px] font-normal text-p-black/45">
                          {opt.hint}
                        </span>
                      ) : null}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
