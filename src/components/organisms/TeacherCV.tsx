"use client";

import Link from "next/link";
import { ExpandableText } from "@/components/molecules/ExpandableText";
import { Card } from "@/components/atoms/Card";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { SchoolClass, TeacherProfile } from "@/types/teacher";
import { ArrowRight, BookOpen, Briefcase, GraduationCap } from "lucide-react";

type TeacherCVProps = {
  teacher: TeacherProfile;
  classes: SchoolClass[];
  backHref?: string;
  backLabel?: string;
  getClassHref?: (cls: SchoolClass) => string;
};

export function TeacherCV({
  teacher,
  classes,
  backHref = "/faculty",
  backLabel = "العودة للكادر التعليمي",
  getClassHref,
}: TeacherCVProps) {
  const initial = teacher.name.replace(/^(د\.|أ\.|م\.)\s*/, "").charAt(0);
  const imageSrc = resolveMediaUrl(teacher.imageUrl);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={backHref}
        prefetch={false}
        className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-yellow px-3 py-1.5 text-sm font-extrabold text-p-black shadow-[-2px_2px_0_0_rgba(234,102,34,0.35)]"
      >
        <ArrowRight className="h-4 w-4" />
        {backLabel}
      </Link>

      <Card className="overflow-hidden p-0">
        <div
          className={cn(
            "relative mx-auto flex aspect-square w-full max-w-xs items-center justify-center overflow-hidden bg-gradient-to-br text-6xl font-bold text-white sm:max-w-sm",
            !imageSrc && teacher.imageGradient
          )}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={teacher.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </div>

        <div className="p-6 sm:p-8">
          <h1 className="font-display text-2xl font-extrabold text-p-black sm:text-3xl">
            {teacher.name}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-1.5 w-16 rounded-full bg-brand-orange" />
            <span className="h-1.5 w-6 rounded-full bg-brand-yellow" />
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-yellow text-p-black">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a]/50">التخصص</p>
                <p className="font-medium text-[#1a1a1a]">{teacher.subject}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
                <Briefcase className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a]/50">الخبرة</p>
                <p className="font-medium text-[#1a1a1a]">{teacher.experience}</p>
              </div>
            </div>
          </div>

          <ExpandableText maxLines={5} className="mt-6 text-[#1a1a1a]/70">
            {teacher.bio}
          </ExpandableText>

          <div className="mt-8 border-t border-neutral-100 pt-6">
            <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-extrabold text-brand-blue">
              <BookOpen className="h-5 w-5" />
              الفصول التي يدرّسها
            </h2>

            {classes.length === 0 ? (
              <p className="text-sm text-[#1a1a1a]/50">
                لا توجد فصول مسندة حالياً.
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {classes.map((cls) => {
                  const href = getClassHref?.(cls);
                  const content = (
                    <>
                      <p className="font-semibold text-[#1a1a1a]">{cls.name}</p>
                      <p className="mt-1 text-xs text-[#1a1a1a]/50">
                        {cls.studentCount} طالب
                      </p>
                    </>
                  );

                  return (
                    <li key={cls.id}>
                      {href ? (
                        <Link
                          href={href}
                          prefetch={false}
                          className="block rounded-[1.2rem] border-[3px] border-black/10 bg-brand-yellow/25 px-4 py-3 transition hover:-translate-y-0.5"
                        >
                          {content}
                        </Link>
                      ) : (
                        <div className="rounded-[1.2rem] border-[3px] border-black/10 bg-brand-yellow/25 px-4 py-3">
                          {content}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
