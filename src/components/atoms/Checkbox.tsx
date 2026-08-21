"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type CheckboxProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  indeterminate?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
};

export function Checkbox({
  checked,
  defaultChecked,
  onChange,
  label,
  description,
  indeterminate = false,
  disabled = false,
  className,
  id,
  name,
}: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(Boolean(defaultChecked));
  const isOn = isControlled ? Boolean(checked) : internalChecked;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const box = (
    <span
      className={cn(
        "relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
        disabled && "opacity-50",
        isOn || indeterminate
          ? "border-brand-blue bg-brand-blue text-white"
          : "border-neutral-300 bg-white"
      )}
    >
      {indeterminate && !isOn ? <Minus className="h-3.5 w-3.5" strokeWidth={3} /> : null}
      {isOn ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
    </span>
  );

  const control = (
    <span className={cn("inline-flex items-start gap-3", className)}>
      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="checkbox"
        className="peer sr-only"
        checked={isOn}
        disabled={disabled}
        onChange={(event) => {
          if (!isControlled) setInternalChecked(event.target.checked);
          onChange?.(event.target.checked);
        }}
      />
      {box}
      {label || description ? (
        <span className="min-w-0">
          {label ? (
            <span className="block text-sm font-medium text-p-black">{label}</span>
          ) : null}
          {description ? (
            <span className="mt-0.5 block text-xs leading-relaxed text-p-black/65">{description}</span>
          ) : null}
        </span>
      ) : null}
    </span>
  );

  if (!label && !description) {
    return (
      <label htmlFor={inputId} className={cn(disabled ? "cursor-not-allowed" : "cursor-pointer")}>
        {control}
      </label>
    );
  }

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex cursor-pointer items-start rounded-xl px-1 py-0.5",
        disabled && "cursor-not-allowed"
      )}
    >
      {control}
    </label>
  );
}
