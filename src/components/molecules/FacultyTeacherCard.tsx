import Link from "next/link";
import { ArrowLeft, Briefcase, GraduationCap } from "lucide-react";
import { ExpandableText } from "@/components/molecules/ExpandableText";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { TeacherProfile } from "@/types/teacher";

export function FacultyTeacherCard({ teacher }: { teacher: TeacherProfile }) {
  const initial = teacher.name.replace(/^(د\.|أ\.|م\.)\s*/, "").charAt(0);
  const imageSrc = resolveMediaUrl(teacher.imageUrl);
  const bioPreview = teacher.bio?.trim();

  return (
    <Link href={`/faculty/${teacher.id}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-[0_16px_40px_-24px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/20 hover:shadow-[0_24px_50px_-20px_rgba(66,76,243,0.28)]">
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-gradient-to-br text-5xl font-bold text-white",
              !imageSrc && teacher.imageGradient
            )}
          >
            {!imageSrc ? initial : null}
          </div>
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={teacher.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/75 via-neutral-950/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <GraduationCap className="h-3.5 w-3.5" />
              {teacher.subject}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <h3 className="text-lg font-bold leading-snug text-neutral-950 transition-colors group-hover:text-brand-blue sm:text-xl">
            {teacher.name}
          </h3>

          {teacher.experience?.trim() ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-neutral-500">
              <Briefcase className="h-4 w-4 shrink-0 text-brand-orange" />
              <span>{teacher.experience}</span>
            </p>
          ) : null}

          {bioPreview ? (
            <ExpandableText
              maxLines={2}
              className="mt-3 text-sm text-neutral-600"
              stopPropagation
              buttonClassName="text-brand-blue"
            >
              {bioPreview}
            </ExpandableText>
          ) : null}

          <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-brand-blue">
            عرض السيرة الذاتية
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </span>
        </div>
      </article>
    </Link>
  );
}

export function FacultyTeacherCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm">
      <div className="aspect-[4/5] animate-pulse bg-neutral-200" />
      <div className="space-y-3 p-5 sm:p-6">
        <div className="h-5 w-3/4 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-100" />
        <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
      </div>
    </div>
  );
}
