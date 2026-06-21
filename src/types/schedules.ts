export type ScheduleType = "exam" | "class";

import {
  classLessonRangesOverlap,
  formatScheduleTime12,
  getClassLessonEndTime,
} from "@/lib/scheduleTime";

export type ExamScheduleEntry = {
  subject: string;
  date: string;
  time: string;
  duration: string;
  notes: string;
};

export type ClassScheduleEntry = {
  day: string;
  period: string;
  time: string;
  duration: string;
  subject: string;
  teacher: string;
  room: string;
  notes: string;
};

export type ScheduleEntry = ExamScheduleEntry | ClassScheduleEntry;

export type Schedule = {
  id: string;
  name: string;
  scheduleType: ScheduleType;
  classIds: string[];
  classLabels: string[];
  entries: ScheduleEntry[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export const SCHEDULE_TYPE_LABELS: Record<ScheduleType, string> = {
  exam: "جدول الاختبارات",
  class: "جدول الحصص",
};

/** أيام الأسبوع تبدأ من السبت */
export const WEEK_DAYS = [
  "السبت",
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
];

export const CLASS_DURATION_OPTIONS = [
  { value: "30", label: "30 دقيقة" },
  { value: "45", label: "45 دقيقة" },
  { value: "60", label: "ساعة واحدة" },
  { value: "75", label: "ساعة وربع" },
  { value: "90", label: "ساعة ونصف" },
] as const;

export const DEFAULT_CLASS_DURATION = "60";

export function parseClassDurationMinutes(value?: string | null): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : Number(DEFAULT_CLASS_DURATION);
}

export function formatClassDurationLabel(value?: string | null): string {
  const minutes = parseClassDurationMinutes(value);
  const match = CLASS_DURATION_OPTIONS.find((option) => option.value === String(minutes));
  if (match) return match.label;
  return `${minutes} دقيقة`;
}

export const CLASS_PERIOD_SUGGESTIONS = [
  "الحصة الأولى",
  "الحصة الثانية",
  "الحصة الثالثة",
  "الحصة الرابعة",
  "الحصة الخامسة",
  "الحصة السادسة",
  "الحصة السابعة",
  "الحصة الثامنة",
];

export function emptyExamEntry(): ExamScheduleEntry {
  return { subject: "", date: "", time: "", duration: "", notes: "" };
}

export function emptyClassEntry(day = ""): ClassScheduleEntry {
  return {
    day,
    period: "",
    time: "",
    duration: DEFAULT_CLASS_DURATION,
    subject: "",
    teacher: "",
    room: "",
    notes: "",
  };
}

/** يتوافق مع الجداول القديمة التي دمجت الحصة والوقت في حقل واحد */
export function normalizeClassEntry(entry: ClassScheduleEntry): ClassScheduleEntry {
  const duration = entry.duration?.trim() ? entry.duration : DEFAULT_CLASS_DURATION;
  if (entry.time?.trim()) {
    return { ...entry, duration };
  }
  const timeMatch = entry.period?.match(/\b(\d{1,2}:\d{2})\b/);
  if (!timeMatch) return { ...entry, duration };
  return {
    ...entry,
    duration,
    time: timeMatch[1],
    period: entry.period.replace(/\s*\(?\d{1,2}:\d{2}[^)]*\)?/g, "").trim(),
  };
}

function normalizeScheduleToken(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function getClassLessonConflict(
  dayEntries: ClassScheduleEntry[],
  lessonIndex: number,
  patch: Partial<ClassScheduleEntry>
): string | null {
  const current = { ...dayEntries[lessonIndex], ...patch };
  const period = normalizeScheduleToken(current.period);
  const time = normalizeScheduleToken(current.time);
  const duration = parseClassDurationMinutes(current.duration);

  for (let i = 0; i < dayEntries.length; i += 1) {
    if (i === lessonIndex) continue;
    const other = dayEntries[i];
    if (period && normalizeScheduleToken(other.period) === period) {
      return `رقم الحصة «${period}» مستخدم مسبقاً في هذا اليوم`;
    }
    const otherDuration = parseClassDurationMinutes(other.duration);
    if (
      time &&
      other.time &&
      classLessonRangesOverlap(time, duration, other.time, otherDuration)
    ) {
      const endTime = getClassLessonEndTime(other.time, otherDuration);
      const rangeLabel = endTime
        ? `${formatScheduleTime12(other.time)} – ${formatScheduleTime12(endTime)}`
        : formatScheduleTime12(other.time);
      return `يتداخل مع حصة أخرى (${rangeLabel})`;
    }
  }
  return null;
}

export function sortClassScheduleEntries(entries: ClassScheduleEntry[]): ClassScheduleEntry[] {
  return [...entries].sort((a, b) => {
    const dayDiff = WEEK_DAYS.indexOf(a.day) - WEEK_DAYS.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return (a.time || "").localeCompare(b.time || "");
  });
}

export function validateClassScheduleEntries(entries: ClassScheduleEntry[]): string | null {
  const byDay = new Map<string, ClassScheduleEntry[]>();
  for (const entry of entries) {
    const dayEntries = byDay.get(entry.day) ?? [];
    dayEntries.push(entry);
    byDay.set(entry.day, dayEntries);
  }

  for (const [day, dayEntries] of byDay) {
    for (let i = 0; i < dayEntries.length; i += 1) {
      const entry = dayEntries[i];
      if (!entry.period.trim()) {
        return `أدخل رقم الحصة في ${day}`;
      }
      if (!entry.time.trim()) {
        return `أدخل موعد الحصة في ${day}`;
      }
      if (!entry.duration.trim()) {
        return `أدخل مدة الحصة في ${day}`;
      }
      const conflict = getClassLessonConflict(dayEntries, i, {});
      if (conflict) {
        return `${day}: ${conflict}`;
      }
    }
  }
  return null;
}

export function mapSchedule(raw: Record<string, unknown>): Schedule {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    scheduleType: (raw.scheduleType as ScheduleType) ?? "exam",
    classIds: Array.isArray(raw.classIds) ? raw.classIds.map(String) : [],
    classLabels: Array.isArray(raw.classLabels) ? raw.classLabels.map(String) : [],
    entries: Array.isArray(raw.entries)
      ? (raw.scheduleType as ScheduleType) === "class"
        ? (raw.entries as ClassScheduleEntry[]).map(normalizeClassEntry)
        : (raw.entries as ScheduleEntry[])
      : [],
    isPublished: Boolean(raw.isPublished ?? true),
    createdAt: String(raw.createdAt ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
  };
}
