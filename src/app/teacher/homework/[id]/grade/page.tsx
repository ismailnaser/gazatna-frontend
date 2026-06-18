"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { HomeworkSubmissionsGradeList, HomeworkSubmissionsGradeListSkeleton } from "@/components/teacher/HomeworkSubmissionsGradeList";
import { CollapsibleChipList } from "@/components/molecules/CollapsibleChipList";
import { SubjectMetaGrid } from "@/components/parent/ParentSubjectItemCard";
import { api } from "@/lib/api";
import { loadHomeworkGradingBundle } from "@/lib/teacherHomeworkGrading";
import { ACADEMIC_DESCRIPTION_CLASS } from "@/lib/expandableText";
import type { TeacherAssessmentItem } from "@/types";
import {
  BookOpen,
  ChevronRight,
  ClipboardList,
  Eye,
  EyeOff,
  GraduationCap,
  Pencil,
  PenLine,
  Users,
} from "lucide-react";

function MetaChip({
  icon: Icon,
  label,
  shortLabel,
  value,
}: {
  icon: typeof Users;
  label: string;
  shortLabel?: string;
  value: string | number;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-neutral-100 bg-white px-1.5 py-2.5 text-center shadow-sm sm:flex-row sm:items-center sm:gap-2.5 sm:px-3 sm:py-2.5 sm:text-start">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange sm:h-9 sm:w-9">
        <Icon className="h-4 w-4 sm:h-4 sm:w-4" />
      </span>
      <div className="min-w-0 w-full">
        <p className="text-[11px] leading-snug text-p-black/55 sm:hidden">{shortLabel ?? label}</p>
        <p className="hidden text-[11px] leading-snug text-p-black/45 sm:block">{label}</p>
        <p className="mt-0.5 text-base font-bold leading-none text-p-black sm:text-sm">{value}</p>
      </div>
    </div>
  );
}

