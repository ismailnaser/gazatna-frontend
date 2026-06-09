"use client";

import Link from "next/link";
import { Card } from "@/components/atoms/Card";
import { cn } from "@/lib/utils";
import type { SchoolClass, TeacherProfile } from "@/types/teacher";
import { ArrowRight, BookOpen, Briefcase, GraduationCap } from "lucide-react";

type TeacherCVProps = {
  teacher: TeacherProfile;
  classes: SchoolClass[];
  backHref?: string;
  backLabel?: string;
};

export function TeacherCV({
  teacher,
  classes,
  backHref = "/faculty",
  backLabel = "العودة للكادر التعليمي",
}: TeacherCVProps) {
  const initial = teacher.name.replace(/^(د\.|أ\.|م\.)\s*/, "").charAt(0);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#064e3b] hover:underline"
      >
        <ArrowRight className="h-4 w-4" />
        {backLabel}
      </Link>

      <Card className="overflow-hidden p-0">
        <div
          className={cn(
            "mx-auto flex aspect-square w-full max-w-xs items-center justify-center overflow-hidden bg-gradient-to-br text-6xl font-bold text-white sm:max-w-sm",
            teacher.imageGradient
          )}
        >
          {initial}
        </div>

        <div className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-[#1a1a1a] sm:text-3xl">
            {teacher.name}
          </h1>
          <div className="mt-2 h-1 w-16 rounded-full bg-[#881337]" />

          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#064e3b]/10">
                <GraduationCap className="h-5 w-5 text-[#064e3b]" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a]/50">التخصص</p>
                <p className="font-medium text-[#1a1a1a]">{teacher.subject}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#064e3b]/10">
                <Briefcase className="h-5 w-5 text-[#064e3b]" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a]/50">الخبرة</p>
                <p className="font-medium text-[#1a1a1a]">{teacher.experience}</p>
              </div>
            </div>
          </div>

          <p className="mt-6 leading-relaxed text-[#1a1a1a]/70">{teacher.bio}</p>

          <div className="mt-8 border-t border-neutral-100 pt-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#064e3b]">
              <BookOpen className="h-5 w-5" />
              الفصول التي يدرّسها
            </h2>

            {classes.length === 0 ? (
              <p className="text-sm text-[#1a1a1a]/50">
                لا توجد فصول مسندة حالياً.
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {classes.map((cls) => (
                  <li
                    key={cls.id}
                    className="rounded-xl border border-neutral-100 bg-[#064e3b]/5 px-4 py-3"
                  >
                    <p className="font-semibold text-[#1a1a1a]">{cls.name}</p>
                    <p className="mt-1 text-xs text-[#1a1a1a]/50">
                      {cls.studentCount} طالب
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
