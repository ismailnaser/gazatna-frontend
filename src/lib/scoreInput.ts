export function formatScoreMax(maxScore: number): string {
  return Number.isInteger(maxScore) ? String(maxScore) : String(maxScore);
}

export function isValidScoreDraft(raw: string, maxScore: number): boolean {
  if (raw === "" || raw === ".") return true;
  if (!/^\d*\.?\d{0,2}$/.test(raw)) return false;
  if (raw.endsWith(".")) {
    const head = raw.slice(0, -1);
    if (head === "") return true;
    const n = Number(head);
    return Number.isFinite(n) && n >= 0 && n <= maxScore;
  }
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 && n <= maxScore;
}

export function applyScoreKey(
  current: string,
  key: "digit" | "dot" | "backspace" | "clear" | "zero" | "max",
  payload: string | undefined,
  maxScore: number
): string {
  let next = current;

  if (key === "backspace") {
    next = current.slice(0, -1);
  } else if (key === "clear") {
    next = "";
  } else if (key === "zero") {
    next = "0";
  } else if (key === "max") {
    next = formatScoreMax(maxScore);
  } else if (key === "dot") {
    if (current.includes(".")) return current;
    next = current === "" ? "0." : `${current}.`;
  } else if (key === "digit" && payload != null) {
    if (current === "0" && payload !== ".") {
      next = payload;
    } else {
      next = current + payload;
    }
  }

  return isValidScoreDraft(next, maxScore) ? next : current;
}

export function validateFinalScore(raw: string, maxScore: number): string | null {
  if (raw === "") return "يرجى إدخال الدرجة";
  const n = Number(raw);
  if (!Number.isFinite(n)) return "الدرجة غير صالحة";
  if (n < 0) return "الدرجة لا يمكن أن تكون سالبة";
  if (n > maxScore) return `الدرجة يجب ألا تتجاوز ${formatScoreMax(maxScore)}`;
  return null;
}
