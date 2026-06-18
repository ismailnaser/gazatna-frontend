const DATE_OPTS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

const TIME_OPTS: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
};

export function parseDateTime(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatMetaDate(value?: string | null) {
  const parsed = parseDateTime(value);
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
