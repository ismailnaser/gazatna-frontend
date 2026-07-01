"use client";

import { useRef } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import {
  ClassScheduleEntryEditor,
  type ClassScheduleEntryEditorHandle,
} from "@/components/schedules/ClassScheduleEntryEditor";
import type {
  ClassScheduleEntry,
  ExamScheduleEntry,
  Schedule,
  ScheduleEntry,
  ScheduleType,
} from "@/types/schedules";
import type { Subject, TeacherProfile } from "@/types/teacher";
import { Plus, Trash2 } from "lucide-react";

type ScheduleEntryEditorProps = {
  scheduleType: ScheduleType;
  entries: ScheduleEntry[];
  onChange: (entries: ScheduleEntry[]) => void;
  classIds?: string[];
  subjects?: Subject[];
  teachers?: TeacherProfile[];
  editorKey?: string;
  classGridRef?: React.RefObject<ClassScheduleEntryEditorHandle | null>;
  classTimingMode?: "custom" | "reuse";
  classTimingTemplateScheduleId?: string;
  classTimingTemplateEntries?: ClassScheduleEntry[];
  onRequestCustomClassTimings?: () => void;
  otherPublishedClassSchedules?: Schedule[];
  otherClassSchedulesForConflict?: Schedule[];
};

export function ScheduleEntryEditor({
  scheduleType,
  entries,
  onChange,
  classIds = [],
  subjects = [],
  teachers = [],
  editorKey,
  classGridRef,
  classTimingMode,
  classTimingTemplateScheduleId,
  classTimingTemplateEntries,
  onRequestCustomClassTimings,
  otherPublishedClassSchedules = [],
  otherClassSchedulesForConflict = [],
}: ScheduleEntryEditorProps) {
  const isExam = scheduleType === "exam";

  function updateEntry(index: number, patch: Partial<ExamScheduleEntry & ClassScheduleEntry>) {
    onChange(entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  }

  function removeEntry(index: number) {
    onChange(entries.filter((_, i) => i !== index));
  }

  function addEntry() {
    onChange([...entries, { subject: "", date: "", time: "", duration: "", notes: "" }]);
  }

  if (!isExam) {
    return (
      <ClassScheduleEntryEditor
        key={editorKey}
        ref={classGridRef}
        entries={entries as ClassScheduleEntry[]}
        onChange={onChange as (entries: ClassScheduleEntry[]) => void}
        classIds={classIds}
        subjects={subjects}
        teachers={teachers}
        timingMode={classTimingMode}
        timingTemplateScheduleId={classTimingTemplateScheduleId}
        timingTemplateEntries={classTimingTemplateEntries}
        onRequestCustomTimings={onRequestCustomClassTimings}
        otherPublishedClassSchedules={otherPublishedClassSchedules}
        otherClassSchedulesForConflict={otherClassSchedulesForConflict}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-p-black">صفوف الجدول</p>
        <Button type="button" variant="outline" className="gap-1.5 px-3 py-1.5 text-xs" onClick={addEntry}>
          <Plus className="h-3.5 w-3.5" />
          إضافة صف
        </Button>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center text-sm text-neutral-500">
          أضف صفوف الجدول (المادة، التاريخ، الوقت...)
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={index}
              className="rounded-xl border border-neutral-100 bg-neutral-50/80 p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-p-black/55">صف {index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeEntry(index)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-p-red hover:underline"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  حذف
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="المادة"
                  value={(entry as ExamScheduleEntry).subject}
                  onChange={(e) => updateEntry(index, { subject: e.target.value })}
                  required
                />
                <Input
                  label="التاريخ"
                  type="date"
                  value={(entry as ExamScheduleEntry).date}
                  onChange={(e) => updateEntry(index, { date: e.target.value })}
                  required
                />
                <Input
                  label="الوقت"
                  type="time"
                  value={(entry as ExamScheduleEntry).time}
                  onChange={(e) => updateEntry(index, { time: e.target.value })}
                />
                <Input
                  label="المدة (دقيقة)"
                  type="number"
                  min={1}
                  value={(entry as ExamScheduleEntry).duration}
                  onChange={(e) => updateEntry(index, { duration: e.target.value })}
                />
                <Input
                  label="ملاحظات"
                  className="sm:col-span-2"
                  value={(entry as ExamScheduleEntry).notes}
                  onChange={(e) => updateEntry(index, { notes: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
