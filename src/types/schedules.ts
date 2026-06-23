export type ScheduleType = "exam" | "class";

import {
  classLessonRangesOverlap,
  formatClassLessonTimeRange,
  formatScheduleTime12,
  getClassLessonEndTime,
  parseTimeToMinutes,
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

export type ClassScheduleGridColumn = {
  period: string;
  time: string;
  duration: string;
};

export type ClassScheduleGridCell = {
  subject: string;
  teacher: string;
  room: string;
};

export type ClassScheduleGridState = {
  lessonsPerDay: number;
  daysPerWeek: number;
  columns: ClassScheduleGridColumn[];
  cells: Record<string, ClassScheduleGridCell>;
};

export function classScheduleCellKey(day: string, lessonIndex: number) {
  return `${day}::${lessonIndex}`;
}

export function emptyClassScheduleGridCell(): ClassScheduleGridCell {
  return { subject: "", teacher: "", room: "" };
}

export function defaultClassScheduleGridState(): ClassScheduleGridState {
  const lessonsPerDay = 6;
  const daysPerWeek = 5;
  return {
    lessonsPerDay,
    daysPerWeek,
    columns: Array.from({ length: lessonsPerDay }, (_, index) => ({
      period: CLASS_PERIOD_SUGGESTIONS[index] ?? `الحصة ${index + 1}`,
      time: "",
      duration: DEFAULT_CLASS_DURATION,
    })),
    cells: {},
  };
}

export function parseClassScheduleGrid(entries: ClassScheduleEntry[]): ClassScheduleGridState {
  const normalized = entries.map(normalizeClassEntry);
  if (normalized.length === 0) {
    return defaultClassScheduleGridState();
  }

  const dayIndices = normalized.map((entry) => WEEK_DAYS.indexOf(entry.day)).filter((index) => index >= 0);
  const daysPerWeek = Math.min(
    7,
    Math.max(1, dayIndices.length ? Math.max(...dayIndices) + 1 : 5)
  );
  const lessonsPerDay = Math.min(
    8,
    Math.max(
      1,
      ...WEEK_DAYS.slice(0, daysPerWeek).map(
        (day) => normalized.filter((entry) => entry.day === day).length
      )
    )
  );

  const columns: ClassScheduleGridColumn[] = Array.from({ length: lessonsPerDay }, (_, index) => ({
    period: CLASS_PERIOD_SUGGESTIONS[index] ?? `الحصة ${index + 1}`,
    time: "",
    duration: DEFAULT_CLASS_DURATION,
  }));
  const cells: Record<string, ClassScheduleGridCell> = {};

  for (const day of WEEK_DAYS.slice(0, daysPerWeek)) {
    const dayEntries = sortClassScheduleEntries(normalized.filter((entry) => entry.day === day));
    dayEntries.forEach((entry, index) => {
      let lessonIndex = CLASS_PERIOD_SUGGESTIONS.indexOf(entry.period);
      if (lessonIndex < 0) lessonIndex = Math.min(index, lessonsPerDay - 1);
      if (lessonIndex < 0 || lessonIndex >= lessonsPerDay) return;

      columns[lessonIndex] = {
        period: entry.period || columns[lessonIndex].period,
        time: entry.time || columns[lessonIndex].time,
        duration: entry.duration || columns[lessonIndex].duration,
      };
      cells[classScheduleCellKey(day, lessonIndex)] = {
        subject: entry.subject,
        teacher: entry.teacher,
        room: entry.room,
      };
    });
  }

  return {
    lessonsPerDay,
    daysPerWeek,
    columns: reconcileClassScheduleColumns(columns, 0),
    cells,
  };
}

export function resizeClassScheduleGrid(
  state: ClassScheduleGridState,
  lessonsPerDay: number,
  daysPerWeek: number
): ClassScheduleGridState {
  const nextLessons = Math.min(8, Math.max(1, lessonsPerDay));
  const nextDays = Math.min(7, Math.max(1, daysPerWeek));
  const columns: ClassScheduleGridColumn[] = Array.from({ length: nextLessons }, (_, index) => {
    const existing = state.columns[index];
    return (
      existing ?? {
        period: CLASS_PERIOD_SUGGESTIONS[index] ?? `الحصة ${index + 1}`,
        time: "",
        duration: DEFAULT_CLASS_DURATION,
      }
    );
  });

  const cells: Record<string, ClassScheduleGridCell> = {};
  for (const day of WEEK_DAYS.slice(0, nextDays)) {
    for (let index = 0; index < nextLessons; index += 1) {
      const key = classScheduleCellKey(day, index);
      cells[key] = state.cells[key] ?? emptyClassScheduleGridCell();
    }
  }

  return {
    lessonsPerDay: nextLessons,
    daysPerWeek: nextDays,
    columns: reconcileClassScheduleColumns(columns, 0),
    cells,
  };
}

export function serializeClassScheduleGrid(state: ClassScheduleGridState): ClassScheduleEntry[] {
  const result: ClassScheduleEntry[] = [];

  for (const day of WEEK_DAYS.slice(0, state.daysPerWeek)) {
    for (let index = 0; index < state.lessonsPerDay; index += 1) {
      const cell = state.cells[classScheduleCellKey(day, index)] ?? emptyClassScheduleGridCell();
      const column = state.columns[index];
      if (!cell.subject.trim() && !cell.teacher.trim() && !cell.room.trim()) continue;

      result.push({
        day,
        period: column.period,
        time: column.time,
        duration: column.duration || DEFAULT_CLASS_DURATION,
        subject: cell.subject,
        teacher: cell.teacher,
        room: cell.room,
        notes: "",
      });
    }
  }

  return sortClassScheduleEntries(result);
}

export function getClassLessonMinStartTime(
  columns: ClassScheduleGridColumn[],
  lessonIndex: number
): string | null {
  if (lessonIndex <= 0) return null;
  const previous = columns[lessonIndex - 1];
  return getClassLessonEndTime(previous.time, parseClassDurationMinutes(previous.duration));
}

export function reconcileClassScheduleColumns(
  columns: ClassScheduleGridColumn[],
  changedIndex = 0
): ClassScheduleGridColumn[] {
  const next = columns.map((column) => ({ ...column }));

  if (changedIndex > 0) {
    const minimumStart = getClassLessonMinStartTime(next, changedIndex);
    const current = next[changedIndex];
    if (minimumStart && current.time.trim()) {
      const currentMinutes = parseTimeToMinutes(current.time);
      const minimumMinutes = parseTimeToMinutes(minimumStart);
      if (
        currentMinutes != null &&
        minimumMinutes != null &&
        currentMinutes < minimumMinutes
      ) {
        next[changedIndex] = { ...current, time: minimumStart };
      }
    }
  }

  for (let index = 0; index < next.length - 1; index += 1) {
    const current = next[index];
    const endTime = getClassLessonEndTime(
      current.time,
      parseClassDurationMinutes(current.duration)
    );
    if (!endTime) continue;

    const following = next[index + 1];
    if (!following.time.trim()) continue;

    const followingStart = parseTimeToMinutes(following.time);
    const endMinutes = parseTimeToMinutes(endTime);
    if (
      followingStart != null &&
      endMinutes != null &&
      followingStart < endMinutes
    ) {
      next[index + 1] = { ...following, time: endTime };
    }
  }

  return next;
}

export function validateClassScheduleColumns(columns: ClassScheduleGridColumn[]): string | null {
  for (let index = 1; index < columns.length; index += 1) {
    const previous = columns[index - 1];
    const current = columns[index];
    if (!previous.time.trim() || !current.time.trim()) continue;

    const previousDuration = parseClassDurationMinutes(previous.duration);
    const currentDuration = parseClassDurationMinutes(current.duration);
    if (
      classLessonRangesOverlap(previous.time, previousDuration, current.time, currentDuration)
    ) {
      const endTime = getClassLessonEndTime(previous.time, previousDuration);
      const prevLabel = previous.period || `الحصة ${index}`;
      const currLabel = current.period || `الحصة ${index + 1}`;
      if (endTime) {
        return `موعد ${currLabel} يتداخل مع ${prevLabel}. يجب أن يبدأ بعد ${formatScheduleTime12(endTime)}`;
      }
      return `موعد ${currLabel} يتداخل مع ${prevLabel}`;
    }
  }
  return null;
}

export function validateClassScheduleGrid(state: ClassScheduleGridState): string | null {
  const columnError = validateClassScheduleColumns(state.columns);
  if (columnError) return columnError;
  for (let index = 0; index < state.lessonsPerDay; index += 1) {
    const column = state.columns[index];
    const hasSubject = WEEK_DAYS.slice(0, state.daysPerWeek).some((day) => {
      const cell = state.cells[classScheduleCellKey(day, index)];
      return Boolean(cell?.subject.trim());
    });
    if (hasSubject && !column.time.trim()) {
      return `أدخل موعد ${column.period}`;
    }
  }

  return validateClassScheduleEntries(serializeClassScheduleGrid(state));
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
    const periodDiff =
      CLASS_PERIOD_SUGGESTIONS.indexOf(a.period) - CLASS_PERIOD_SUGGESTIONS.indexOf(b.period);
    if (periodDiff !== 0) return periodDiff;
    return (a.time || "").localeCompare(b.time || "");
  });
}

