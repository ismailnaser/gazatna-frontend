const DATE_OPTS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

const TIME_OPTS: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
};

export function parseIsoDate(value?: string | null) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return parseDateTime(value);
}

export function parseDateTime(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}


/** تاريخ رقمي داخل حقول الإدخال (مثال: 01/09/2026) */
export function formatInputDate(value?: string | null) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec((value ?? "").trim());
  if (!match) return "";
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/** أسماء الأشهر الميلادية الشائعة (يناير، فبراير، ...) */
const GREGORIAN_AR_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
] as const;

export function formatGregorianDate(value?: string | null) {
  const parsed = parseIsoDate(value);
  if (!parsed) return "—";
  const day = parsed.getDate();
  const month = GREGORIAN_AR_MONTHS[parsed.getMonth()];
  const year = parsed.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatMetaDate(value?: string | null) {
  const parsed = parseIsoDate(value);
  if (!parsed) return { date: "—", time: "" };
  return {
    date: parsed.toLocaleDateString("ar-PS", DATE_OPTS),
    time: parsed.toLocaleTimeString("ar-PS", TIME_OPTS),
  };
}

export function formatDisplayDateTime(value?: string | null) {
  const { date, time } = formatMetaDate(value);
  if (date === "—") return "—";
  return time ? `${date} · ${time}` : date;
}