export default function TeacherHomeworkGradePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [item, setItem] = useState<TeacherAssessmentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [togglingVisibility, setTogglingVisibility] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const bundle = await loadHomeworkGradingBundle(id);
      setItem(bundle);
      if (!bundle) setError("الواجب غير متاح");
    } catch {
      setError("تعذر تحميل بيانات التقييم");
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  const { homework: hw, submissions, targets } = item ?? {
    homework: null,
    submissions: [],
    targets: [],
  };

  const submissionsByClass = useMemo(
    () =>
      targets.map((target) => ({
        ...target,
        submissions: submissions.filter((sub) => sub.homeworkId === target.id),
      })),
    [targets, submissions]
  );

  const gradedCount = submissions.filter((sub) => sub.score != null).length;
  const pendingCount = submissions.length - gradedCount;
  const maxScore = hw?.maxScore ?? 100;
  const endAt = hw?.endAt || hw?.dueDate;

  async function toggleGradesVisible() {
    if (!item || !hw) return;
    setTogglingVisibility(true);
    try {
      const fd = new FormData();
      fd.append("gradesVisible", hw.gradesVisible ? "false" : "true");
      fd.append("title", hw.title);
      fd.append("description", hw.description);
      fd.append("subject", hw.subject ?? "");
      fd.append("status", hw.status);
      if (hw.startAt) fd.append("startAt", hw.startAt);
      if (hw.endAt) fd.append("endAt", hw.endAt);
      fd.append("dueDate", hw.dueDate);
      fd.append("maxScore", String(hw.maxScore ?? 100));
      if (item.targets.length > 1) fd.append("applyToGroup", "true");
      await api.updateTeacherHomework(hw.id, fd);
      await load();
      setSuccess(hw.gradesVisible ? "تم إخفاء العلامة عن الطلاب" : "تم إظهار العلامة للطلاب");
      setTimeout(() => setSuccess(""), 2500);
    } finally {
      setTogglingVisibility(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-28 animate-pulse rounded bg-neutral-200" />
        <article className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="h-1 bg-brand-orange/40" aria-hidden />
          <div className="space-y-4 p-3 sm:p-4">
            <div className="space-y-2">
              <div className="h-6 w-3/4 max-w-xs animate-pulse rounded bg-neutral-200" />
              <div className="h-4 w-full max-w-md animate-pulse rounded bg-neutral-100" />
            </div>
            <div className="flex gap-1.5 sm:grid sm:grid-cols-4 sm:gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="h-[58px] min-w-0 flex-1 animate-pulse rounded-xl border border-neutral-100 bg-neutral-50 sm:flex-none"
                />
              ))}
            </div>
          </div>
        </article>
        <section className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <header className="border-b border-neutral-100 bg-neutral-50/70 px-3 py-3 sm:px-4">
            <div className="h-4 w-32 animate-pulse rounded bg-neutral-200" />
            <div className="mt-2 h-3 w-20 animate-pulse rounded bg-neutral-100" />
          </header>
          <div className="p-3 sm:p-4">
            <HomeworkSubmissionsGradeListSkeleton />
          </div>
        </section>
      </div>
    );
  }

  if (!item || !hw) {
    return (
      <Card className="text-center text-neutral-500">
        {error || "الواجب غير متاح."}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/teacher/homework"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:underline"
      >
        <ChevronRight className="h-4 w-4" />
        العودة للواجبات
      </Link>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <article className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        <div className="h-1 bg-brand-orange" aria-hidden />

        <header className="flex flex-wrap items-center gap-2 border-b border-neutral-100 bg-neutral-50/60 px-3 py-2.5 sm:px-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
            <PenLine className="h-4 w-4" />
          </span>
          <span className="text-xs font-bold text-p-black/55">تقييم الواجب</span>
          {hw.subject && <Badge variant="default">{hw.subject}</Badge>}
          {hw.gradesVisible ? (
            <Badge variant="success">العلامة ظاهرة للطلاب</Badge>
          ) : (
            <Badge variant="default">العلامة مخفية</Badge>
          )}
        </header>

        <div className="space-y-4 p-3 sm:p-4">
          <div>
            <h1 className="text-lg font-bold leading-snug text-p-black sm:text-xl">{hw.title}</h1>
            {hw.description?.trim() && (
              <p className={ACADEMIC_DESCRIPTION_CLASS}>{hw.description}</p>
            )}
          </div>

          {(hw.startAt || endAt) && (
            <SubjectMetaGrid
              items={[
                ...(hw.startAt ? [{ label: "البداية", dateTime: hw.startAt }] : []),
                { label: "النهاية", dateTime: endAt! },
              ]}
            />
          )}

          <div className="flex gap-1.5 sm:grid sm:grid-cols-4 sm:gap-2">
            <MetaChip icon={Users} label="التسليمات" shortLabel="تسليم" value={submissions.length} />
            <MetaChip icon={GraduationCap} label="مُقيَّم" value={gradedCount} />
            <MetaChip icon={ClipboardList} label="بانتظار التقييم" shortLabel="معلّق" value={pendingCount} />
            <MetaChip icon={BookOpen} label="العلامة الكاملة" shortLabel="العلامة" value={maxScore} />
          </div>

          {targets.length > 1 && (
            <CollapsibleChipList items={targets.map((t) => t.className)} />
          )}

          <div className="flex flex-col gap-2 border-t border-neutral-100 pt-3 sm:flex-row sm:flex-wrap">
            <Button
              variant="outline"
              className="w-full gap-1.5 text-xs sm:w-auto sm:text-sm"
              onClick={toggleGradesVisible}
              disabled={togglingVisibility}
            >
              {hw.gradesVisible ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  إخفاء العلامة عن الطالب
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  إظهار العلامة للطالب
                </>
              )}
            </Button>
            <Link href={`/teacher/homework/edit/${hw.id}`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full gap-1.5 text-xs sm:text-sm">
                <Pencil className="h-4 w-4" />
                تعديل الواجب
              </Button>
            </Link>
          </div>
        </div>
      </article>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/60 px-4 py-10 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-p-black/35">
            <ClipboardList className="h-6 w-6" />
          </span>
          <p className="font-semibold text-p-black/70">لا توجد تسليمات بعد</p>
          <p className="mt-1 text-sm text-p-black/45">
            عندما يسلّم الطلاب واجبهم ستظهر هنا للتقييم.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissionsByClass.map((section) =>
            section.submissions.length === 0 ? null : (
              <section
                key={section.id}
                className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm"
              >
                <header className="flex items-center justify-between gap-2 border-b border-neutral-100 bg-neutral-50/70 px-3 py-3 sm:px-4">
                  <div>
                    <h2 className="text-sm font-bold text-p-black">{section.className}</h2>
                    <p className="mt-0.5 text-xs text-p-black/45">
                      {section.submissions.length} تسليم
                    </p>
                  </div>
                  <Badge variant="info">
                    {section.submissions.filter((sub) => sub.score != null).length}/{section.submissions.length}{" "}
                    مُقيَّم
                  </Badge>
                </header>
                <div className="p-3 sm:p-4">
                  <HomeworkSubmissionsGradeList
                    submissions={section.submissions}
                    maxScore={maxScore}
                  />
                </div>
              </section>
            )
          )}
        </div>
      )}
    </div>
  );
}
