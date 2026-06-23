"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { GradeSectionClassPicker } from "@/components/shared/GradeSectionClassPicker";
import { ScheduleEntryEditor } from "@/components/schedules/ScheduleEntryEditor";
import type { ClassScheduleEntryEditorHandle } from "@/components/schedules/ClassScheduleEntryEditor";
import { ScheduleTable } from "@/components/schedules/ScheduleTable";
import {
  subjectsForClasses,
  teachersForClasses,
  teachersForClassesAndSubject,
} from "@/lib/scheduleClassOptions";
import type { ClassScheduleEntry, Schedule, ScheduleEntry, ScheduleType } from "@/types/schedules";
import {
  sortClassScheduleEntries,
  validateClassScheduleGrid,
  parseClassScheduleGrid,
} from "@/types/schedules";
import type { Grade, SchoolClass, Subject, TeacherProfile } from "@/types/teacher";
import { Eye, Save, X } from "lucide-react";

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <header className="border-b border-neutral-100 bg-neutral-50/70 px-3 py-2.5 sm:px-4">
        <h3 className="text-sm font-bold text-p-black">{title}</h3>
        {description ? <p className="mt-0.5 text-xs text-p-black/50">{description}</p> : null}
      </header>
      <div className="space-y-3 p-3 sm:space-y-4 sm:p-4 min-w-0">{children}</div>
    </section>
  );
}

type AdminScheduleFormPanelProps = {
  mode: "create" | "edit";
  scheduleType: ScheduleType;
  editing?: Schedule | null;
  classes: SchoolClass[];
  grades?: Grade[];
  subjects?: Subject[];
  teachers?: TeacherProfile[];
  error: string;
  submitting: boolean;
  onSubmit: (payload: {
    name: string;
    scheduleType: ScheduleType;
    classIds: string[];
    entries: ScheduleEntry[];
    isPublished: boolean;
  }) => void;
  onClose: () => void;
};

