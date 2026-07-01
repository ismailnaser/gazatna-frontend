"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Input } from "@/components/atoms/Input";
import {
  buildSelectOptions,
  resolveTeacherForClassesAndSubject,
  subjectsForClasses,
} from "@/lib/scheduleClassOptions";
import { formatClassLessonTimeRange, formatScheduleTime12, getClassLessonEndTime } from "@/lib/scheduleTime";
import type { ClassScheduleEntry, Schedule } from "@/types/schedules";
import {
  CLASS_DURATION_OPTIONS,
  classScheduleCellKey,
  createGridWithScheduleTimings,
  emptyClassScheduleGridCell,
  formatClassDurationLabel,
  parseClassScheduleGrid,
  parseClassDurationMinutes,
  reconcileClassScheduleColumns,
  resizeClassScheduleGrid,
  serializeClassScheduleGrid,
  getClassLessonMinStartTime,
  SCHOOL_DAYS_PER_WEEK_MAX,
  SCHOOL_WEEK_DAYS,
  validateTeacherAcrossClassSchedules,
  getCellTeacherConflicts,
  type ClassScheduleGridState,
} from "@/types/schedules";
import type { Subject, TeacherProfile } from "@/types/teacher";
import { cn } from "@/lib/utils";
import { Clock3 } from "lucide-react";

type ClassScheduleTimingMode = "custom" | "reuse";

type ClassScheduleEntryEditorProps = {
  entries: ClassScheduleEntry[];
  onChange: (entries: ClassScheduleEntry[]) => void;
  classIds: string[];
  subjects: Subject[];
  teachers: TeacherProfile[];
  timingMode?: ClassScheduleTimingMode;
  timingTemplateScheduleId?: string;
  timingTemplateEntries?: ClassScheduleEntry[];
  onRequestCustomTimings?: () => void;
  otherPublishedClassSchedules?: Schedule[];
  /** كل جداول الحصص الأخرى للتحقق الفوري من تعارض المعلم */
  otherClassSchedulesForConflict?: Schedule[];
};

export type ClassScheduleEntryEditorHandle = {
  getGridState: () => ClassScheduleGridState;
  getEntries: () => ClassScheduleEntry[];
};

function pushGridChange(
  state: ClassScheduleGridState,
  onChange: (entries: ClassScheduleEntry[]) => void
) {
  onChange(serializeClassScheduleGrid(state));
}

