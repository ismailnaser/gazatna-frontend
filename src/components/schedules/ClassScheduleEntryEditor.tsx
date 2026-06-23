"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { Input } from "@/components/atoms/Input";
import {
  buildSelectOptions,
  subjectsForClasses,
  teachersForClassesAndSubject,
} from "@/lib/scheduleClassOptions";
import { formatScheduleTime12, getClassLessonEndTime } from "@/lib/scheduleTime";
import type { ClassScheduleEntry } from "@/types/schedules";
import {
  CLASS_DURATION_OPTIONS,
  classScheduleCellKey,
  emptyClassScheduleGridCell,
  parseClassScheduleGrid,
  parseClassDurationMinutes,
  reconcileClassScheduleColumns,
  resizeClassScheduleGrid,
  serializeClassScheduleGrid,
  getClassLessonMinStartTime,
  type ClassScheduleGridState,
  WEEK_DAYS,
} from "@/types/schedules";
import type { Subject, TeacherProfile } from "@/types/teacher";
import { cn } from "@/lib/utils";
import { Clock3 } from "lucide-react";

type ClassScheduleEntryEditorProps = {
  entries: ClassScheduleEntry[];
  onChange: (entries: ClassScheduleEntry[]) => void;
  classIds: string[];
  subjects: Subject[];
  teachers: TeacherProfile[];
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
  { entries, onChange, classIds, subjects, teachers },
  ref
) {
  const [grid, setGrid] = useState<ClassScheduleGridState>(() => {
    const parsed = parseClassScheduleGrid(entries);
    return {
      ...parsed,
      columns: reconcileClassScheduleColumns(parsed.columns, 0),
    };
  });
  const [lessonsDraft, setLessonsDraft] = useState<string | null>(null);
  const [daysDraft, setDaysDraft] = useState<string | null>(null);

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
        } else if (cell.subject && cell.teacher) {
          const validTeachers = teachersForClassesAndSubject(
            teachers,
            subjects,
            classIds,
            cell.subject
          );
          if (!validTeachers.some((teacher) => teacher.name === cell.teacher)) {
            nextCell = { ...nextCell, teacher: "" };
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

  const activeDays = useMemo(
    () => WEEK_DAYS.slice(0, grid.daysPerWeek),
    [grid.daysPerWeek]
  );

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
      const resized = resizeClassScheduleGrid(prev, prev.lessonsPerDay, clampCount(value, 1, 7));
      return {
        ...resized,
        columns: reconcileClassScheduleColumns(resized.columns, 0),
      };
    });
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
    const key = classScheduleCellKey(day, lessonIndex);
    const current = grid.cells[key] ?? emptyClassScheduleGridCell();
    const validTeachers = subject
      ? teachersForClassesAndSubject(teachers, subjects, classIds, subject)
      : [];
    const teacher = validTeachers.some((item) => item.name === current.teacher)
      ? current.teacher
      : "";
    updateCell(day, lessonIndex, { subject, teacher });
  }

  const filledCells = useMemo(() => {
    return Object.values(grid.cells).filter((cell) => cell.subject.trim()).length;
  }, [grid.cells]);

  return (
    <div className="min-w-0 space-y-4">
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
            commitNumericDraft(daysDraft, grid.daysPerWeek, 1, 7, setDaysPerWeek);
            setDaysDraft(null);
          }}
          required
        />
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
            <p className="mb-2 text-xs font-semibold text-p-black/70">أوقات الحصص (تنطبق على كل الأيام)</p>
            <div className="min-w-0 overflow-x-auto overscroll-x-contain rounded-xl border border-neutral-200 bg-neutral-50/60 p-2">
              <div className="flex min-w-max gap-2">
                {Array.from({ length: grid.lessonsPerDay }, (_, lessonIndex) => {
                  const column = grid.columns[lessonIndex];
                  const endTime = column.time
                    ? getClassLessonEndTime(column.time, parseClassDurationMinutes(column.duration))
                    : null;
                  const minStartTime = getClassLessonMinStartTime(grid.columns, lessonIndex);

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
                    <th className="sticky start-0 z-30 min-w-[76px] border-b border-neutral-200 bg-neutral-50 px-3 py-2.5 text-start text-xs font-bold text-p-black shadow-[inset_-1px_0_0_#e5e5e5]">
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
                      key={day}
                      className={cn(rowIndex % 2 === 1 ? "bg-neutral-50/70" : "bg-white")}
                    >
                      <td
                        className={cn(
                          "sticky start-0 z-10 border-b border-neutral-200 px-3 py-2 font-bold text-p-black shadow-[inset_-1px_0_0_#e5e5e5]",
                          rowIndex % 2 === 1 ? "bg-neutral-50" : "bg-white"
                        )}
                      >
                        <span className="text-xs sm:text-sm">{day}</span>
                      </td>
                      {Array.from({ length: grid.lessonsPerDay }, (_, lessonIndex) => {
                        const cell =
                          grid.cells[classScheduleCellKey(day, lessonIndex)] ??
                          emptyClassScheduleGridCell();
                        const teacherOptions = cell.subject
                          ? teachersForClassesAndSubject(
                              teachers,
                              subjects,
                              classIds,
                              cell.subject
                            )
                          : [];
                        const isFilled = Boolean(cell.subject.trim());

                        return (
                          <td
                            key={lessonIndex}
                            className="border-b border-neutral-200 px-2 py-2 align-top"
                          >
                            <div
                              className={cn(
                                "space-y-1.5 rounded-lg border p-2 transition-colors",
                                isFilled
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
                              />
                              <CompactSelect
                                value={cell.teacher}
                                onChange={(value) =>
                                  updateCell(day, lessonIndex, { teacher: value })
                                }
                                disabled={!cell.subject || teacherOptions.length === 0}
                                options={buildSelectOptions(
                                  teacherOptions.map((teacher) => ({
                                    value: teacher.name,
                                    label: teacher.name,
                                  })),
                                  cell.teacher,
                                  !cell.subject
                                    ? "المعلم"
                                    : teacherOptions.length === 0
                                      ? "لا يوجد معلم"
                                      : "المعلم"
                                )}
                              />
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
        الصفوف تمثل أيام الأسبوع من السبت، والأعمدة تمثل الحصص اليومية.
      </p>
    </div>
  );
});
