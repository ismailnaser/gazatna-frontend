function parseTime24(value: string): { hour: number; minute: string } | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = match[2];
  if (hour < 0 || hour > 23 || Number(minute) > 59) return null;
  return { hour, minute };
}

export function parseTimeToMinutes(value: string): number | null {
  const parsed = parseTime24(value);
  if (!parsed) return null;
  return parsed.hour * 60 + Number(parsed.minute);
}

export function minutesToTime24(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function getClassLessonEndTime(startTime: string, durationMinutes: number): string | null {
  const start = parseTimeToMinutes(startTime);
  if (start == null || durationMinutes <= 0) return null;
  return minutesToTime24(start + durationMinutes);
}

export function classLessonRangesOverlap(
  aStart: string,
  aDurationMinutes: number,
  bStart: string,
  bDurationMinutes: number
): boolean {
  const aStartMin = parseTimeToMinutes(aStart);
  const bStartMin = parseTimeToMinutes(bStart);
  if (aStartMin == null || bStartMin == null || aDurationMinutes <= 0 || bDurationMinutes <= 0) {
    return false;
  }
  const aEnd = aStartMin + aDurationMinutes;
  const bEnd = bStartMin + bDurationMinutes;
  return aStartMin < bEnd && aEnd > bStartMin;
}

/** يحوّل وقت 24 ساعة (مثل 17:30) إلى 12 ساعة مع صباحاً / مساءً */
export function formatScheduleTime12(value?: string | null): string {
  if (!value?.trim()) return "—";
  const parsed = parseTime24(value);
  if (!parsed) return value.trim();

  const { hour, minute } = parsed;
  const isPm = hour >= 12;
  const hour12 = hour % 12 || 12;
  const period = isPm ? "مساءً" : "صباحاً";
  return `${hour12}:${minute} ${period}`;
}

export function formatClassLessonTimeRange(startTime?: string | null, durationMinutes?: number): string {
  if (!startTime?.trim()) return "—";
  const duration = durationMinutes && durationMinutes > 0 ? durationMinutes : 60;
  const endTime = getClassLessonEndTime(startTime, duration);
  if (!endTime) return formatScheduleTime12(startTime);
  return `${formatScheduleTime12(startTime)} – ${formatScheduleTime12(endTime)}`;
}

/** يحوّل الأوقات داخل نص الحصة (مثل 08:00-08:45) */
export function formatSchedulePeriodText(value?: string | null): string {
  if (!value?.trim()) return "—";
  return value.replace(/\b(\d{1,2}:\d{2})\b/g, (token) => {
    const parsed = parseTime24(token);
    if (!parsed) return token;
    const isPm = parsed.hour >= 12;
    const hour12 = parsed.hour % 12 || 12;
    const period = isPm ? "مساءً" : "صباحاً";
    return `${hour12}:${parsed.minute} ${period}`;
  });
}