function clampCount(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function isNumericDraft(value: string) {
  return value === "" || /^\d+$/.test(value);
}

function commitNumericDraft(
  draft: string | null,
  current: number,
  min: number,
  max: number,
  onCommit: (value: number) => void
) {
  if (draft === null) return;
  if (draft === "") {
    onCommit(current);
    return;
  }
  const parsed = Number(draft);
  if (!Number.isFinite(parsed)) {
    onCommit(current);
    return;
  }
  onCommit(clampCount(parsed, min, max));
}

function CompactSelect({
  value,
  onChange,
  options,
  disabled,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "w-full rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs text-p-black",
        "focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/15",
        "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-p-black/45",
        className
      )}
    >
      {options.map((option) => (
        <option key={`${option.value}-${option.label}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export const ClassScheduleEntryEditor = forwardRef<
  ClassScheduleEntryEditorHandle,
  ClassScheduleEntryEditorProps
>(function ClassScheduleEntryEditor(
  {
    entries,
    onChange,
    classIds,
    subjects,
    teachers,
    timingMode = "custom",
    timingTemplateScheduleId = "",
    timingTemplateEntries = [],
    onRequestCustomTimings,
    otherPublishedClassSchedules = [],
    otherClassSchedulesForConflict = [],
  },
  ref
) {
  const conflictSchedules =
    otherClassSchedulesForConflict.length > 0
      ? otherClassSchedulesForConflict
      : otherPublishedClassSchedules;
  const reuseTimings =
    timingMode === "reuse" && timingTemplateScheduleId !== "" && timingTemplateEntries.length > 0;
  const [grid, setGrid] = useState<ClassScheduleGridState>(() => {
    const parsed = parseClassScheduleGrid(entries);
    return {
      ...parsed,
      columns: reconcileClassScheduleColumns(parsed.columns, 0),
    };
  });
  const [lessonsDraft, setLessonsDraft] = useState<string | null>(null);
  const [daysDraft, setDaysDraft] = useState<string | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useImperativeHandle(
    ref,
    () => ({
      getGridState: () => grid,
      getEntries: () => serializeClassScheduleGrid(grid),
    }),
    [grid]
  );

  const availableSubjects = useMemo(
    () => subjectsForClasses(subjects, classIds),
    [subjects, classIds]
  );

  useEffect(() => {
    if (classIds.length === 0) return;
    const subjectNames = new Set(availableSubjects.map((subject) => subject.name));
    setGrid((prev) => {
      let changed = false;
      const cells = { ...prev.cells };
      for (const [key, cell] of Object.entries(cells)) {
        let nextCell = cell;
        if (cell.subject && !subjectNames.has(cell.subject)) {
          nextCell = { ...nextCell, subject: "", teacher: "" };
          changed = true;
        } else if (cell.subject) {
          const resolvedTeacher = resolveTeacherForClassesAndSubject(
            teachers,
            subjects,
            classIds,
            cell.subject
          );
          if (resolvedTeacher !== cell.teacher) {
            nextCell = { ...nextCell, teacher: resolvedTeacher };
            changed = true;
          }
        }
        if (nextCell !== cell) {
          cells[key] = nextCell;
        }
      }
      if (!changed) return prev;
      const next = { ...prev, cells };
      pushGridChange(next, onChange);
      return next;
    });
  }, [classIds, availableSubjects, subjects, teachers]);

  useEffect(() => {
    if (!reuseTimings) return;
    setGrid((prev) => {
      const next = createGridWithScheduleTimings(timingTemplateEntries, prev);
      pushGridChange(next, onChangeRef.current);
      return next;
    });
  }, [reuseTimings, timingTemplateScheduleId, timingTemplateEntries]);

  const activeDays = grid.rowDays;

  const classesSelected = classIds.length > 0;

  function updateGrid(next: ClassScheduleGridState) {
    setGrid(next);
    pushGridChange(next, onChange);
  }

  function setLessonsPerDay(value: number) {
    setGrid((prev) => {
      const resized = resizeClassScheduleGrid(prev, clampCount(value, 1, 8), prev.daysPerWeek);
      return {
        ...resized,
        columns: reconcileClassScheduleColumns(resized.columns, 0),
      };
    });
  }

  function setDaysPerWeek(value: number) {
    setGrid((prev) => {
      const resized = resizeClassScheduleGrid(
        prev,
        prev.lessonsPerDay,
        clampCount(value, 1, SCHOOL_DAYS_PER_WEEK_MAX)
      );
      return {
        ...resized,
        columns: reconcileClassScheduleColumns(resized.columns, 0),
      };
    });
  }

  function changeRowDay(rowIndex: number, newDay: string) {
    if (!SCHOOL_WEEK_DAYS.includes(newDay)) return;
    const oldDay = grid.rowDays[rowIndex];
    if (!oldDay || oldDay === newDay) return;

    const otherIndex = grid.rowDays.findIndex((day, index) => index !== rowIndex && day === newDay);
    const rowDays = [...grid.rowDays];
    const cells = { ...grid.cells };

    if (otherIndex >= 0) {
      rowDays[rowIndex] = newDay;
      rowDays[otherIndex] = oldDay;
      for (let lessonIndex = 0; lessonIndex < grid.lessonsPerDay; lessonIndex += 1) {
        const oldKey = classScheduleCellKey(oldDay, lessonIndex);
        const newKey = classScheduleCellKey(newDay, lessonIndex);
        const oldCell = cells[oldKey] ?? emptyClassScheduleGridCell();
        const newCell = cells[newKey] ?? emptyClassScheduleGridCell();
        cells[oldKey] = newCell;
        cells[newKey] = oldCell;
      }
    } else {
      rowDays[rowIndex] = newDay;
      for (let lessonIndex = 0; lessonIndex < grid.lessonsPerDay; lessonIndex += 1) {
        const oldKey = classScheduleCellKey(oldDay, lessonIndex);
        const newKey = classScheduleCellKey(newDay, lessonIndex);
        if (oldKey === newKey) continue;
        cells[newKey] = cells[oldKey] ?? emptyClassScheduleGridCell();
        delete cells[oldKey];
      }
    }

    updateGrid({ ...grid, rowDays, cells });
  }

  function updateColumn(lessonIndex: number, patch: Partial<ClassScheduleGridState["columns"][number]>) {
    const columns = grid.columns.map((column, index) =>
      index === lessonIndex ? { ...column, ...patch } : column
    );
    const reconciled = reconcileClassScheduleColumns(columns, lessonIndex);
    updateGrid({ ...grid, columns: reconciled });
  }

  function updateCell(
    day: string,
    lessonIndex: number,
    patch: Partial<ClassScheduleGridState["cells"][string]>
  ) {
    const key = classScheduleCellKey(day, lessonIndex);
    const cells = {
      ...grid.cells,
      [key]: { ...(grid.cells[key] ?? emptyClassScheduleGridCell()), ...patch },
    };
    updateGrid({ ...grid, cells });
  }

  function handleSubjectChange(day: string, lessonIndex: number, subject: string) {
    const teacher = subject
      ? resolveTeacherForClassesAndSubject(teachers, subjects, classIds, subject)
      : "";
    updateCell(day, lessonIndex, { subject, teacher });
  }

  const filledCells = useMemo(() => {
    return Object.values(grid.cells).filter((cell) => cell.subject.trim()).length;
  }, [grid.cells]);

  const liveTeacherConflict = useMemo(() => {
    const serialized = serializeClassScheduleGrid(grid);
    if (serialized.length === 0) return "";
    return validateTeacherAcrossClassSchedules(serialized, conflictSchedules) ?? "";
  }, [grid, conflictSchedules]);

  const cellTeacherConflicts = useMemo(
    () => getCellTeacherConflicts(grid, conflictSchedules),
    [grid, conflictSchedules]
  );

  return (
    <div className="min-w-0 space-y-4">
      {liveTeacherConflict ? <Alert variant="error">{liveTeacherConflict}</Alert> : null}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-blue/15 bg-brand-blue/[0.04] px-3 py-2.5">
        <div>
          <p className="text-sm font-semibold text-p-black">جدول الحصص الأسبوعي</p>
          <p className="mt-0.5 text-xs text-p-black/50">
            {grid.daysPerWeek} أيام × {grid.lessonsPerDay} حصص يومياً
          </p>
        </div>
        <p className="text-xs font-medium text-brand-blue">
          {filledCells > 0 ? `${filledCells} حصة مُدخلة` : "ابدأ بتحديد الأوقات ثم المواد"}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {!reuseTimings ? (
          <>
            <Input
              label="عدد الحصص اليومية"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={lessonsDraft ?? String(grid.lessonsPerDay)}
              onChange={(event) => {
                const raw = event.target.value;
                if (isNumericDraft(raw)) setLessonsDraft(raw);
              }}
              onBlur={() => {
                commitNumericDraft(lessonsDraft, grid.lessonsPerDay, 1, 8, setLessonsPerDay);
                setLessonsDraft(null);
              }}
              required
            />
            <Input
              label="عدد أيام الأسبوع"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={daysDraft ?? String(grid.daysPerWeek)}
              onChange={(event) => {
                const raw = event.target.value;
                if (isNumericDraft(raw)) setDaysDraft(raw);
              }}
              onBlur={() => {
                commitNumericDraft(
                  daysDraft,
                  grid.daysPerWeek,
                  1,
                  SCHOOL_DAYS_PER_WEEK_MAX,
                  setDaysPerWeek
                );
                setDaysDraft(null);
              }}
              required
            />
          </>
        ) : (
          <div className="sm:col-span-2 rounded-xl border border-brand-blue/15 bg-brand-blue/[0.04] px-3 py-2.5 text-xs text-p-black/70">
            <p>
              يتم استخدام مواعيد الحصص من الجدول المرجعي:{" "}
              <span className="font-semibold text-p-black">
                {grid.lessonsPerDay} حصص يومياً × {grid.daysPerWeek} أيام
              </span>
            </p>
            {onRequestCustomTimings ? (
              <button
                type="button"
                onClick={onRequestCustomTimings}
                className="mt-1.5 font-semibold text-brand-blue hover:underline"
              >
                تخصيص مواعيد مختلفة لهذا الجدول
              </button>
            ) : null}
          </div>
        )}
      </div>

      {!classesSelected ? (
        <p className="rounded-xl border border-dashed border-amber-200 bg-amber-50/80 px-4 py-4 text-center text-sm text-amber-900">
          اختر الفصول والشعب أولاً لعرض المواد والمعلمين المرتبطين بها.
        </p>
      ) : availableSubjects.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-4 text-center text-sm text-neutral-500">
          لا توجد مواد مرتبطة بالفصول المختارة. اربط المواد بالفصول من صفحة المواد أولاً.
        </p>
      ) : (
        <div className="min-w-0 space-y-3">
          <div>
            <p className="mb-2 text-xs font-semibold text-p-black/70">
              {reuseTimings ? "مواعيد الحصص (من الجدول المرجعي)" : "أوقات الحصص (تنطبق على كل الأيام)"}
            </p>
            <div className="min-w-0 overflow-x-auto overscroll-x-contain rounded-xl border border-neutral-200 bg-neutral-50/60 p-2">
              <div className="flex min-w-max gap-2">
                {Array.from({ length: grid.lessonsPerDay }, (_, lessonIndex) => {
                  const column = grid.columns[lessonIndex];
                  const endTime = column.time
                    ? getClassLessonEndTime(column.time, parseClassDurationMinutes(column.duration))
                    : null;
                  const minStartTime = getClassLessonMinStartTime(grid.columns, lessonIndex);

                  if (reuseTimings) {
                    return (
                      <div
                        key={lessonIndex}
                        className="w-40 shrink-0 rounded-xl border border-neutral-200 bg-white p-2.5 shadow-sm"
                      >
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue text-[11px] font-bold text-white">
                            {lessonIndex + 1}
                          </span>
                          <p className="text-xs font-bold text-p-black">
                            {column.period || `الحصة ${lessonIndex + 1}`}
                          </p>
                        </div>
                        <p className="flex items-center gap-1 text-[11px] font-medium text-p-black/70">
                          <Clock3 className="h-3 w-3 shrink-0" />
                          {column.time
                            ? formatClassLessonTimeRange(
                                column.time,
                                parseClassDurationMinutes(column.duration)
                              )
                            : "—"}
                        </p>
                        <p className="mt-1 text-[10px] text-p-black/45">
                          {formatClassDurationLabel(column.duration)}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={lessonIndex}
                      className="w-44 shrink-0 rounded-xl border border-neutral-200 bg-white p-2.5 shadow-sm"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue text-[11px] font-bold text-white">
                          {lessonIndex + 1}
                        </span>
                        <p className="text-xs font-bold text-p-black">
                          {column.period || `الحصة ${lessonIndex + 1}`}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Input
                          type="time"
                          value={column.time}
                          min={minStartTime ?? undefined}
                          onChange={(event) =>
                            updateColumn(lessonIndex, { time: event.target.value })
                          }
                          className="px-2 py-1.5 text-xs"
                        />
                        {minStartTime ? (
                          <p className="text-[10px] leading-snug text-p-black/45">
                            لا يمكن أن يبدأ قبل {formatScheduleTime12(minStartTime)}
                          </p>
                        ) : null}
                        <CompactSelect
                          value={column.duration || "60"}
                          onChange={(value) => updateColumn(lessonIndex, { duration: value })}
                          options={CLASS_DURATION_OPTIONS.map((option) => ({
                            value: option.value,
                            label: option.label,
                          }))}
                        />
                        {endTime ? (
                          <p className="flex items-center gap-1 text-[11px] text-p-black/50">
                            <Clock3 className="h-3 w-3" />
                            {formatScheduleTime12(column.time)} – {formatScheduleTime12(endTime)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="min-w-0 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="max-h-[min(58vh,560px)] overflow-auto overscroll-contain">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead className="sticky top-0 z-20 bg-white shadow-[0_1px_0_#e5e5e5]">
                  <tr>
                    <th className="sticky start-0 z-30 min-w-[7.5rem] w-[7.5rem] border-b border-neutral-200 bg-neutral-50 px-2 py-2.5 text-start text-xs font-bold text-p-black shadow-[inset_-1px_0_0_#e5e5e5]">
                      اليوم
                    </th>
                    {Array.from({ length: grid.lessonsPerDay }, (_, lessonIndex) => (
                      <th
                        key={lessonIndex}
                        className="min-w-[148px] border-b border-neutral-200 bg-neutral-50 px-2 py-2.5 text-center text-xs font-bold text-p-black"
                      >
                        {grid.columns[lessonIndex]?.period || `حصة ${lessonIndex + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeDays.map((day, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={cn(rowIndex % 2 === 1 ? "bg-neutral-50/70" : "bg-white")}
                    >
                      <td
                        className={cn(
                          "sticky start-0 z-10 min-w-[7.5rem] w-[7.5rem] border-b border-neutral-200 px-2 py-2 shadow-[inset_-1px_0_0_#e5e5e5]",
                          rowIndex % 2 === 1 ? "bg-neutral-50" : "bg-white"
                        )}
                      >
                        <CompactSelect
                          value={day}
                          onChange={(value) => changeRowDay(rowIndex, value)}
                          options={SCHOOL_WEEK_DAYS.map((weekDay) => ({
                            value: weekDay,
                            label: weekDay,
                          }))}
                          className="min-w-[6.5rem] whitespace-nowrap font-bold"
                        />
                      </td>
                      {Array.from({ length: grid.lessonsPerDay }, (_, lessonIndex) => {
                        const cellKey = classScheduleCellKey(day, lessonIndex);
                        const cell = grid.cells[cellKey] ?? emptyClassScheduleGridCell();
                        const cellConflict = cellTeacherConflicts.get(cellKey);
                        const isFilled = Boolean(cell.subject.trim());
                        const teacherLabel = cell.subject
                          ? cell.teacher || "لا يوجد معلم مرتبط"
                          : "—";

                        return (
                          <td
                            key={lessonIndex}
                            className="border-b border-neutral-200 px-2 py-2 align-top"
                          >
                            <div
                              className={cn(
                                "space-y-1.5 rounded-lg border p-2 transition-colors",
                                cellConflict
                                  ? "border-p-red/40 bg-p-red/5"
                                  : isFilled
                                    ? "border-brand-blue/25 bg-brand-blue/[0.04]"
                                    : "border-neutral-100 bg-neutral-50/40"
                              )}
                            >
                              <CompactSelect
                                value={cell.subject}
                                onChange={(value) => handleSubjectChange(day, lessonIndex, value)}
                                options={buildSelectOptions(
                                  availableSubjects.map((subject) => ({
                                    value: subject.name,
                                    label: subject.name,
                                  })),
                                  cell.subject,
                                  "المادة"
                                )}
                                className={cellConflict ? "border-p-red/30" : undefined}
                              />
                              {cellConflict ? (
                                <p className="text-[10px] leading-snug font-medium text-p-red">
                                  {cellConflict}
                                </p>
                              ) : null}
                              <p
                                className={cn(
                                  "truncate rounded-lg border px-2 py-1.5 text-xs",
                                  cell.teacher
                                    ? "border-neutral-100 bg-neutral-50 text-p-black/75"
                                    : cell.subject
                                      ? "border-amber-200 bg-amber-50 text-amber-900"
                                      : "border-neutral-100 bg-neutral-50 text-p-black/40"
                                )}
                                title={teacherLabel}
                              >
                                {cell.subject ? (
                                  <>
                                    <span className="text-[10px] text-p-black/45">المعلم: </span>
                                    {teacherLabel}
                                  </>
                                ) : (
                                  teacherLabel
                                )}
                              </p>
                              <input
                                value={cell.room}
                                onChange={(event) =>
                                  updateCell(day, lessonIndex, { room: event.target.value })
                                }
                                placeholder="القاعة"
                                className="w-full rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs text-p-black placeholder:text-neutral-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/15"
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-[11px] text-p-black/45">
            مرّر الجدول أفقياً أو عمودياً داخل الإطار. عمود «اليوم» ورأس الجدول يبقيان ثابتين أثناء
            التمرير.
          </p>
        </div>
      )}

      <p className="text-xs text-p-black/45">
        اختر يوم كل صف من السبت إلى الخميس. الأعمدة تمثل الحصص اليومية.
      </p>
    </div>
  );
});
