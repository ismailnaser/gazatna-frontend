"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { ExpandableText } from "@/components/molecules/ExpandableText";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { SchoolClass, TeacherProfile } from "@/types/teacher";
import { Layers, Pencil, Power } from "lucide-react";

const TABLE = "w-full min-w-[980px] border-collapse border border-neutral-200 text-sm";
const TH =
  "border-b border-e border-neutral-200 bg-neutral-50 px-3 py-3 text-start text-xs font-bold text-p-black/55 last:border-e-0 sm:px-4";
const TD =
  "border-b border-e border-neutral-200 px-3 py-3 align-top last:border-e-0 sm:px-4";

function memberInitial(name: string) {
  return name.replace(/^(د\.|أ\.|م\.)\s*/u, "").trim().charAt(0) || "ك";
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
  togglingId?: string | null;
  onEdit: (id: string) => void;
  onToggleStatus: (teacher: TeacherProfile) => void;
};

export function AdminTeachersTable({
  teachers,
  assignments,
  classes,
  hasActiveFilters,
  togglingId,
  onEdit,
  onToggleStatus,
}: AdminTeachersTableProps) {
  if (teachers.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-p-black/50">
        {hasActiveFilters ? "لا توجد نتائج مطابقة للبحث أو الفلاتر." : "لا يوجد أعضاء كادر بعد."}
      </p>
    );
  }

  return (
    <div className="-mx-3 overflow-x-auto sm:mx-0">
      <table className={TABLE}>
        <colgroup>
          <col className="w-[20%]" />
          <col className="w-[12%]" />
          <col className="w-[14%]" />
          <col className="w-[18%]" />
          <col className="w-[16%]" />
          <col className="w-[8%]" />
          <col className="w-[12%]" />
        </colgroup>
        <thead>
          <tr>
            <th className={TH}>الاسم</th>
            <th className={TH}>التخصص</th>
            <th className={TH}>الهوية / الجوال</th>
            <th className={TH}>المواد</th>
            <th className={TH}>الفصول</th>
            <th className={TH}>الحالة</th>
            <th className={TH}>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher, index) => {
            const subjects = teacherSubjects(teacher);
            const classNames = teacherClasses(teacher.id, assignments, classes);
            const imageSrc = resolveMediaUrl(teacher.imageUrl);
            const isActive = teacher.status !== "inactive";

            return (
              <tr
                key={teacher.id}
                className={cn(index % 2 === 1 && "bg-neutral-50/50", !isActive && "opacity-70")}
              >
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
                        memberInitial(teacher.name)
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold leading-snug text-p-black">{teacher.name}</p>
                      {teacher.nameEn ? (
                        <p className="mt-0.5 text-xs text-p-black/45" dir="ltr">
                          {teacher.nameEn}
                        </p>
                      ) : null}
                      {teacher.username ? (
                        <p className="mt-0.5 text-xs text-p-black/45" dir="ltr">
                          {teacher.username}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className={TD}>
                  <Badge variant="info">{teacher.staffTypeName || "—"}</Badge>
                </td>
                <td className={TD}>
                  <p className="font-mono text-xs text-p-black/75" dir="ltr">
                    {teacher.nationalId || "—"}
                  </p>
                  <p className="mt-1 text-xs text-p-black/55" dir="ltr">
                    {teacher.mobile || "—"}
                  </p>
                </td>
                <td className={TD}>
                  {!teacher.isTeacher ? (
                    <span className="text-xs text-p-black/40">—</span>
                  ) : subjects.length === 0 ? (
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
                  {!teacher.isTeacher ? (
                    <span className="text-xs text-p-black/40">—</span>
                  ) : classNames.length === 0 ? (
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
                  {teacher.isTeacher ? (
                    <Badge variant={isActive ? "success" : "default"}>
                      {isActive ? "نشط" : "غير نشط"}
                    </Badge>
                  ) : (
                    <Badge variant="default">—</Badge>
                  )}
                </td>
                <td className={TD}>
                  <div className="flex flex-col gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 w-full text-xs"
                      onClick={() => onEdit(teacher.id)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      تعديل
                    </Button>
                    {teacher.isTeacher ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 w-full text-xs"
                        onClick={() => onToggleStatus(teacher)}
                        disabled={togglingId === teacher.id}
                      >
                        <Power className="h-3.5 w-3.5" />
                        {togglingId === teacher.id
                          ? "جاري..."
                          : isActive
                            ? "تعطيل"
                            : "تفعيل"}
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
