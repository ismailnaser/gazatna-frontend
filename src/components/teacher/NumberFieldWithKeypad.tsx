"use client";

import { useId } from "react";
import { Input } from "@/components/atoms/Input";
import type { NumberInputConfig } from "@/lib/numberInput";
import { isValidNumberDraft } from "@/lib/numberInput";
import { cn } from "@/lib/utils";

type NumberFieldWithKeypadProps = NumberInputConfig & {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  fieldId?: string;
  active?: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
  name?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  keypadLabel?: string;
  onConfirm?: () => void | boolean;
  confirmLabel?: string;
  saving?: boolean;
  showMaxButton?: boolean;
  maxButtonLabel?: string;
  placeholder?: string;
  compact?: boolean;
  showKeypadActions?: boolean;
};

export function NumberFieldWithKeypad({
  label,
  value,
  onChange,
  fieldId,
  onActivate,
  onDeactivate,
  name,
  required,
  className,
  inputClassName,
  placeholder,
  compact = false,
  min = 0,
  max,
  allowDecimal = false,
  maxDecimalPlaces = 2,
}: NumberFieldWithKeypadProps) {
  const autoId = useId();
  const inputId = fieldId ?? autoId;
  const config = { min, max, allowDecimal, maxDecimalPlaces };

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    if (isValidNumberDraft(next, config)) {
      onChange(next);
    }
  }

  return (
    <div className={cn(compact ? "min-w-0" : undefined, className)}>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <Input
        id={inputId}
        label={compact ? undefined : label}
        type="text"
        inputMode={allowDecimal ? "decimal" : "numeric"}
        value={value}
        onChange={handleChange}
        onFocus={() => onActivate?.()}
        onBlur={() => onDeactivate?.()}
        required={required}
        placeholder={placeholder}
        aria-label={compact ? label : undefined}
        className={inputClassName}
      />
    </div>
  );
}
