"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import {
  buildSelectOptions,
  subjectsForClasses,
  teachersForClassesAndSubject,
} from "@/lib/scheduleClassOptions";
import { formatScheduleTime12, getClassLessonEndTime } from "@/lib/scheduleTime";
import type { ClassScheduleEntry } from "@/types/schedules";
import {
  CLASS_DURATION_OPTIONS,
  CLASS_PERIOD_SUGGESTIONS,
  emptyClassEntry,
  getClassLessonConflict,
  parseClassDurationMinutes,
  sortClassScheduleEntries,
  WEEK_DAYS,
} from "@/types/schedules";
import type { Subject, TeacherProfile } from "@/types/teacher";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

type ClassScheduleEntryEditorProps = {
  entries: ClassScheduleEntry[];
  onChange: (entries: ClassScheduleEntry[]) => void;
  classIds: string[];
  subjects: Subject[];
  teachers: TeacherProfile[];
};

function entryKey(entry: ClassScheduleEntry, index: number) {
  return `${entry.day}-${index}-${entry.period}-${entry.time}`;
}

export function ClassScheduleEntryEditor({
  entries,
  onChange,
  classIds,
  subjects,
  teachers,
}: ClassScheduleEntryEditorProps) {
  const [openDays, setOpenDays] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(WEEK_DAYS.map((day, index) => [day, index === 0]))
  );
  const [lessonErrors, setLessonErrors] = useState<
    Record<string, { period?: string; time?: string; duration?: string }>
  >({});

  const availableSubjects = useMemo(
    () => subjectsForClasses(subjects, classIds),
    [subjects, classIds]
  );

  const entriesByDay = useMemo(() => {
    const grouped: Record<string, ClassScheduleEntry[]> = Object.fromEntries(
      WEEK_DAYS.map((day) => [day, [] as ClassScheduleEntry[]])
    );
    for (const entry of entries) {
      if (grouped[entry.day]) {
        grouped[entry.day].push(entry);
      } else if (entry.day) {
        grouped[entry.day] = [entry];
      }
    }
    for (const day of WEEK_DAYS) {
      grouped[day] = sortClassScheduleEntries(grouped[day]);
    }
    return grouped;
  }, [entries]);

  function setDayEntries(day: string, dayEntries: ClassScheduleEntry[]) {
    const otherDays = entries.filter((entry) => entry.day !== day);
    onChange(sortClassScheduleEntries([...otherDays, ...dayEntries]));
  }

  function addLesson(day: string) {
    if (classIds.length === 0) return;
    setOpenDays((prev) => ({ ...prev, [day]: true }));
    onChange(sortClassScheduleEntries([...entries, emptyClassEntry(day)]));
  }

  function lessonErrorKey(day: string, lessonIndex: number) {
    return `${day}-${lessonIndex}`;
  }

  function clearLessonError(
    day: string,
    lessonIndex: number,
    field?: "period" | "time" | "duration"
  ) {
    const key = lessonErrorKey(day, lessonIndex);
    setLessonErrors((prev) => {
      const current = prev[key];
      if (!current) return prev;
      if (!field) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      const nextEntry = { ...current };
      delete nextEntry[field];
      if (field === "time" || field === "duration") {
        delete nextEntry.time;
        delete nextEntry.duration;
      }
      if (!nextEntry.period && !nextEntry.time && !nextEntry.duration) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: nextEntry };
    });
  }

  function tryUpdateLesson(
    day: string,
    lessonIndex: number,
    patch: Partial<ClassScheduleEntry>,
    field: "period" | "time" | "duration" | "other"
  ) {
    const dayEntries = entriesByDay[day];
    const conflict = getClassLessonConflict(dayEntries, lessonIndex, patch);
    const key = lessonErrorKey(day, lessonIndex);

    if (conflict && field !== "other") {
      if (field === "period") {
        setLessonErrors((prev) => ({
          ...prev,
          [key]: { ...prev[key], period: conflict },
        }));
      } else {
        setLessonErrors((prev) => ({
          ...prev,
          [key]: { ...prev[key], time: conflict, duration: conflict },
        }));
      }
      return;
    }

    clearLessonError(day, lessonIndex, field === "other" ? undefined : field);
    updateLesson(day, lessonIndex, patch);
  }

  function updateLesson(day: string, lessonIndex: number, patch: Partial<ClassScheduleEntry>) {
    const dayEntries = [...entriesByDay[day]];
    dayEntries[lessonIndex] = { ...dayEntries[lessonIndex], ...patch, day };
    setDayEntries(day, dayEntries);
  }

  function handleSubjectChange(day: string, lessonIndex: number, subject: string) {
    const entry = entriesByDay[day][lessonIndex];
    const validTeachers = teachersForClassesAndSubject(teachers, subjects, classIds, subject);
    const teacher = validTeachers.some((item) => item.name === entry.teacher) ? entry.teacher : "";
    updateLesson(day, lessonIndex, { subject, teacher });
  }

  function removeLesson(day: string, lessonIndex: number) {
    clearLessonError(day, lessonIndex);
    setDayEntries(
      day,
      entriesByDay[day].filter((_, index) => index !== lessonIndex)
    );
  }

  function toggleDay(day: string) {
    setOpenDays((prev) => ({ ...prev, [day]: !prev[day] }));
  }

  const totalLessons = entries.length;
  const classesSelected = classIds.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-p-black">حصص الأسبوع</p>
        <p className="text-xs text-p-black/50">
          {totalLessons > 0 ? `${totalLessons} حصة` : "ابدأ بإضافة حصص لكل يوم"}
        </p>
      </div>

      {!classesSelected ? (
        <p className="rounded-xl border border-dashed border-amber-200 bg-amber-50/80 px-4 py-4 text-center text-sm text-amber-900">
          اختر الفصول والشعب أولاً لعرض المواد والمعلمين المرتبطين بها.
        </p>
      ) : availableSubjects.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-4 text-center text-sm text-neutral-500">
          لا توجد مواد مرتبطة بالفصول المختارة. اربط المواد بالفصول من صفحة المواد أولاً.
        </p>
      ) : null}

      <div className="space-y-2">
        {WEEK_DAYS.map((day) => {
          const dayEntries = entriesByDay[day];
          const isOpen = openDays[day] ?? false;
          const lessonCount = dayEntries.length;

          return (
            <section
              key={day}
              className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
            >
              <header className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50/80 px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => toggleDay(day)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-start"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-p-black">{day}</span>
                    <span className="mt-0.5 block text-[11px] text-p-black/50">
                      {lessonCount > 0 ? `${lessonCount} حصة` : "لا توجد حصص بعد"}
                    </span>
                  </span>
                </button>
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 gap-1.5 px-3 py-1.5 text-xs"
                  onClick={() => addLesson(day)}
                  disabled={!classesSelected || availableSubjects.length === 0}
                >
                  <Plus className="h-3.5 w-3.5" />
                  إضافة حصة
                </Button>
              </header>

              {isOpen ? (
                <div className="space-y-3 p-3">
                  {lessonCount === 0 ? (
                    <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-5 text-center text-sm text-neutral-500">
                      لم تُضف حصص ليوم {day} بعد. اضغط «إضافة حصة» لبدء التعبئة.
                    </p>
                  ) : (
                    dayEntries.map((entry, lessonIndex) => {
                      const teacherOptions = entry.subject
                        ? teachersForClassesAndSubject(teachers, subjects, classIds, entry.subject)
                        : [];
                      const errorKey = lessonErrorKey(day, lessonIndex);
                      const rowErrors = lessonErrors[errorKey];
                      const usedPeriods = new Set(
                        dayEntries
                          .filter((_, index) => index !== lessonIndex)
                          .map((item) => item.period.trim())
                          .filter(Boolean)
                      );
                      const periodSuggestions = CLASS_PERIOD_SUGGESTIONS.filter(
                        (option) => !usedPeriods.has(option)
                      );
                      const durationMinutes = parseClassDurationMinutes(entry.duration);
                      const lessonEndTime = entry.time
                        ? getClassLessonEndTime(entry.time, durationMinutes)
                        : null;

                      return (
                        <div
                          key={entryKey(entry, lessonIndex)}
                          className="rounded-xl border border-neutral-100 bg-neutral-50/80 p-3"
                        >
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-p-black/55">حصة {lessonIndex + 1}</p>
                            <button
                              type="button"
                              onClick={() => removeLesson(day, lessonIndex)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-p-red hover:underline"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              حذف
                            </button>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <Input
                              label="رقم الحصة"
                              list={`period-suggestions-${day}-${lessonIndex}`}
                              placeholder="مثال: الحصة الأولى"
                              value={entry.period}
                              onChange={(e) =>
                                tryUpdateLesson(day, lessonIndex, { period: e.target.value }, "period")
                              }
                              error={rowErrors?.period}
                              required
                            />
                            <datalist id={`period-suggestions-${day}-${lessonIndex}`}>
                              {periodSuggestions.map((option) => (
                                <option key={option} value={option} />
                              ))}
                            </datalist>
                            <Input
                              label="موعد الحصة"
                              type="time"
                              value={entry.time}
                              onChange={(e) =>
                                tryUpdateLesson(day, lessonIndex, { time: e.target.value }, "time")
                              }
                              error={rowErrors?.time}
                              required
                            />
                            <Select
                              id={`duration-${day}-${lessonIndex}`}
                              label="مدة الحصة"
                              value={entry.duration || "60"}
                              onChange={(e) =>
                                tryUpdateLesson(day, lessonIndex, { duration: e.target.value }, "duration")
                              }
                              error={rowErrors?.duration}
                              options={CLASS_DURATION_OPTIONS.map((option) => ({
                                value: option.value,
                                label: option.label,
                              }))}
                              required
                            />
                            {lessonEndTime ? (
                              <p className="text-xs text-p-black/55 sm:col-span-2">
                                من {formatScheduleTime12(entry.time)} إلى {formatScheduleTime12(lessonEndTime)}
                              </p>
                            ) : null}
                            <Select
                              id={`subject-${day}-${lessonIndex}`}
                              label="المادة"
                              value={entry.subject}
                              onChange={(e) => handleSubjectChange(day, lessonIndex, e.target.value)}
                              options={buildSelectOptions(
                                availableSubjects.map((subject) => ({
                                  value: subject.name,
                                  label: subject.name,
                                })),
                                entry.subject,
                                "اختر المادة"
                              )}
                            />
                            <Select
                              id={`teacher-${day}-${lessonIndex}`}
                              label="المعلم"
                              value={entry.teacher}
                              onChange={(e) => updateLesson(day, lessonIndex, { teacher: e.target.value })}
                              disabled={!entry.subject || teacherOptions.length === 0}
                              options={buildSelectOptions(
                                teacherOptions.map((teacher) => ({
                                  value: teacher.name,
                                  label: teacher.name,
                                })),
                                entry.teacher,
                                !entry.subject
                                  ? "اختر المادة أولاً"
                                  : teacherOptions.length === 0
                                    ? "لا يوجد معلم لهذه المادة"
                                    : "اختر المعلم"
                              )}
                            />
                            <Input
                              label="القاعة"
                              value={entry.room}
                              onChange={(e) => updateLesson(day, lessonIndex, { room: e.target.value })}
                            />
                            <Input
                              label="ملاحظات"
                              className="sm:col-span-2"
                              value={entry.notes}
                              onChange={(e) =>
                                tryUpdateLesson(day, lessonIndex, { notes: e.target.value }, "other")
                              }
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      {totalLessons === 0 ? (
        <p
          className={cn(
            "rounded-xl border border-dashed border-neutral-200 px-4 py-5 text-center text-sm text-neutral-500"
          )}
        >
          اختر يوماً من الأسبوع (يبدأ من السبت) ثم أضف الحصص مع رقم الحصة وموعدها.
        </p>
      ) : null}
    </div>
  );
}
