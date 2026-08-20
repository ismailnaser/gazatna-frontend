"use client";

import { useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import {
  ExpandRowButton,
  TABLE_BASE,
  TABLE_TD,
  TABLE_TH,
  TABLE_WRAP,
  TablePagination,
  useClientPagination,
} from "@/components/shared/DataTable";
import { ExpandableText } from "@/components/molecules/ExpandableText";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { SchoolClass, TeacherProfile } from "@/types/teacher";
import { Layers, Pencil, Power } from "lucide-react";

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { page, totalPages, pageItems, pageSize, total, next, prev, setPage } =
    useClientPagination(teachers, 10);

  if (teachers.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-p-black/72">
        {hasActiveFilters ? "لا توجد نتائج مطابقة للبحث أو الفلاتر." : "لا يوجد أعضاء كادر بعد."}
      </p>
    );
  }

  return (
    <div className={TABLE_WRAP}>
      <div className="overflow-x-auto">
        <table className={TABLE_BASE}>
          <thead>
            <tr>
              <th className={TABLE_TH}>الاسم</th>
              <th className={cn(TABLE_TH, "w-40")}>التخصص</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((teacher, index) => {
              const open = expandedId === teacher.id;
              const subjects = teacherSubjects(teacher);
              const classNames = teacherClasses(teacher.id, assignments, classes);
              const imageSrc = resolveMediaUrl(teacher.imageUrl);
              const isActive = teacher.status !== "inactive";

              return (
                <tr key={teacher.id} className={cn(index % 2 === 1 && "bg-neutral-50/70")}>
                  <td className={TABLE_TD} colSpan={open ? 2 : 1}>
                    {!open ? (
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
                        <div className="min-w-0 flex-1">
                          <ExpandRowButton
                            open={false}
                            label={teacher.name}
                            onClick={() => setExpandedId(teacher.id)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-bold text-white",
                                !imageSrc && `bg-gradient-to-br ${teacher.imageGradient}`
                              )}
                            >
                              {imageSrc ? (
                                <img src={imageSrc} alt="" className="h-full w-full object-cover" />
                              ) : (
                                memberInitial(teacher.name)
                              )}
                            </span>
                            <div>
                              <p className="text-lg font-bold text-p-black">{teacher.name}</p>
                              {teacher.username ? (
                                <p className="text-sm text-p-black/72" dir="ltr">
                                  {teacher.username}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="px-3 py-1.5 text-xs"
                            onClick={() => setExpandedId(null)}
                          >
                            إغلاق
                          </Button>
                        </div>

                        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <dt className="text-xs font-semibold text-p-black/72">التخصص</dt>
                            <dd className="mt-1">
                              <Badge variant="info">{teacher.staffTypeName || "—"}</Badge>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold text-p-black/72">رقم الهوية</dt>
                            <dd className="mt-0.5 font-medium" dir="ltr">
                              {teacher.nationalId || "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold text-p-black/72">الجوال</dt>
                            <dd className="mt-0.5 font-medium" dir="ltr">
                              {teacher.mobile || "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold text-p-black/72">الحالة</dt>
                            <dd className="mt-1">
                              {teacher.isTeacher ? (
                                <Badge variant={isActive ? "success" : "default"}>
                                  {isActive ? "نشط" : "غير نشط"}
                                </Badge>
                              ) : (
                                <Badge variant="default">—</Badge>
                              )}
                            </dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="text-xs font-semibold text-p-black/72">المواد</dt>
                            <dd className="mt-1 flex flex-wrap gap-1.5">
                              {!teacher.isTeacher || subjects.length === 0 ? (
                                <span className="text-sm text-p-black/72">—</span>
                              ) : (
                                subjects.map((subject) => (
                                  <Badge key={subject} variant="info">
                                    {subject}
                                  </Badge>
                                ))
                              )}
                            </dd>
                          </div>
                          <div className="sm:col-span-2 lg:col-span-3">
                            <dt className="text-xs font-semibold text-p-black/72">الفصول</dt>
                            <dd className="mt-1">
                              {!teacher.isTeacher || classNames.length === 0 ? (
                                <span className="text-sm text-p-black/72">—</span>
                              ) : (
                                <div className="space-y-1">
                                  <p className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue">
                                    <Layers className="h-3.5 w-3.5" />
                                    {classNames.length} فصل
                                  </p>
                                  <ExpandableText maxLines={3} className="text-sm text-p-black/78">
                                    {classNames.join("، ")}
                                  </ExpandableText>
                                </div>
                              )}
                            </dd>
                          </div>
                        </dl>

                        <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-1.5 px-3 py-1.5 text-xs"
                            onClick={() => onEdit(teacher.id)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            تعديل
                          </Button>
                          {teacher.isTeacher ? (
                            <Button
                              type="button"
                              variant="ghost"
                              className="gap-1.5 px-3 py-1.5 text-xs"
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
                      </div>
                    )}
                  </td>
                  {!open ? (
                    <td className={TABLE_TD}>
                      <button
                        type="button"
                        className="text-start"
                        onClick={() => setExpandedId(teacher.id)}
                      >
                        <Badge variant="info">{teacher.staffTypeName || "—"}</Badge>
                      </button>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPrev={prev}
        onNext={next}
        onPage={setPage}
      />
    </div>
  );
}
