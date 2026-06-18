"use client";

import { Button } from "@/components/atoms/Button";
import {
  applyNumberKey,
  formatNumberBound,
  type NumberInputConfig,
} from "@/lib/numberInput";
import { cn } from "@/lib/utils";
import { Check, Delete, Eraser, Undo2 } from "lucide-react";

type NumberKeypadProps = NumberInputConfig & {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  saving?: boolean;
  showMaxButton?: boolean;
  maxButtonLabel?: string;
};

function KeyButton({
  children,
  onClick,
  className,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        "flex h-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-base font-semibold text-p-black shadow-sm transition-colors hover:bg-neutral-50 active:bg-neutral-100",
        className
      )}
    >
      {children}
    </button>
  );
}

export function NumberKeypad({
  value,
  onChange,
  min = 0,
  max,
  allowDecimal = false,
  maxDecimalPlaces = 2,
  label,
  className,
  onConfirm,
  onCancel,
  confirmLabel = "تأكيد",
  cancelLabel = "تراجع",
  saving = false,
  showMaxButton = true,
  maxButtonLabel,
}: NumberKeypadProps) {
  const config: NumberInputConfig = { min, max, allowDecimal, maxDecimalPlaces };

  function press(
    key: "digit" | "dot" | "backspace" | "clear" | "zero" | "max",
    payload?: string
  ) {
    onChange(applyNumberKey(value, key, payload, config));
  }

  const digits = ["7", "8", "9", "4", "5", "6", "1", "2", "3"];
  const rangeLabel =
    min > 0
      ? `من ${formatNumberBound(min)} إلى ${formatNumberBound(max)}`
      : `حتى ${formatNumberBound(max)}`;

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm",
        className
      )}
    >
      <div className="mb-3 rounded-xl bg-brand-blue/5 px-3 py-2 text-center">
        {label && <p className="text-[11px] font-medium text-p-black/50">{label}</p>}
        <p className="text-lg font-bold text-brand-blue">{value || "—"}</p>
        <p className="mt-0.5 text-xs text-p-black/45">{rangeLabel}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {digits.map((digit) => (
          <KeyButton key={digit} ariaLabel={digit} onClick={() => press("digit", digit)}>
            {digit}
          </KeyButton>
        ))}
        {allowDecimal ? (
          <KeyButton ariaLabel="فاصلة عشرية" onClick={() => press("dot")}>
            .
          </KeyButton>
        ) : (
          <div />
        )}
        <KeyButton ariaLabel="صفر" onClick={() => press("digit", "0")}>
          0
        </KeyButton>
        <KeyButton ariaLabel="حذف" onClick={() => press("backspace")}>
          <Delete className="h-5 w-5" />
        </KeyButton>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        {showMaxButton ? (
          <KeyButton
            className="text-xs"
            ariaLabel="القيمة القصوى"
            onClick={() => press("max")}
          >
            {maxButtonLabel ?? `أقصى (${formatNumberBound(max)})`}
          </KeyButton>
        ) : (
          <div />
        )}
        <KeyButton className="text-sm" ariaLabel="صفر" onClick={() => press("zero")}>
          0
        </KeyButton>
        <KeyButton className="text-xs" ariaLabel="مسح" onClick={() => press("clear")}>
          <span className="inline-flex items-center gap-1">
            <Eraser className="h-4 w-4" />
            مسح
          </span>
        </KeyButton>
      </div>

      {(onConfirm || onCancel) && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="gap-1.5"
              onClick={onCancel}
              disabled={saving}
            >
              <Undo2 className="h-4 w-4" />
              {cancelLabel}
            </Button>
          )}
          {onConfirm && (
            <Button
              type="button"
              className="gap-1.5"
              onClick={onConfirm}
              disabled={saving}
            >
              <Check className="h-4 w-4" />
              {saving ? "جاري الحفظ..." : confirmLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
