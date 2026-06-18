"use client";

import { NumberFieldWithKeypad } from "@/components/teacher/NumberFieldWithKeypad";

type ScoreFieldWithKeypadProps = {
  active: boolean;
  onActivate: () => void;
  onDeactivate?: () => void;
  value: string;
  onChange: (value: string) => void;
  maxScore: number;
  inputLabel: string;
  keypadLabel?: string;
  onConfirm?: () => void | boolean;
  confirmLabel?: string;
  saving?: boolean;
  className?: string;
  fieldId?: string;
};

export function ScoreFieldWithKeypad({
  active,
  onActivate,
  onDeactivate,
  value,
  onChange,
  maxScore,
  inputLabel,
  keypadLabel,
  onConfirm,
  confirmLabel,
  saving,
  className,
  fieldId,
}: ScoreFieldWithKeypadProps) {
  return (
    <NumberFieldWithKeypad
      fieldId={fieldId}
      active={active}
      onActivate={onActivate}
      onDeactivate={onDeactivate}
      label={inputLabel}
      value={value}
      onChange={onChange}
      min={0}
      max={maxScore}
      allowDecimal
      maxDecimalPlaces={2}
      maxButtonLabel={`كامل (${maxScore})`}
      keypadLabel={keypadLabel}
      onConfirm={onConfirm}
      confirmLabel={confirmLabel}
      saving={saving}
      showKeypadActions
      className={className}
    />
  );
}
