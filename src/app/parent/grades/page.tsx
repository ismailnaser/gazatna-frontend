"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { EmptyState } from "@/components/molecules/EmptyState";
import {
  isParentFeeRestricted,
  ParentAccessBlockedCard,
  ParentNoStudentCard,
  type ParentStudentResponse,
} from "@/components/parent/ParentAccessCards";
import { useGradesCertificateExport } from "@/hooks/useGradesCertificateExport";
import { api } from "@/lib/api";
import { formatAcademicPeriodCombined } from "@/lib/academicPeriod";
import {
  collectGradeReportColumns,
  findGradeComponent,
} from "@/lib/gradesReportLayout";
import { cn } from "@/lib/utils";
import type { Grade, Student } from "@/types";
import { mapAcademicContext } from "@/types/academic";
import { Award, Download, MessageSquare, Sparkles, Star, Trophy } from "lucide-react";

const DEFAULT_SCHOOL_NAME = "مدرسة غَزتنا";

function percentOf(score: number | null | undefined, maxScore: number) {
  if (score == null || !maxScore) return null;
  return Math.round((score / maxScore) * 100);
}

function performanceTone(pct: number | null, passed: boolean | null | undefined) {
  if (passed === false) {
    return { label: "يحتاج دعم", className: "bg-p-red/10 text-p-red", bar: "bg-p-red" };
  }
  if (pct == null || passed == null) {
    return { label: "قيد الرصد", className: "bg-neutral-100 text-p-black/70", bar: "bg-neutral-300" };
  }
  if (pct >= 90) {
    return { label: "ممتاز", className: "bg-brand-yellow/80 text-p-black", bar: "bg-brand-yellow" };
  }
  if (pct >= 80) {
    return { label: "رائع", className: "bg-p-green/15 text-p-green", bar: "bg-p-green" };
  }
  if (pct >= 70) {
    return { label: "جيد", className: "bg-brand-blue/10 text-brand-blue", bar: "bg-brand-blue" };
  }
  return { label: "ناجح", className: "bg-brand-blue-light/20 text-brand-blue", bar: "bg-brand-blue-light" };
}

function ScoreCell({
  score,
  maxScore,
  passed,
}: {
  score: number | null;
  maxScore: number;
  passed: boolean | null;
}) {
  if (score == null) return <span className="text-p-black/40">—</span>;
  return (
    <span className={cn("font-bold tabular-nums", passed === false ? "text-p-red" : "text-p-black")}>
      {score}
      <span className="font-semibold text-p-black/40">/{maxScore}</span>
    </span>
  );
}

function PassFailBadge({ passed, pct }: { passed: boolean | null | undefined; pct: number | null }) {
  const tone = performanceTone(pct, passed);
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold", tone.className)}>
      {pct != null && pct >= 90 ? <Star className="h-3.5 w-3.5 fill-current" /> : null}
      {tone.label}
    </span>
  );
}

