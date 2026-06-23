"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import {
  isParentFeeRestricted,
  ParentAccessBlockedCard,
  ParentNoStudentCard,
  type ParentStudentResponse,
} from "@/components/parent/ParentAccessCards";
import { useGradesCertificateExport } from "@/hooks/useGradesCertificateExport";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Grade, GradeComponent, Student } from "@/types";
import { mapFeeStatus } from "@/types/finance";
import { Download, Lock } from "lucide-react";

const DEFAULT_SCHOOL_NAME = "مدرسة غَزتنا";

function scoreTextClass(passed: boolean | null | undefined) {
  if (passed == null) return "text-p-black/45";
  return passed ? "text-p-green font-semibold" : "text-p-red font-semibold";
}

function PassFailBadge({ passed }: { passed: boolean | null | undefined }) {
  if (passed == null) {
    return (
      <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-p-black/45">
        —
      </span>
    );
  }

  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
        passed ? "bg-p-green/10 text-p-green" : "bg-p-red/10 text-p-red"
      )}
    >
      {passed ? "ناجح" : "راسب"}
    </span>
  );
}

function ScoreCell({ score, maxScore, passed }: { score: number | null; maxScore: number; passed: boolean | null }) {
  return (
    <span className={scoreTextClass(passed)}>
      {score == null ? "—" : score}/{maxScore}
    </span>
  );
}

function GradeBreakdownTable({ grade }: { grade: Grade }) {
  const components = grade.components ?? [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-100 bg-p-cream/60 text-p-black/60">
            <th className="px-4 py-2.5 text-start font-semibold">التقسيم</th>
            <th className="px-4 py-2.5 text-start font-semibold">العلامة</th>
            <th className="px-4 py-2.5 text-start font-semibold">علامة النجاح</th>
            <th className="px-4 py-2.5 text-start font-semibold">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {components.map((component: GradeComponent) => (
            <tr key={component.id} className="border-b border-neutral-50">
              <td className="px-4 py-2.5 font-medium text-p-black">{component.name}</td>
              <td className="px-4 py-2.5">
                <ScoreCell
                  score={component.score}
                  maxScore={component.maxScore}
                  passed={component.passed}
                />
              </td>
              <td className="px-4 py-2.5 text-p-black/55">{component.passScore}</td>
              <td className="px-4 py-2.5">
                <PassFailBadge passed={component.passed} />
              </td>
            </tr>
          ))}
          <tr className="bg-neutral-50/80">
            <td className="px-4 py-3 font-bold text-p-black">المجموع</td>
            <td className="px-4 py-3">
              <ScoreCell score={grade.score} maxScore={grade.maxScore} passed={grade.passed} />
            </td>
            <td className="px-4 py-3 font-medium text-p-black/70">{grade.passScore}</td>
            <td className="px-4 py-3">
              <PassFailBadge passed={grade.passed} />
            </td>
          </tr>
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

  const [blocked, setBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState("");
  const { exporting, requestExport } = useGradesCertificateExport(
    useCallback((message: string) => setExportError(message), [])
  );

  useEffect(() => {
    Promise.all([
      api.getParentStudent().then((s) => setStudent(s as Student)).catch(() => setStudent(null)),
      api.getParentGrades().then((g) => setGrades(g as Grade[])).catch(() => setGrades([])),
      api.getSiteSettings().then((res) => {
        const hero = (res as { hero?: { schoolName?: string } }).hero;
        if (hero?.schoolName?.trim()) setSchoolName(hero.schoolName.trim());
      }).catch(() => {}),
      api.getAcademicContext().then((res) => {
        const ctx = res as { academicYear?: { name?: string }; currentTerm?: { name?: string } };
        const year = ctx.academicYear?.name;
        const term = ctx.currentTerm?.name;
        if (year && term) setAcademicContextLabel(`${year} — ${term}`);
        else if (term) setAcademicContextLabel(term);
      }).catch(() => {}),
      api.getParentFees().then((data) => {
        const status = mapFeeStatus(data.feeStatus as Record<string, unknown>);
        setBlocked(Boolean(status?.blocked));
        setBlockMessage(status?.message ?? "");
      }).catch(() => {
        setBlocked(false);
        setBlockMessage("");
      }),
    ]).finally(() => setLoading(false));
  }, []);

  async function handleDownloadCertificate() {
    if (!student || grades.length === 0) return;
    setExportError("");
    await requestExport({ student, grades, schoolName });
  }

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  if (!student) {
    return <ParentNoStudentCard />;
  }

  const studentAccess = student as Student & ParentStudentResponse;
  if (isParentFeeRestricted(studentAccess)) {
    return (
      <div>
        <PageHeader title="العلامات" description="تقسيمة العلامات ونتيجة الطالب" />
        <ParentAccessBlockedCard
          message={
            studentAccess.accessRestrictionMessage ||
            "تم إيقاف الوصول إلى حساب الطالب بسبب الرسوم المستحقة."
          }
          studentName={student.name}
        />
      </div>
    );
  }

  if (blocked) {
    return (
      <div>
        <PageHeader title="العلامات" description="تقسيمة العلامات ونتيجة الطالب" />
        <Alert variant="warning">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <p>{blockMessage || "عذراً، يرجى تسديد القسط المستحق لعرض العلامات."}</p>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="العلامات"
          description={
            academicContextLabel
              ? `علامات ${academicContextLabel} — تقسيمة العلامات ونتيجة الطالب للفصل الحالي`
              : "تقسيمة العلامات ونتيجة الطالب للفصل الحالي"
          }
        />
        <Button
          onClick={handleDownloadCertificate}
          disabled={exporting || grades.length === 0}
          className="shrink-0"
        >
          <Download className="h-4 w-4" />
          {exporting ? "جاري التحميل..." : "تحميل كشف العلامات"}
        </Button>
      </div>

      {exportError ? (
        <Alert variant="error" className="mb-4">
          {exportError}
        </Alert>
      ) : null}

      {grades.length === 0 ? (
        <Card className="text-center text-neutral-500">لا توجد علامات مسجّلة بعد.</Card>
      ) : (
        <div className="space-y-4">
          {grades.map((grade) => (
            <Card key={grade.id} className="overflow-hidden p-0">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3">
                <div>
                  <h2 className="text-base font-bold text-p-black">{grade.subject}</h2>
                  <p className="mt-0.5 text-xs text-p-black/50">
                    العلامة الكاملة: {grade.maxScore} — علامة النجاح: {grade.passScore}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ScoreCell score={grade.score} maxScore={grade.maxScore} passed={grade.passed} />
                  <PassFailBadge passed={grade.passed} />
                </div>
              </div>

              {grade.components && grade.components.length > 0 ? (
                <GradeBreakdownTable grade={grade} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="bg-neutral-50/80">
                        <td className="px-4 py-3 font-bold text-p-black">المجموع</td>
                        <td className="px-4 py-3">
                          <ScoreCell score={grade.score} maxScore={grade.maxScore} passed={grade.passed} />
                        </td>
                        <td className="px-4 py-3 font-medium text-p-black/70">{grade.passScore}</td>
                        <td className="px-4 py-3">
                          <PassFailBadge passed={grade.passed} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {grade.note ? (
                <p className="border-t border-neutral-100 px-4 py-2.5 text-xs text-p-black/55">
                  ملاحظات المعلم: {grade.note}
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