export function AdminScheduleFormPanel({
  mode,
  scheduleType,
  editing,
  classes,
  grades,
  subjects = [],
  teachers = [],
  error,
  submitting,
  onSubmit,
  onClose,
}: AdminScheduleFormPanelProps) {
  const isCreate = mode === "create";
  const [name, setName] = useState(editing?.name ?? "");
  const [classIds, setClassIds] = useState<string[]>(editing?.classIds ?? []);
  const [entries, setEntries] = useState<ScheduleEntry[]>(
    editing?.entries?.length ? editing.entries : scheduleType === "exam" ? [{ subject: "", date: "", time: "", duration: "", notes: "" }] : []
  );
  const [isPublished, setIsPublished] = useState(editing?.isPublished ?? true);
  const [showPreview, setShowPreview] = useState(false);
  const classGridRef = useRef<ClassScheduleEntryEditorHandle>(null);

  const availableSubjects = useMemo(
    () => subjectsForClasses(subjects, classIds),
    [subjects, classIds]
  );

  useEffect(() => {
    if (scheduleType !== "class" || classIds.length === 0) return;
    const subjectNames = new Set(availableSubjects.map((subject) => subject.name));
    setEntries((prev) => {
      let changed = false;
      const next = (prev as ClassScheduleEntry[]).map((entry) => {
        let subject = entry.subject;
        let teacher = entry.teacher;
        if (subject && !subjectNames.has(subject)) {
          subject = "";
          teacher = "";
          changed = true;
        } else if (subject && teacher) {
          const validTeachers = teachersForClassesAndSubject(teachers, subjects, classIds, subject);
          if (!validTeachers.some((item) => item.name === teacher)) {
            teacher = "";
            changed = true;
          }
        } else if (teacher) {
          const validTeachers = teachersForClasses(teachers, classIds);
          if (!validTeachers.some((item) => item.name === teacher)) {
            teacher = "";
            changed = true;
          }
        }
        return subject === entry.subject && teacher === entry.teacher
          ? entry
          : { ...entry, subject, teacher };
      });
      return changed ? next : prev;
    });
  }, [scheduleType, classIds, availableSubjects, subjects, teachers]);

  const resolvedClassEntries = useMemo(() => {
    if (scheduleType !== "class") return entries;
    return classGridRef.current?.getEntries() ?? (entries as ClassScheduleEntry[]);
  }, [scheduleType, entries, showPreview]);

  const previewSchedule = useMemo<Schedule>(
    () => ({
      id: editing?.id ?? "preview",
      name: name.trim() || "جدول جديد",
      scheduleType,
      classIds,
      classLabels: classIds
        .map((id) => {
          const match = classes.find((cls) => cls.id === id);
          if (!match) return "";
          return match.section ? `${match.gradeLevel} - ${match.section}` : match.name;
        })
        .filter(Boolean),
      entries: scheduleType === "class" ? resolvedClassEntries : entries,
      isPublished,
      createdAt: editing?.createdAt ?? "",
      updatedAt: editing?.updatedAt ?? "",
    }),
    [name, scheduleType, classIds, classes, entries, resolvedClassEntries, isPublished, editing]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const classEntries =
      scheduleType === "class"
        ? classGridRef.current?.getEntries() ?? (entries as ClassScheduleEntry[])
        : entries;

    if (scheduleType === "class") {
      const gridState =
        classGridRef.current?.getGridState() ?? parseClassScheduleGrid(classEntries as ClassScheduleEntry[]);
      const validationError = validateClassScheduleGrid(gridState);
      if (validationError) {
        alert(validationError);
        return;
      }
    }
    const normalizedEntries =
      scheduleType === "class"
        ? sortClassScheduleEntries(classEntries as ClassScheduleEntry[])
        : entries;
    onSubmit({
      name: name.trim(),
      scheduleType,
      classIds,
      entries: normalizedEntries,
      isPublished,
    });
  }

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <header className="flex items-start justify-between gap-3 border-b border-neutral-100 bg-neutral-50/70 px-4 py-4 sm:px-5">
        <div>
          <p className="text-xs font-semibold text-brand-blue">
            {isCreate ? "إنشاء جدول" : "تعديل جدول"}
          </p>
          <h2 className="mt-0.5 text-base font-bold text-p-black sm:text-lg">
            {isCreate
              ? scheduleType === "exam"
                ? "جدول اختبارات جديد"
                : "جدول حصص جديد"
              : editing?.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="rounded-lg p-1.5 text-p-black/45 hover:bg-white hover:text-p-black"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="space-y-4 p-4 sm:p-5 min-w-0">
        {error ? <Alert variant="error">{error}</Alert> : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormSection title="البيانات الأساسية" description="اسم الجدول والفصول المستهدفة.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="اسم الجدول"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  scheduleType === "exam"
                    ? "مثال: جدول الاختبارات النصفية"
                    : "مثال: جدول الحصص الأسبوعي"
                }
                required
                className="sm:col-span-2"
              />
              <div className="sm:col-span-2">
                <GradeSectionClassPicker
                  classes={classes}
                  grades={grades}
                  mode="multiple"
                  value={classIds}
                  onChange={setClassIds}
                  label="الفصول والشعب المستهدفة"
                  required
                  emptyMessage="لا توجد فصول مسجّلة. أضف الفصول أولاً."
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-p-black sm:col-span-2">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 accent-brand-blue"
                />
                نشر الجدول للطلاب وأولياء الأمور
              </label>
            </div>
          </FormSection>

          <FormSection
            title="محتوى الجدول"
            description={
              scheduleType === "exam"
                ? "أضف مواد الاختبار مع التاريخ والوقت."
                : "عبّئ جدول الحصص: الصفوف أيام الأسبوع (من السبت) والأعمدة الحصص اليومية."
            }
          >
            <ScheduleEntryEditor
              scheduleType={scheduleType}
              entries={entries}
              onChange={setEntries}
              classIds={classIds}
              subjects={subjects}
              teachers={teachers}
              editorKey={editing?.id ?? "create"}
              classGridRef={classGridRef}
            />
          </FormSection>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-4">
            <Button
              type="button"
              variant="outline"
              className="gap-1.5"
              onClick={() => setShowPreview((prev) => !prev)}
            >
              <Eye className="h-4 w-4" />
              {showPreview ? "إخفاء المعاينة" : "معاينة الجدول"}
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting || classIds.length === 0}>
                <Save className="h-4 w-4" />
                {submitting ? "جاري الحفظ..." : isCreate ? "إنشاء الجدول" : "حفظ التعديلات"}
              </Button>
            </div>
          </div>
        </form>

        {showPreview ? (
          <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3 sm:p-4">
            <ScheduleTable schedule={previewSchedule} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
