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

/** أيام الدوام المدرسي (من السبت إلى الخميس) */
export const SCHOOL_WEEK_DAYS = WEEK_DAYS.slice(0, 6);

export const SCHOOL_DAYS_PER_WEEK_MAX = SCHOOL_WEEK_DAYS.length;

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
  rowDays: string[];
  columns: ClassScheduleGridColumn[];
  cells: Record<string, ClassScheduleGridCell>;
};

export function classScheduleCellKey(day: string, lessonIndex: number) {
  return `${day}::${lessonIndex}`;
}

export function emptyClassScheduleGridCell(): ClassScheduleGridCell {
  return { subject: "", teacher: "", room: "" };
}

export function defaultRowDays(count: number): string[] {
  const size = Math.min(SCHOOL_DAYS_PER_WEEK_MAX, Math.max(1, count));
  return [...SCHOOL_WEEK_DAYS.slice(0, size)];
}

export function ensureRowDays(rowDays: string[], count: number): string[] {
  const next = rowDays.filter((day) => SCHOOL_WEEK_DAYS.includes(day)).slice(0, count);
  while (next.length < count) {
    const candidate = SCHOOL_WEEK_DAYS.find((day) => !next.includes(day));
    if (!candidate) break;
    next.push(candidate);
  }
  return next;
}

