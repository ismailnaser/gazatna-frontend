"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Input } from "@/components/atoms/Input";
import { NumberKeypad } from "@/components/teacher/NumberKeypad";
import { useNumberKeypadGroup } from "@/components/teacher/NumberKeypadGroup";
import type { NumberInputConfig } from "@/lib/numberInput";
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
  active: activeProp,
  onActivate,
  onDeactivate,
  name,
  required,
  className,
  inputClassName,
  keypadLabel,
  onConfirm,
  confirmLabel,
  saving,
  showMaxButton,
  maxButtonLabel,
  placeholder,
  compact = false,
  showKeypadActions = true,
  min = 0,
  max,
  allowDecimal = false,
  maxDecimalPlaces = 2,
}: NumberFieldWithKeypadProps) {
  const autoId = useId();
  const resolvedFieldId = fieldId ?? autoId;
  const group = useNumberKeypadGroup();
  const anchorRef = useRef<HTMLDivElement>(null);
  const originalValueRef = useRef<string>("");
  const [localActive, setLocalActive] = useState(false);
  const [inView, setInView] = useState(true);

  const active =
    activeProp ?? (group ? group.activeId === resolvedFieldId : localActive);

  const actionsEnabled = showKeypadActions;

  function activate() {
    if (onActivate) {
      onActivate();
      return;
    }
    if (group) {
      group.setActiveId(resolvedFieldId);
      return;
    }
    setLocalActive(true);
  }

  function activateField() {
    originalValueRef.current = value;
    activate();
  }

  function handleConfirm() {
    if (onConfirm) {
      const keepOpen = onConfirm() === false;
      if (keepOpen) return;
    }
    deactivate();
  }

  function handleCancel() {
    onChange(originalValueRef.current);
    deactivate();
  }

  function deactivate() {
    if (onDeactivate) {
      onDeactivate();
      return;
    }
    if (group) {
      group.setActiveId(null);
      return;
    }
    setLocalActive(false);
  }

  useEffect(() => {
    if (!active || !anchorRef.current) {
      setInView(true);
      return;
    }

    const mq = window.matchMedia("(max-width: 639px)");
    if (mq.matches) {
      setInView(true);
      return;
    }

    const el = anchorRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [active]);

  const showKeypad = active && inView;

  useEffect(() => {
    if (!showKeypad) return;
    const mq = window.matchMedia("(max-width: 639px)");
    if (!mq.matches) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showKeypad]);

  return (
    <div
      ref={anchorRef}
      className={cn(
        compact ? "min-w-0" : "rounded-xl border-2 p-3 transition-colors",
        !compact && (active ? "border-brand-blue bg-brand-blue/5" : "border-transparent"),
        className
      )}
    >
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <Input
        label={compact ? undefined : label}
        readOnly
        inputMode="none"
        value={value}
        required={required}
        placeholder={placeholder}
        aria-label={compact ? label : undefined}
        onClick={activateField}
        onFocus={activateField}
        className={cn("cursor-pointer bg-white", inputClassName)}
      />
      {showKeypad && (
        <>
          <button
            type="button"
            aria-label="إغلاق لوحة الأرقام"
            className="fixed inset-0 z-[60] bg-black/40 sm:hidden"
            onClick={actionsEnabled ? handleCancel : deactivate}
          />
          <div
            className={cn(
              "fixed inset-x-0 bottom-0 z-[70] w-full pb-[env(safe-area-inset-bottom,0px)] sm:static sm:z-auto sm:pb-0",
              compact ? "sm:mt-2" : "sm:mt-3"
            )}
          >
            <NumberKeypad
              value={value}
              onChange={onChange}
              min={min}
              max={max}
              allowDecimal={allowDecimal}
              maxDecimalPlaces={maxDecimalPlaces}
              label={keypadLabel ?? label}
              onConfirm={actionsEnabled ? handleConfirm : onConfirm}
              onCancel={actionsEnabled ? handleCancel : undefined}
              confirmLabel={confirmLabel ?? "تأكيد التعديل"}
              saving={saving}
              showMaxButton={showMaxButton}
              maxButtonLabel={maxButtonLabel}
              className="w-full max-sm:rounded-t-2xl max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0 max-sm:shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
            />
          </div>
        </>
      )}
    </div>
  );
}
