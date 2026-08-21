"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared native-select look with a clear custom chevron (site-wide filters). */
export const selectControlClassName = cn(
  "w-full appearance-none rounded-2xl border-2 border-black/10 bg-white py-2.5 pe-10 ps-4 text-sm font-semibold text-p-black",
  "focus:border-p-green focus:outline-none focus:ring-2 focus:ring-p-green/20",
  "cursor-pointer disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-p-black/70"
);

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
};

export function Select({
  label,
  options,
  className,
  id,
  error,
  disabled,
  ...props
}: SelectProps) {
  const selectId = id ?? label;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-p-black/80">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          disabled={disabled}
          className={cn(
            selectControlClassName,
            error && "border-p-red focus:border-p-red focus:ring-p-red/20",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-p-black/70"
          aria-hidden
        />
      </div>
      {error ? <p className="text-xs text-p-red">{error}</p> : null}
    </div>
  );
}
