"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { subjectGradient, subjectInitial, teacherCountLabel } from "@/lib/adminSubjects";
import { cn } from "@/lib/utils";
import type { Subject } from "@/types/teacher";
import { BookOpen, ChevronLeft, Pencil, Trash2, UserPlus, Users } from "lucide-react";

type AdminSubjectsGridProps = {
  subjects: Subject[];
  hasActiveFilters: boolean;
  onView: (subject: Subject) => void;
  onAssign: (subject: Subject) => void;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
};

export function AdminSubjectsGrid({
  subjects,
  hasActiveFilters,
  onView,
  onAssign,
  onEdit,
  onDelete,
}: AdminSubjectsGridProps) {
  if (subjects.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-p-black/50">
        {hasActiveFilters ? "لا توجد نتائج مطابقة للبحث." : "لا توجد مواد بعد. أضف مادة من النموذج أعلاه."}
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {subjects.map((subject) => (
        <article
          key={subject.id}
          className="group overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all hover:border-brand-blue/20 hover:shadow-md"
        >
          <button
            type="button"
            onClick={() => onView(subject)}
            className={cn(
              "relative flex w-full items-center gap-3 bg-gradient-to-br px-4 py-4 text-start text-white transition-opacity hover:opacity-95",
              subjectGradient(subject.name)
            )}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold backdrop-blur-sm">
              {subjectInitial(subject.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold">{subject.name}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-white/85">
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                اضغط لعرض المعلمين
              </p>
            </div>
            <ChevronLeft className="h-5 w-5 shrink-0 opacity-80" />
          </button>

          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm text-p-black/60">
                <Users className="h-4 w-4 text-brand-blue" />
                {teacherCountLabel(subject.teacherCount)}
              </span>
              <Badge variant={subject.teacherCount > 0 ? "info" : "default"}>
                {subject.teacherCount}
              </Badge>
            </div>

            <div className="space-y-2 border-t border-neutral-50 pt-3">
              <Button
                type="button"
                className="h-9 w-full text-xs"
                onClick={() => onAssign(subject)}
              >
                <UserPlus className="h-3.5 w-3.5" />
                إسناد معلم للمادة
              </Button>
              <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 text-xs"
                onClick={() => onEdit(subject)}
              >
                <Pencil className="h-3.5 w-3.5" />
                تعديل الاسم
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 text-xs text-p-red hover:text-p-red"
                onClick={() => onDelete(subject)}
                disabled={subject.teacherCount > 0}
                title={
                  subject.teacherCount > 0
                    ? "لا يمكن حذف مادة مسندة لمعلمين"
                    : `حذف ${subject.name}`
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
                حذف
              </Button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
