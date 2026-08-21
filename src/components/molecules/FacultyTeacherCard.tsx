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
      <article className="flex h-full flex-col overflow-hidden rounded-[1.7rem_0.7rem_1.7rem_0.95rem] border-[3px] border-black/10 bg-white shadow-[-6px_7px_0_0_rgba(66,76,243,0.14)] transition duration-300 hover:-translate-y-1 hover:rotate-[-0.6deg] hover:shadow-[-9px_10px_0_0_rgba(249,180,40,0.4)]">
        <div className="relative aspect-[4/5] overflow-hidden bg-brand-yellow/20">
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-linear-to-br font-display text-5xl font-extrabold text-white",
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
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/5 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <span className="font-display inline-flex items-center gap-1.5 rounded-full bg-brand-yellow px-3 py-1 text-[11px] font-extrabold text-p-black shadow-[-2px_2px_0_0_rgba(234,102,34,0.4)]">
              <GraduationCap className="h-3.5 w-3.5" />
              {teacher.subject}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <h3 className="font-display text-lg font-extrabold leading-snug text-p-black transition-colors group-hover:text-brand-blue sm:text-xl">
            {teacher.name}
          </h3>

          {teacher.experience?.trim() ? (
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-p-black/60">
              <Briefcase className="h-4 w-4 shrink-0 text-brand-orange" />
              <span>{teacher.experience}</span>
            </p>
          ) : null}

          {bioPreview ? (
            <ExpandableText
              maxLines={2}
              className="mt-3 text-sm font-semibold text-p-black/65"
              stopPropagation
              buttonClassName="text-brand-blue"
            >
              {bioPreview}
            </ExpandableText>
          ) : null}

          <span className="font-display mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-extrabold text-brand-blue">
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
    <div className="overflow-hidden rounded-[1.7rem_0.7rem_1.7rem_0.95rem] border-[3px] border-black/10 bg-[#fff8ec]">
      <div className="aspect-[4/5] animate-pulse bg-brand-yellow/30" />
      <div className="space-y-3 p-5 sm:p-6">
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-brand-yellow/40" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-brand-blue/10" />
        <div className="h-4 w-full animate-pulse rounded-full bg-neutral-100" />
      </div>
    </div>
  );
}