export function defaultClassScheduleGridState(): ClassScheduleGridState {
  const lessonsPerDay = 6;
  const daysPerWeek = 5;
  return {
    lessonsPerDay,
    daysPerWeek,
    rowDays: defaultRowDays(daysPerWeek),
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

  const daysWithData = [
    ...new Set(
      normalized
        .map((entry) => entry.day)
        .filter((day) => SCHOOL_WEEK_DAYS.includes(day))
    ),
  ].sort((a, b) => WEEK_DAYS.indexOf(a) - WEEK_DAYS.indexOf(b));
  const daysPerWeek = Math.min(
    SCHOOL_DAYS_PER_WEEK_MAX,
    Math.max(1, daysWithData.length || 5)
  );
  const rowDays = ensureRowDays(
    daysWithData.length > 0 ? daysWithData : defaultRowDays(daysPerWeek),
    daysPerWeek
  );
  const lessonsPerDay = Math.min(
    8,
    Math.max(
      1,
      ...rowDays.map((day) => normalized.filter((entry) => entry.day === day).length)
    )
  );

  const columns: ClassScheduleGridColumn[] = Array.from({ length: lessonsPerDay }, (_, index) => ({
    period: CLASS_PERIOD_SUGGESTIONS[index] ?? `الحصة ${index + 1}`,
    time: "",
    duration: DEFAULT_CLASS_DURATION,
  }));
  const cells: Record<string, ClassScheduleGridCell> = {};

  for (const day of rowDays) {
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
    rowDays,
    columns: reconcileClassScheduleColumns(columns, 0),
    cells,
  };
}

/** يبني هيكل الجدول (مواعيد الحصص والأيام) من جدول مرجعي مع إفراغ المواد أو الإبقاء على الخلايا الحالية. */
export function createGridWithScheduleTimings(
  templateEntries: ClassScheduleEntry[],
  preserveCellsFrom?: ClassScheduleGridState
): ClassScheduleGridState {
  const template = parseClassScheduleGrid(templateEntries);
  const cells: Record<string, ClassScheduleGridCell> = {};

  for (const day of template.rowDays) {
    for (let index = 0; index < template.lessonsPerDay; index += 1) {
      const key = classScheduleCellKey(day, index);
      cells[key] = preserveCellsFrom?.cells[key] ?? emptyClassScheduleGridCell();
    }
  }

  return {
    lessonsPerDay: template.lessonsPerDay,
    daysPerWeek: template.daysPerWeek,
    rowDays: [...template.rowDays],
    columns: reconcileClassScheduleColumns(
      template.columns.map((column) => ({ ...column })),
      0
    ),
    cells,
  };
}

export function formatClassScheduleTemplateLabel(schedule: {
  name: string;
  classLabels: string[];
}): string {
  const classes =
    schedule.classLabels.length > 0 ? ` (${schedule.classLabels.join(" · ")})` : "";
  return `${schedule.name}${classes}`;
}

export function resizeClassScheduleGrid(
  state: ClassScheduleGridState,
  lessonsPerDay: number,
  daysPerWeek: number
): ClassScheduleGridState {
  const nextLessons = Math.min(8, Math.max(1, lessonsPerDay));
  const nextDays = Math.min(SCHOOL_DAYS_PER_WEEK_MAX, Math.max(1, daysPerWeek));
  const rowDays = ensureRowDays(state.rowDays, nextDays);
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
  for (const day of rowDays) {
    for (let index = 0; index < nextLessons; index += 1) {
      const key = classScheduleCellKey(day, index);
      cells[key] = state.cells[key] ?? emptyClassScheduleGridCell();
    }
  }

  return {
    lessonsPerDay: nextLessons,
    daysPerWeek: nextDays,
    rowDays,
    columns: reconcileClassScheduleColumns(columns, 0),
    cells,
  };
}

export function serializeClassScheduleGrid(state: ClassScheduleGridState): ClassScheduleEntry[] {
  const result: ClassScheduleEntry[] = [];

  for (const day of state.rowDays) {
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

export function validateClassScheduleGrid(
  state: ClassScheduleGridState,
  options?: { otherClassSchedules?: Schedule[] }
): string | null {
  const columnError = validateClassScheduleColumns(state.columns);
  if (columnError) return columnError;
  for (let index = 0; index < state.lessonsPerDay; index += 1) {
    const column = state.columns[index];
    const hasSubject = state.rowDays.some((day) => {
      const cell = state.cells[classScheduleCellKey(day, index)];
      return Boolean(cell?.subject.trim());
    });
    if (hasSubject && !column.time.trim()) {
      return `أدخل موعد ${column.period}`;
    }
  }

  const serialized = serializeClassScheduleGrid(state);
  if (serialized.length === 0) {
    return "أضف مادة واحدة على الأقل في الجدول قبل الحفظ";
  }
  const entriesError = validateClassScheduleEntries(serialized);
  if (entriesError) return entriesError;

  if (options?.otherClassSchedules?.length) {
    return validateTeacherAcrossClassSchedules(serialized, options.otherClassSchedules);
  }

  return null;
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

function normalizeTeacherName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export type ClassScheduleLessonSlot = {
  teacher: string;
  teacherDisplay: string;
  day: string;
  time: string;
  duration: number;
  subject: string;
  period: string;
};

export function collectClassScheduleLessons(
  entries: ClassScheduleEntry[]
): ClassScheduleLessonSlot[] {
  return entries.map(normalizeClassEntry).flatMap((entry) => {
    const teacherDisplay = entry.teacher.trim();
    const teacher = normalizeTeacherName(teacherDisplay);
    const day = entry.day.trim();
    const time = entry.time.trim();
    if (!teacher || !day || !time) return [];
    return [
      {
        teacher,
        teacherDisplay,
        day,
        time,
        duration: parseClassDurationMinutes(entry.duration),
        subject: entry.subject.trim(),
        period: entry.period.trim(),
      },
    ];
  });
}

function lessonPairTeacherConflict(
  left: ClassScheduleLessonSlot,
  right: ClassScheduleLessonSlot
): string | null {
  if (left.teacher !== right.teacher) return null;
  if (left.day !== right.day) return null;
  if (!classLessonRangesOverlap(left.time, left.duration, right.time, right.duration)) {
    return null;
  }
  return `لا يمكن إسناد هذه الحصة — المعلم ${left.teacherDisplay} لديه حصة أخرى في «${left.day}» بنفس الوقت`;
}

export function findTeacherScheduleConflict(
  lessonsA: ClassScheduleLessonSlot[],
  lessonsB: ClassScheduleLessonSlot[]
): string | null {
  if (lessonsA === lessonsB) {
    for (let index = 0; index < lessonsA.length; index += 1) {
      for (let otherIndex = index + 1; otherIndex < lessonsA.length; otherIndex += 1) {
        const conflict = lessonPairTeacherConflict(lessonsA[index], lessonsA[otherIndex]);
        if (conflict) return conflict;
      }
    }
    return null;
  }

  for (const left of lessonsA) {
    for (const right of lessonsB) {
      const conflict = lessonPairTeacherConflict(left, right);
      if (conflict) return conflict;
    }
  }
  return null;
}

export function validateTeacherAcrossClassSchedules(
  entries: ClassScheduleEntry[],
  otherSchedules: Schedule[]
): string | null {
  const lessons = collectClassScheduleLessons(entries);
  const sameScheduleError = findTeacherScheduleConflict(lessons, lessons);
  if (sameScheduleError) return sameScheduleError;

  for (const schedule of otherSchedules) {
    const otherLessons = collectClassScheduleLessons(schedule.entries as ClassScheduleEntry[]);
    const conflict = findTeacherScheduleConflict(lessons, otherLessons);
    if (conflict) {
      return `${conflict} (جدول «${schedule.name}»)`;
    }
  }
  return null;
}

/** يحدد الخلايا التي فيها تعارض معلم فور إدخال المادة أو الوقت */
export function getCellTeacherConflicts(
  grid: ClassScheduleGridState,
  otherSchedules: Schedule[]
): Map<string, string> {
  const conflicts = new Map<string, string>();
  const serialized = serializeClassScheduleGrid(grid);

  for (let lessonIndex = 0; lessonIndex < grid.lessonsPerDay; lessonIndex += 1) {
    const column = grid.columns[lessonIndex];
    if (!column?.time?.trim()) continue;

    for (const day of grid.rowDays) {
      const key = classScheduleCellKey(day, lessonIndex);
      const cell = grid.cells[key] ?? emptyClassScheduleGridCell();
      if (!cell.subject.trim()) continue;

      const entry: ClassScheduleEntry = {
        day,
        period: column.period,
        time: column.time,
        duration: column.duration,
        subject: cell.subject,
        teacher: cell.teacher,
        room: cell.room,
        notes: "",
      };
      const lessons = collectClassScheduleLessons([entry]);
      if (lessons.length === 0) continue;

      for (const otherEntry of serialized) {
        if (otherEntry.day === entry.day && otherEntry.period === entry.period) continue;
        const otherLessons = collectClassScheduleLessons([otherEntry]);
        const internalConflict = findTeacherScheduleConflict(lessons, otherLessons);
        if (internalConflict) {
          conflicts.set(key, internalConflict);
          break;
        }
      }
      if (conflicts.has(key)) continue;

      for (const schedule of otherSchedules) {
        const otherLessons = collectClassScheduleLessons(schedule.entries as ClassScheduleEntry[]);
        const externalConflict = findTeacherScheduleConflict(lessons, otherLessons);
        if (externalConflict) {
          conflicts.set(key, `${externalConflict} (جدول «${schedule.name}»)`);
          break;
        }
      }
    }
  }

  return conflicts;
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

export function getTeacherLessonConflict(
  dayEntries: ClassScheduleEntry[],
  lessonIndex: number,
  patch: Partial<ClassScheduleEntry> = {}
): string | null {
  const current = { ...dayEntries[lessonIndex], ...patch };
  const teacher = normalizeTeacherName(current.teacher);
  const time = normalizeScheduleToken(current.time);
  const duration = parseClassDurationMinutes(current.duration);
  if (!teacher || !time) return null;

  for (let i = 0; i < dayEntries.length; i += 1) {
    if (i === lessonIndex) continue;
    const other = dayEntries[i];
    if (normalizeTeacherName(other.teacher) !== teacher) continue;
    if (!other.time) continue;
    const otherDuration = parseClassDurationMinutes(other.duration);
    if (!classLessonRangesOverlap(time, duration, other.time, otherDuration)) continue;
    return `المعلم ${current.teacher.trim()} لديه أكثر من حصة في «${current.day}» في نفس الوقت`;
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

export type ScheduleGridCell = {
  subject: string;
  teacher: string;
  classLabel?: string;
};

export type StudentScheduleGridRow = {
  day: string;
  cells: ScheduleGridCell[];
};

export type StudentScheduleGridData = {
  lessonColumns: StudentScheduleLessonColumn[];
  rows: StudentScheduleGridRow[];
};

function emptyScheduleGridCell(): ScheduleGridCell {
  return { subject: "—", teacher: "" };
}

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
    cells: lessonColumns.map((column) => {
      const match = normalized.find(
        (entry) => entry.day === day && (entry.period.trim() || entry.time.trim()) === column.key
      );
      if (!match?.subject?.trim()) {
        return emptyScheduleGridCell();
      }
      return {
        subject: match.subject.trim(),
        teacher: match.teacher?.trim() || "",
      };
    }),
  }));

  return { lessonColumns, rows };
}

function lessonColumnKey(period: string, time: string): string {
  return period.trim() || time.trim();
}

export function buildTeacherScheduleGrid(rows: TeacherScheduleRow[]): StudentScheduleGridData {
  const normalized = sortTeacherScheduleRows(rows);
  if (normalized.length === 0) {
    return { lessonColumns: [], rows: [] };
  }

  const lessonMeta = new Map<
    string,
    { period: string; time: string; duration: string; order: number }
  >();

  for (const row of normalized) {
    const key = lessonColumnKey(row.period, row.time);
    if (!key) continue;
    if (!lessonMeta.has(key)) {
      lessonMeta.set(key, {
        period: row.period.trim() || key,
        time: row.time,
        duration: row.duration,
        order: CLASS_PERIOD_SUGGESTIONS.indexOf(row.period),
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

  const days = [...new Set(normalized.map((row) => row.day).filter(Boolean))].sort(
    (a, b) => WEEK_DAYS.indexOf(a) - WEEK_DAYS.indexOf(b)
  );

  const gridRows = days.map((day) => ({
    day,
    cells: lessonColumns.map((column) => {
      const match = normalized.find(
        (row) => row.day === day && lessonColumnKey(row.period, row.time) === column.key
      );
      if (!match?.subject?.trim()) {
        return emptyScheduleGridCell();
      }
      return {
        subject: match.subject.trim(),
        teacher: "",
        classLabel: match.classLabel?.trim() || "",
      };
    }),
  }));

  return { lessonColumns, rows: gridRows };
}

export type TeacherScheduleRow = {
  id: string;
  scheduleId: string;
  scheduleName: string;
  day: string;
  period: string;
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
    period: String(raw.period ?? ""),
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
      const teacherConflict = getTeacherLessonConflict(dayEntries, i);
      if (teacherConflict) {
        return `${day}: ${teacherConflict}`;
      }
    }
  }
  return null;
}

/** شعب لها جدول حصص مسبقاً → اسم الجدول */
export function getClassIdsWithClassSchedule(
  schedules: Schedule[],
  excludeScheduleId?: string
): Map<string, string> {
  const occupied = new Map<string, string>();
  for (const schedule of schedules) {
    if (schedule.scheduleType !== "class") continue;
    if (excludeScheduleId && schedule.id === excludeScheduleId) continue;
    for (const classId of schedule.classIds) {
      occupied.set(classId, schedule.name);
    }
  }
  return occupied;
}

export function validateClassScheduleClassTargets(
  classIds: string[],
  schedules: Schedule[],
  excludeScheduleId?: string
): string | null {
  const occupied = getClassIdsWithClassSchedule(schedules, excludeScheduleId);
  for (const classId of classIds) {
    const scheduleName = occupied.get(classId);
    if (scheduleName) {
      return `لا يمكن إنشاء أكثر من جدول حصص لنفس الشعبة. يوجد جدول مسبقاً: «${scheduleName}»`;
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
