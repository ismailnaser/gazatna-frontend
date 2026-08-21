"use client";

import Link from "next/link";
import { Badge } from "@/components/atoms/Badge";
import { subjectGradient, subjectInitial, teacherCountLabel } from "@/lib/adminSubjects";
import { cn } from "@/lib/utils";
import type { Subject } from "@/types/teacher";
import { BookOpen, ChevronLeft, GraduationCap, Users } from "lucide-react";

type AdminSubjectsGridProps = {
  subjects: Subject[];
  hasActiveFilters: boolean;
};

export function AdminSubjectsGrid({ subjects, hasActiveFilters }: AdminSubjectsGridProps) {
  if (subjects.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-p-black/50">
        {hasActiveFilters ? "لا توجد نتائج مطابقة للبحث." : "لا توجد مواد بعد."}
      </p>
    );
  }

  return (
    <div className="card-grid">
      {subjects.map((subject) => (
        <Link
          key={subject.id}
          href={`/admin/subjects/${subject.id}`}
          prefetch={false}
          className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:border-brand-blue/25 hover:shadow-md"
        >
          <div
            className={cn(
              "relative flex items-center gap-3 bg-gradient-to-br px-4 py-4 text-white",
              subjectGradient(subject.name)
            )}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold">
              {subjectInitial(subject.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold">{subject.name}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-white/85">
                <BookOpen className="h-3.5 w-3.5" />
                فتح صفحة المادة
              </p>
            </div>
            <ChevronLeft className="h-5 w-5 opacity-80" />
          </div>
          <div className="flex items-center justify-between gap-3 p-4">
            <span className="inline-flex items-center gap-1.5 text-sm text-p-black/65">
              <Users className="h-4 w-4 text-brand-blue" />
              {teacherCountLabel(subject.teacherCount)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-p-black/65">
              <GraduationCap className="h-4 w-4" />
              <Badge variant={(subject.classIds?.length ?? 0) > 0 ? "success" : "default"}>
                {subject.classIds?.length ?? 0} شعب
              </Badge>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
