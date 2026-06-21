export type NumberInputConfig = {
  min?: number;
  max?: number;
  allowDecimal?: boolean;
  maxDecimalPlaces?: number;
};

export function formatNumberBound(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value);
}

function withinBounds(n: number, min: number, max?: number): boolean {
  if (!Number.isFinite(n)) return false;
  if (n < min) return false;
  if (max != null && n > max) return false;
  return true;
}

export function isValidNumberDraft(raw: string, config: NumberInputConfig): boolean {
  const { min = 0, max, allowDecimal = false, maxDecimalPlaces = 2 } = config;

  if (raw === "" || raw === ".") return true;

  if (!allowDecimal) {
    if (!/^\d+$/.test(raw)) return false;
    return withinBounds(Number(raw), min, max);
  }

  const pattern = new RegExp(`^\\d*\\.?\\d{0,${maxDecimalPlaces}}$`);
  if (!pattern.test(raw)) return false;

  if (raw.endsWith(".")) {
    const head = raw.slice(0, -1);
    if (head === "") return true;
    return withinBounds(Number(head), min, max);
  }

  return withinBounds(Number(raw), min, max);
}

export function applyNumberKey(
  current: string,
  key: "digit" | "dot" | "backspace" | "clear" | "zero" | "max",
  payload: string | undefined,
  config: NumberInputConfig
): string {
  const { max } = config;
  let next = current;

  if (key === "backspace") {
    next = current.slice(0, -1);
  } else if (key === "clear") {
    next = "";
  } else if (key === "zero") {
    next = "0";
  } else if (key === "max") {
    if (max == null) return current;
    next = formatNumberBound(max);
  } else if (key === "dot") {
    if (!config.allowDecimal || current.includes(".")) return current;
    next = current === "" ? "0." : `${current}.`;
  } else if (key === "digit" && payload != null) {
    if (current === "0" && payload !== ".") {
      next = payload;
    } else {
      next = current + payload;
    }
  }

  return isValidNumberDraft(next, config) ? next : current;
}

export function validateFinalNumber(raw: string, config: NumberInputConfig): string | null {
  const { min = 0, max } = config;
  if (raw === "" || raw === ".") return "يرجى إدخال رقم";
  const n = Number(raw);
  if (!Number.isFinite(n)) return "الرقم غير صالح";
  if (n < min) return `القيمة يجب ألا تقل عن ${formatNumberBound(min)}`;
  if (max != null && n > max) return `القيمة يجب ألا تتجاوز ${formatNumberBound(max)}`;
  return null;
}