export type StudentScheduleLessonColumn = {
  key: string;
  period: string;
  timeLabel: string;
};

export type StudentScheduleGridRow = {
  day: string;
  subjects: string[];
};

export type StudentScheduleGridData = {
  lessonColumns: StudentScheduleLessonColumn[];
  rows: StudentScheduleGridRow[];
};

export function buildStudentScheduleGrid(entries: ClassScheduleEntry[]): StudentScheduleGridData {
  const normalized = sortClassScheduleEntries(entries.map(normalizeClassEntry));
  if (normalized.length === 0) {
    return { lessonColumns: [], rows: [] };
  }

  const lessonMeta = new Map<
    string,
    { period: string; time: string; duration: string; order: number }
  >();

  for (const entry of normalized) {
    const key = entry.period.trim() || entry.time.trim();
    if (!key) continue;
    if (!lessonMeta.has(key)) {
      lessonMeta.set(key, {
        period: entry.period.trim() || key,
        time: entry.time,
        duration: entry.duration,
        order: CLASS_PERIOD_SUGGESTIONS.indexOf(entry.period),
      });
    }
  }

  const lessonColumns = [...lessonMeta.entries()]
    .sort(([, a], [, b]) => {
      const orderA = a.order >= 0 ? a.order : 999;
      const orderB = b.order >= 0 ? b.order : 999;
      if (orderA !== orderB) return orderA - orderB;
      return (a.time || "").localeCompare(b.time || "");
    })
    .map(([key, column]) => ({
      key,
      period: column.period,
      timeLabel: formatClassLessonTimeRange(
        column.time,
        parseClassDurationMinutes(column.duration)
      ),
    }));

  const days = [...new Set(normalized.map((entry) => entry.day).filter(Boolean))].sort(
    (a, b) => WEEK_DAYS.indexOf(a) - WEEK_DAYS.indexOf(b)
  );

  const rows = days.map((day) => ({
    day,
    subjects: lessonColumns.map((column) => {
      const match = normalized.find(
        (entry) => entry.day === day && (entry.period.trim() || entry.time.trim()) === column.key
      );
      return match?.subject?.trim() || "—";
    }),
  }));

  return { lessonColumns, rows };
}

export type TeacherScheduleRow = {
  id: string;
  scheduleId: string;
  scheduleName: string;
  day: string;
  time: string;
  duration: string;
  subject: string;
  classLabel: string;
};

export function mapTeacherScheduleRow(raw: Record<string, unknown>): TeacherScheduleRow {
  return {
    id: String(raw.id ?? ""),
    scheduleId: String(raw.scheduleId ?? ""),
    scheduleName: String(raw.scheduleName ?? ""),
    day: String(raw.day ?? ""),
    time: String(raw.time ?? ""),
    duration: String(raw.duration ?? DEFAULT_CLASS_DURATION),
    subject: String(raw.subject ?? ""),
    classLabel: String(raw.classLabel ?? ""),
  };
}

export function sortTeacherScheduleRows(rows: TeacherScheduleRow[]): TeacherScheduleRow[] {
  return [...rows].sort((a, b) => {
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
