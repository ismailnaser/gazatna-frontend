"use client";

import { Button } from "@/components/atoms/Button";
import { applyScoreKey, formatScoreMax } from "@/lib/scoreInput";
import { cn } from "@/lib/utils";
import { Check, Delete, Eraser } from "lucide-react";

type ScoreKeypadProps = {
  value: string;
  onChange: (value: string) => void;
  maxScore: number;
  label?: string;
  className?: string;
  onConfirm?: () => void;
  confirmLabel?: string;
  saving?: boolean;
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

export function ScoreKeypad({
  value,
  onChange,
  maxScore,
  label,
  className,
  onConfirm,
  confirmLabel = "تأكيد التصحيح",
  saving = false,
}: ScoreKeypadProps) {
  function press(
    key: "digit" | "dot" | "backspace" | "clear" | "zero" | "max",
    payload?: string
  ) {
    onChange(applyScoreKey(value, key, payload, maxScore));
  }

  const digits = ["7", "8", "9", "4", "5", "6", "1", "2", "3"];

  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm",
        className
      )}
    >
      <div className="mb-3 rounded-xl bg-brand-blue/5 px-3 py-2 text-center">
        {label && <p className="text-[11px] font-medium text-p-black/50">{label}</p>}
        <p className="text-lg font-bold text-brand-blue">
          {value || "—"}
          <span className="ms-1 text-sm font-medium text-p-black/45">/ {formatScoreMax(maxScore)}</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {digits.map((digit) => (
          <KeyButton key={digit} ariaLabel={digit} onClick={() => press("digit", digit)}>
            {digit}
          </KeyButton>
        ))}
        <KeyButton ariaLabel="فاصلة عشرية" onClick={() => press("dot")}>
          .
        </KeyButton>
        <KeyButton ariaLabel="صفر" onClick={() => press("digit", "0")}>
          0
        </KeyButton>
        <KeyButton ariaLabel="حذف" onClick={() => press("backspace")}>
          <Delete className="h-5 w-5" />
        </KeyButton>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <KeyButton
          className="text-xs"
          ariaLabel="الدرجة الكاملة"
          onClick={() => press("max")}
        >
          كامل ({formatScoreMax(maxScore)})
        </KeyButton>
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

      {onConfirm && (
        <Button
          type="button"
          className="mt-3 w-full"
          onClick={onConfirm}
          disabled={saving}
        >
          <Check className="h-4 w-4" />
          {saving ? "جاري الحفظ..." : confirmLabel}
        </Button>
      )}
    </div>
  );
}
