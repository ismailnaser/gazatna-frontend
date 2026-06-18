"use client";

import Link from "next/link";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { SubjectMetaGrid } from "@/components/parent/ParentSubjectItemCard";
import { homeworkGradePath } from "@/lib/teacherHomeworkGrading";
import { ACADEMIC_DESCRIPTION_CLASS } from "@/lib/expandableText";
import type { Homework } from "@/types";
import { ClipboardList, GraduationCap, Pencil, PenLine, Trash2, Users } from "lucide-react";

function statusBadge(windowStatus?: string, status?: Homework["status"]) {
  if (windowStatus === "active") return <Badge variant="success">نشط</Badge>;
  if (windowStatus === "scheduled") return <Badge variant="warning">لم يبدأ</Badge>;
  if (windowStatus === "ended") return <Badge variant="danger">منتهٍ</Badge>;
  if (status === "closed") return <Badge variant="default">مغلق</Badge>;
  return <Badge variant="default">مغلق</Badge>;
}

function MetaChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-p-black/45" />
      <div className="min-w-0">
        <p className="text-[11px] text-p-black/45">{label}</p>
        <p className="text-sm font-semibold text-p-black">{value}</p>
      </div>
    </div>
  );
}

export function TeacherClassHomeworkCard({
  homework,
  submissionCount,
  onDelete,
}: {
  homework: Homework;
  submissionCount: number;
  onDelete: () => void;
}) {
  const endAt = homework.endAt || homework.dueDate;

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <div className="h-1 bg-brand-orange" aria-hidden />

      <header className="flex flex-wrap items-center gap-2 border-b border-neutral-100 bg-neutral-50/60 px-3 py-2.5 sm:px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
          <PenLine className="h-4 w-4" />
        </span>
        <span className="text-xs font-bold text-p-black/55">واجب</span>
        {statusBadge(homework.windowStatus, homework.status)}
        {homework.subject && <Badge variant="default">{homework.subject}</Badge>}
      </header>

      <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
        <div>
          <h3 className="text-base font-bold leading-snug text-p-black sm:text-lg">{homework.title}</h3>
          {homework.description?.trim() && (
            <p className={ACADEMIC_DESCRIPTION_CLASS}>{homework.description}</p>
          )}
        </div>

        {(homework.startAt || endAt) && (
          <SubjectMetaGrid
            items={[
              ...(homework.startAt ? [{ label: "البداية", dateTime: homework.startAt }] : []),
              { label: "النهاية", dateTime: endAt },
            ]}
          />
        )}

        <div className="grid grid-cols-2 gap-2">
          <MetaChip icon={Users} label="التسليمات" value={submissionCount} />
          <MetaChip icon={GraduationCap} label="العلامة الكاملة" value={homework.maxScore ?? 100} />
        </div>

        {homework.gradesVisible && <Badge variant="info">العلامة ظاهرة للطلاب</Badge>}

        <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
          <Link href={homeworkGradePath(homework.id)} className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full gap-1.5 px-3 py-2 text-xs sm:text-sm">
              <ClipboardList className="h-4 w-4" />
              تقييم
            </Button>
          </Link>
          <Link href={`/teacher/homework/edit/${homework.id}`} className="flex-1 sm:flex-none">
            <Button variant="ghost" className="w-full gap-1.5 px-3 py-2 text-xs sm:text-sm">
              <Pencil className="h-4 w-4" />
              تعديل
            </Button>
          </Link>
          <Button
            variant="danger"
            className="gap-1.5 px-3 py-2 text-xs sm:text-sm"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            حذف
          </Button>
        </div>
      </div>
    </article>
  );
}
