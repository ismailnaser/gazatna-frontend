"use client";

import Link from "next/link";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { CollapsibleChipList } from "@/components/molecules/CollapsibleChipList";
import { SubjectMetaGrid } from "@/components/parent/ParentSubjectItemCard";
import { HomeworkSubmissionsGradeList } from "@/components/teacher/HomeworkSubmissionsGradeList";
import type { HomeworkGroup } from "@/lib/homeworkGroups";
import { homeworkGradePath } from "@/lib/teacherHomeworkGrading";
import { ACADEMIC_DESCRIPTION_CLASS } from "@/lib/expandableText";
import type { HomeworkSubmission } from "@/types";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Pencil,
  PenLine,
  Trash2,
  Users,
} from "lucide-react";

function statusBadge(windowStatus?: string) {
  if (windowStatus === "active") {
    return <Badge variant="success">نشط</Badge>;
  }
  if (windowStatus === "scheduled") {
    return <Badge variant="warning">لم يبدأ</Badge>;
  }
  if (windowStatus === "ended") {
    return <Badge variant="danger">منتهٍ</Badge>;
  }
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

export function TeacherHomeworkGroupCard({
  group,
  isOpen,
  submissionTotal,
  onToggle,
  onDelete,
  getHomeworkSubmissions,
}: {
  group: HomeworkGroup;
  isOpen: boolean;
  submissionTotal: number;
  onToggle: () => void;
  onDelete: () => void;
  getHomeworkSubmissions: (homeworkId: string) => HomeworkSubmission[];
}) {
  const endAt = group.endAt || group.dueDate;
  const hasSubmissions =
    group.totalSubmissions > 0 ||
    group.targets.some((t) => getHomeworkSubmissions(t.id).length > 0);

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <div className="h-1 bg-brand-orange" aria-hidden />

      <header className="flex flex-wrap items-center gap-2 border-b border-neutral-100 bg-neutral-50/60 px-3 py-2.5 sm:px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
          <PenLine className="h-4 w-4" />
        </span>
        <span className="text-xs font-bold text-p-black/55">واجب</span>
        {statusBadge(group.windowStatus)}
        {group.subject && <Badge variant="default">{group.subject}</Badge>}
      </header>

      <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
        <button type="button" className="w-full text-start" onClick={onToggle}>
          <h3 className="text-base font-bold leading-snug text-p-black sm:text-lg">{group.title}</h3>
          {group.description?.trim() && (
            <p className={ACADEMIC_DESCRIPTION_CLASS}>{group.description}</p>
          )}
        </button>

        <SubjectMetaGrid
          items={[
            ...(group.startAt ? [{ label: "البداية", dateTime: group.startAt }] : []),
            { label: "النهاية", dateTime: endAt },
          ]}
        />

        <div className="grid grid-cols-2 gap-2">
          <MetaChip icon={BookOpen} label="الفصول" value={group.targets.length} />
          <MetaChip icon={Users} label="التسليمات" value={submissionTotal} />
        </div>

        {group.targets.length > 1 && (
          <CollapsibleChipList
            items={group.targets.map((target) => target.className ?? "فصل")}
          />
        )}

        <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
          <Link href={homeworkGradePath(group.id)} className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full gap-1.5 px-3 py-2 text-xs sm:text-sm">
              <ClipboardList className="h-4 w-4" />
              تقييم
            </Button>
          </Link>
          <Link href={`/teacher/homework/edit/${group.id}`} className="flex-1 sm:flex-none">
            <Button variant="ghost" className="w-full gap-1.5 px-3 py-2 text-xs sm:text-sm">
              <Pencil className="h-4 w-4" />
              تعديل
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="flex-1 gap-1.5 px-3 py-2 text-xs sm:text-sm sm:flex-none"
            onClick={onToggle}
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {isOpen ? "إخفاء" : "التفاصيل"}
          </Button>
          <Button
            variant="danger"
            className="px-3 py-2"
            onClick={onDelete}
            aria-label="حذف الواجب"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-4 border-t border-neutral-100 bg-neutral-50/80 px-3 py-4 sm:px-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-p-black">تسليمات الطلاب</p>
            <Link href={homeworkGradePath(group.id)}>
              <Button variant="outline" className="text-xs">
                <ClipboardList className="h-3.5 w-3.5" />
                صفحة التقييم
              </Button>
            </Link>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold text-p-black/55">الفصول المستهدفة</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.targets.map((target) => (
                <div
                  key={target.id}
                  className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white px-3 py-2.5 text-sm"
                >
                  <span className="font-medium text-p-black">{target.className}</span>
                  <span className="text-xs text-p-black/50">
                    {target.submissionCount ?? getHomeworkSubmissions(target.id).length} تسليم
                  </span>
                </div>
              ))}
            </div>
          </div>

          {hasSubmissions ? (
            <div className="space-y-4">
              {group.targets.map((target) => {
                const subs = getHomeworkSubmissions(target.id);
                if (subs.length === 0) return null;
                return (
                  <div key={target.id}>
                    <p className="mb-2 text-xs font-bold text-p-black/70">{target.className}</p>
                    <HomeworkSubmissionsGradeList
                      submissions={subs}
                      maxScore={group.maxScore ?? 100}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">لا توجد تسليمات بعد.</p>
          )}
        </div>
      )}
    </article>
  );
}
