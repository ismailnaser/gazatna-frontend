"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { ExpandableText } from "@/components/molecules/ExpandableText";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { SchoolClass, TeacherProfile } from "@/types/teacher";
import { Layers, Pencil } from "lucide-react";

const TABLE = "w-full min-w-[880px] border-collapse border border-neutral-200 text-sm";
const TH =
  "border-b border-e border-neutral-200 bg-neutral-50 px-3 py-3 text-start text-xs font-bold text-p-black/55 last:border-e-0 sm:px-4";
const TD =
  "border-b border-e border-neutral-200 px-3 py-3 align-top last:border-e-0 sm:px-4";

function teacherInitial(name: string) {
  return name.replace(/^(د\.|أ\.|م\.)\s*/u, "").trim().charAt(0) || "م";
}

function teacherSubjects(teacher: TeacherProfile) {
  if (teacher.subjects?.length) return teacher.subjects;
  if (teacher.subject?.trim()) {
    return teacher.subject.split("، ").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function teacherClasses(
  teacherId: string,
  assignments: Record<string, string[]>,
  classes: SchoolClass[]
) {
  const ids = assignments[teacherId] ?? [];
  return classes.filter((schoolClass) => ids.includes(schoolClass.id)).map((schoolClass) => schoolClass.name);
}

type AdminTeachersTableProps = {
  teachers: TeacherProfile[];
  assignments: Record<string, string[]>;
  classes: SchoolClass[];
  hasActiveFilters: boolean;
  onEdit: (id: string) => void;
};

export function AdminTeachersTable({
  teachers,
  assignments,
  classes,
  hasActiveFilters,
  onEdit,
}: AdminTeachersTableProps) {
  if (teachers.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-p-black/50">
        {hasActiveFilters ? "لا توجد نتائج مطابقة للبحث أو الفلاتر." : "لا يوجد معلمون بعد."}
      </p>
    );
  }

  return (
    <div className="-mx-3 overflow-x-auto sm:mx-0">
      <table className={TABLE}>
        <colgroup>
          <col className="w-[24%]" />
          <col className="w-[24%]" />
          <col className="w-[22%]" />
          <col className="w-[16%]" />
          <col className="w-[14%]" />
        </colgroup>
        <thead>
          <tr>
            <th className={TH}>المعلم</th>
            <th className={TH}>المواد</th>
            <th className={TH}>الفصول</th>
            <th className={TH}>الخبرة</th>
            <th className={TH}>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher, index) => {
            const subjects = teacherSubjects(teacher);
            const classNames = teacherClasses(teacher.id, assignments, classes);
            const imageSrc = resolveMediaUrl(teacher.imageUrl);

            return (
              <tr key={teacher.id} className={cn(index % 2 === 1 && "bg-neutral-50/50")}>
                <td className={TD}>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-bold text-white",
                        !imageSrc && `bg-gradient-to-br ${teacher.imageGradient}`
                      )}
                    >
                      {imageSrc ? (
                        <img src={imageSrc} alt="" className="h-full w-full object-cover" />
                      ) : (
                        teacherInitial(teacher.name)
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold leading-snug text-p-black">{teacher.name}</p>
                      {teacher.username ? (
                        <p className="mt-0.5 text-xs text-p-black/45" dir="ltr">
                          {teacher.username}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className={TD}>
                  {subjects.length === 0 ? (
                    <span className="text-xs text-p-black/40">بدون مواد</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {subjects.map((subject) => (
                        <Badge key={subject} variant="info">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  )}
                </td>
                <td className={TD}>
                  {classNames.length === 0 ? (
                    <span className="text-xs text-p-black/40">بدون فصول</span>
                  ) : (
                    <div className="space-y-1">
                      <p className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue">
                        <Layers className="h-3.5 w-3.5" />
                        {classNames.length} فصل
                      </p>
                      <ExpandableText maxLines={2} className="text-xs text-p-black/55">
                        {classNames.join("، ")}
                      </ExpandableText>
                    </div>
                  )}
                </td>
                <td className={TD}>
                  <ExpandableText maxLines={2} className="text-xs text-p-black/65">
                    {teacher.experience || "—"}
                  </ExpandableText>
                </td>
                <td className={TD}>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-full text-xs"
                    onClick={() => onEdit(teacher.id)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    تعديل
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