function AllGradesTable({ grades }: { grades: Grade[] }) {
  const componentColumns = useMemo(() => collectGradeReportColumns(grades), [grades]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="bg-brand-blue text-white">
            <th className="px-4 py-3 text-start text-xs font-extrabold">المادة</th>
            {componentColumns.map((column) => (
              <th key={column.key} className="px-3 py-3 text-center text-xs font-extrabold">
                {column.name}
              </th>
            ))}
            <th className="px-4 py-3 text-center text-xs font-extrabold">المجموع</th>
            <th className="px-4 py-3 text-center text-xs font-extrabold">التقدير</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((grade) => {
            const pct = percentOf(grade.score, grade.maxScore);
            const tone = performanceTone(pct, grade.passed);
            return (
              <tr
                key={grade.id}
                className="border-b border-neutral-100 last:border-0 hover:bg-brand-yellow/10"
              >
                <td className="px-4 py-3.5">
                  <div className="flex min-w-[10rem] items-center gap-2.5">
                    {pct != null && pct >= 90 ? (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-yellow/80">
                        <Star className="h-4 w-4 fill-p-black text-p-black" />
                      </span>
                    ) : (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
                        <Award className="h-4 w-4 text-brand-blue" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-extrabold text-p-black">{grade.subject}</p>
                      <div className="mt-1.5 h-1.5 w-full max-w-[9rem] overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className={cn("h-full rounded-full", tone.bar)}
                          style={{ width: `${pct ?? 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </td>
                {componentColumns.map((column) => {
                  const component = findGradeComponent(grade, column.key);
                  return (
                    <td key={column.key} className="px-3 py-3.5 text-center">
                      {component ? (
                        <ScoreCell
                          score={component.score}
                          maxScore={component.maxScore}
                          passed={component.passed}
                        />
                      ) : (
                        <span className="text-p-black/40">—</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-3.5 text-center">
                  <p className="font-display text-xl font-extrabold leading-none text-brand-blue">
                    {grade.score ?? "—"}
                  </p>
                  <p className="mt-1 text-[11px] font-bold text-p-black/40">من {grade.maxScore}</p>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <PassFailBadge passed={grade.passed} pct={pct} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ParentGradesPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [schoolName, setSchoolName] = useState(DEFAULT_SCHOOL_NAME);
  const [loading, setLoading] = useState(true);
  const [exportError, setExportError] = useState("");
  const [academicContextLabel, setAcademicContextLabel] = useState("");

  const { exporting, requestExport } = useGradesCertificateExport(
    useCallback((message: string) => setExportError(message), [])
  );

  const gradesWithNotes = useMemo(
    () => grades.filter((grade) => grade.note?.trim()),
    [grades]
  );

  const summary = useMemo(() => {
    const scored = grades.filter((grade) => grade.score != null && grade.maxScore > 0);
    const percents = scored.map((grade) => percentOf(grade.score, grade.maxScore) ?? 0);
    const average = percents.length
      ? Math.round(percents.reduce((sum, value) => sum + value, 0) / percents.length)
      : null;
    const passedCount = grades.filter((grade) => grade.passed === true).length;
    const excellentCount = percents.filter((value) => value >= 90).length;
    const top = scored.reduce<(typeof scored)[number] | null>((best, grade) => {
      if (!best) return grade;
      return (percentOf(grade.score, grade.maxScore) ?? 0) > (percentOf(best.score, best.maxScore) ?? 0)
        ? grade
        : best;
    }, null);
    const allPassed = grades.length > 0 && grades.every((grade) => grade.passed === true);
    return { average, passedCount, excellentCount, top, allPassed, total: grades.length };
  }, [grades]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [s, g, context] = await Promise.all([
          api.getParentStudent().catch(() => null),
          api.getParentGrades().catch(() => []),
          api.getAcademicContext().catch(() => null),
        ]);
        if (cancelled) return;
        setStudent(s as Student | null);
        setGrades(g as Grade[]);
        if (context) {
          const label = formatAcademicPeriodCombined(
            mapAcademicContext(context as Record<string, unknown>)
          );
          if (label) setAcademicContextLabel(label);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function ensureExportMeta() {
    const tasks: Promise<void>[] = [];
    if (schoolName === DEFAULT_SCHOOL_NAME) {
      tasks.push(
        api
          .getSiteSettings()
          .then((res) => {
            const hero = (res as { hero?: { schoolName?: string } }).hero;
            if (hero?.schoolName?.trim()) setSchoolName(hero.schoolName.trim());
          })
          .catch(() => {})
      );
    }
    if (!academicContextLabel) {
      tasks.push(
        api
          .getAcademicContext()
          .then((res) => {
            const label = formatAcademicPeriodCombined(
              mapAcademicContext(res as Record<string, unknown>)
            );
            if (label) setAcademicContextLabel(label);
          })
          .catch(() => {})
      );
    }
    if (tasks.length) await Promise.all(tasks);
  }

  async function handleDownloadCertificate() {
    if (!student || grades.length === 0) return;
    setExportError("");
    await ensureExportMeta();
    await requestExport({ student, grades, schoolName });
  }

  if (!student && !loading) {
    return <ParentNoStudentCard />;
  }

  const studentAccess = student as (Student & ParentStudentResponse) | null;
  if (student && isParentFeeRestricted(studentAccess)) {
    return (
      <ParentAccessBlockedCard
        message={
          studentAccess?.accessRestrictionMessage ||
          "تم إيقاف الوصول إلى حساب الطالب بسبب الرسوم المستحقة."
        }
        studentName={student.name}
      />
    );
  }

  const averageTone = performanceTone(summary.average, summary.average == null ? null : true);

  return (
    <WorkspacePage
      title="العلامات"
      description={
        academicContextLabel
          ? `علامات ${academicContextLabel} — كل رقم قصة نجاح`
          : "كشف علاماتك لكل المواد"
      }
      breadcrumbs={[
        { label: "الرئيسية", href: "/parent" },
        { label: "العلامات" },
      ]}
      loading={loading}
      actions={
        <Button
          onClick={handleDownloadCertificate}
          disabled={exporting || !student || grades.length === 0}
          className="shrink-0"
        >
          <Download className="h-4 w-4" />
          {exporting ? "جاري التحميل..." : "تحميل كشف العلامات"}
        </Button>
      }
    >
      {exportError ? (
        <Alert variant="error" className="mb-4">
          {exportError}
        </Alert>
      ) : null}

      {grades.length === 0 ? (
        <EmptyState title="لسه ما في علامات. أول ما المعلم يرصد، بنوّرها هون." />
      ) : (
        <div className="space-y-4">
          {summary.allPassed ? (
            <div className="flex items-center gap-3 rounded-[1.4rem] border-[3px] border-brand-yellow bg-brand-yellow/20 px-4 py-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
                <Trophy className="h-5 w-5 text-brand-orange" />
              </span>
              <div>
                <p className="font-display text-lg font-extrabold text-p-black">أحسنت! مستوى مميّز</p>
                <p className="text-sm font-semibold text-p-black/70">
                  نجحت في كل المواد المعروضة — استمر على هذا التميز
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card className="flex items-center gap-3 p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-blue/10">
                <Sparkles className="h-6 w-6 text-brand-blue" />
              </span>
              <div>
                <p className="text-xs font-bold text-p-black/50">المعدل العام</p>
                <p className="font-display text-3xl font-extrabold leading-none text-brand-blue">
                  {summary.average ?? "—"}
                  {summary.average != null ? <span className="text-lg text-p-black/35">%</span> : null}
                </p>
                <p className="mt-1 text-xs font-bold text-p-black/55">{averageTone.label}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3 p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-p-green/10">
                <Award className="h-6 w-6 text-p-green" />
              </span>
              <div>
                <p className="text-xs font-bold text-p-black/50">مواد ناجحة</p>
                <p className="font-display text-3xl font-extrabold leading-none text-p-black">
                  {summary.passedCount}
                  <span className="text-lg font-bold text-p-black/35">/{summary.total}</span>
                </p>
                <p className="mt-1 text-xs font-bold text-p-black/55">
                  {summary.excellentCount > 0 ? `${summary.excellentCount} مادة بتقدير ممتاز` : "استمر بالتقدّم"}
                </p>
              </div>
            </Card>
            <Card className="flex items-center gap-3 p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-yellow/70">
                <Trophy className="h-6 w-6 text-p-black" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-p-black/50">أعلى مادة</p>
                <p className="truncate font-display text-xl font-extrabold text-p-black">
                  {summary.top?.subject ?? "—"}
                </p>
                <p className="mt-1 text-xs font-bold text-brand-orange">
                  {summary.top
                    ? `${summary.top.score}/${summary.top.maxScore} — بطل هذه المادة`
                    : "ستظهر بعد رصد العلامات"}
                </p>
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden p-0">
            <AllGradesTable grades={grades} />

            {gradesWithNotes.length > 0 ? (
              <div className="space-y-2 border-t border-neutral-100 bg-neutral-50/70 px-4 py-4">
                <p className="flex items-center gap-2 text-sm font-extrabold text-p-black">
                  <MessageSquare className="h-4 w-4 text-brand-blue" />
                  ملاحظات المعلّم
                </p>
                {gradesWithNotes.map((grade) => (
                  <div
                    key={grade.id}
                    className="rounded-2xl border border-black/5 bg-white px-3 py-2.5"
                  >
                    <p className="text-xs font-extrabold text-brand-blue">{grade.subject}</p>
                    <p className="mt-0.5 text-sm font-semibold text-p-black/80">{grade.note}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        </div>
      )}
    </WorkspacePage>
  );
}
