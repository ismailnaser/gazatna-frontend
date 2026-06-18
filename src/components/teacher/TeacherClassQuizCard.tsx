"use client";

import Link from "next/link";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { SubjectMetaGrid } from "@/components/parent/ParentSubjectItemCard";
import { QUESTION_TYPE_OPTIONS } from "@/components/teacher/QuizForm";
import { quizTotalPoints } from "@/lib/quiz-scoring";
import { quizGradePath } from "@/lib/teacherQuizGrading";
import { ACADEMIC_DESCRIPTION_CLASS } from "@/lib/expandableText";
import type { Quiz } from "@/types";
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  ListChecks,
  Pencil,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";

const typeLabel = Object.fromEntries(QUESTION_TYPE_OPTIONS.map((o) => [o.value, o.label]));

function statusBadge(windowStatus?: string, status?: Quiz["status"]) {
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

export function TeacherClassQuizCard({
  quiz,
  submissionCount,
  isOpen,
  onToggle,
  onDelete,
}: {
  quiz: Quiz;
  submissionCount: number;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const endAt = quiz.endAt || quiz.dueDate;
  const maxScore = quiz.maxScore ?? quizTotalPoints(quiz.questions);

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <div className="h-1 bg-brand-blue" aria-hidden />

      <header className="flex flex-wrap items-center gap-2 border-b border-neutral-100 bg-neutral-50/60 px-3 py-2.5 sm:px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
          <ClipboardList className="h-4 w-4" />
        </span>
        <span className="text-xs font-bold text-p-black/55">اختبار</span>
        {statusBadge(quiz.windowStatus, quiz.status)}
        {quiz.subject && <Badge variant="default">{quiz.subject}</Badge>}
      </header>

      <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
        <button type="button" className="w-full text-start" onClick={onToggle}>
          <h3 className="text-base font-bold leading-snug text-p-black sm:text-lg">{quiz.title}</h3>
          {quiz.description?.trim() && (
            <p className={ACADEMIC_DESCRIPTION_CLASS}>{quiz.description}</p>
          )}
        </button>

        {(quiz.startAt || endAt) && (
          <SubjectMetaGrid
            items={[
              ...(quiz.startAt ? [{ label: "البداية", dateTime: quiz.startAt }] : []),
              { label: "النهاية", dateTime: endAt },
            ]}
          />
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <MetaChip icon={ListChecks} label="الأسئلة" value={quiz.questions.length} />
          <MetaChip icon={ClipboardList} label="الدرجة" value={maxScore} />
          <MetaChip icon={Users} label="المشاركون" value={submissionCount} />
          <MetaChip icon={Clock} label="المدة" value={`${quiz.durationMinutes} د`} />
          <MetaChip icon={RefreshCw} label="المحاولات" value={quiz.maxAttempts ?? 1} />
        </div>

        <div className="flex flex-wrap gap-2">
          {quiz.gradesVisible && <Badge variant="info">العلامة ظاهرة</Badge>}
          {quiz.reviewAllowed && <Badge variant="info">المراجعة مفعّلة</Badge>}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
          <Link href={quizGradePath(quiz.id)} className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full gap-1.5 px-3 py-2 text-xs sm:text-sm">
              <ClipboardList className="h-4 w-4" />
              تقييم
            </Button>
          </Link>
          <Link href={`/teacher/quizzes/edit/${quiz.id}`} className="flex-1 sm:flex-none">
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
            {isOpen ? "إخفاء" : "الأسئلة"}
          </Button>
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

      {isOpen && (
        <div className="space-y-3 border-t border-neutral-100 bg-neutral-50/80 px-3 py-4 sm:px-4">
          {quiz.questions.map((q, i) => (
            <div key={q.id} className="rounded-xl border border-neutral-100 bg-white p-3">
              <p className="text-sm font-semibold text-p-black">
                {i + 1}. {q.prompt}
              </p>
              <p className="mt-1 text-xs text-p-black/50">
                {typeLabel[q.questionType] ?? q.questionType} — {q.points} درجة
              </p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
