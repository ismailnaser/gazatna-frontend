"use client";

import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Select } from "@/components/atoms/Select";
import { promotionActionLabels } from "@/types/academic";
import type { PromotionStudentAction } from "@/types/academic";
import { Download, Eye, Play } from "lucide-react";
import {
  canUseYearEnd,
  getCurrentTerm,
  getTermDisplayName,
  isLastTermInYear,
  priorTermsAllClosed,
  resolveStudentDecision,
  sortedTerms,
} from "../academicAdminUtils";
import { useAcademicAdmin } from "../AcademicAdminContext";

export function YearEndPanel() {
  const {
    selectedYear,
    preview,
    decisions,
    loadingPreview,
    executingRollover,
    rolloverSuccess,
    exportingPdf,
    promotionDecisionOptions,
    handleExportPdf,
    handleLoadPreview,
    handleExecuteRollover,
    setStudentDecision,
    actionBadgeVariant,
  } = useAcademicAdmin();

  if (!selectedYear) return null;

  if (!selectedYear.isActive) {
    return (
      <Alert variant="info">
        معاينة وتنفيذ نهاية السنة متاحة للسنة الدراسية النشطة فقط.
      </Alert>
    );
  }

  const currentTerm = getCurrentTerm(selectedYear);

  if (!currentTerm) {
    return <Alert variant="warning">لا يوجد فصل دراسي حالي لهذه السنة.</Alert>;
  }

  if (!isLastTermInYear(selectedYear, currentTerm)) {
    return (
      <Alert variant="info">
        نهاية السنة متاحة عند <strong>الفصل الأخير</strong> فقط. أغلق الفصول السابقة من صفحة{" "}
        <strong>نهاية الفصل</strong> أولاً. الفصل الحالي: {getTermDisplayName(currentTerm)}.
      </Alert>
    );
  }

  if (!priorTermsAllClosed(selectedYear, currentTerm)) {
    const pending = sortedTerms(selectedYear).filter(
      (term) => term.id !== currentTerm.id && !term.isClosed
    );
    return (
      <Alert variant="warning">
        يجب إغلاق الفصول السابقة أولاً: {pending.map((term) => getTermDisplayName(term)).join("، ")}. استخدم صفحة{" "}
        <strong>نهاية الفصل</strong>.
      </Alert>
    );
  }

  if (!canUseYearEnd(selectedYear)) {
    return (
      <Alert variant="warning">
        لا يمكن معاينة نهاية السنة حالياً. تحقق من حالة الفصول الدراسية.
      </Alert>
    );
  }

  return (
    <Card className="min-w-0 max-w-full space-y-4 overflow-hidden p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-p-black">معاينة وتنفيذ نهاية السنة</h3>
          <p className="text-xs text-p-black/55">
            راجع نتائج السنة على مستوى الطالب، حدّد قرارات الترفيع، ثم نفّذ الأرشفة وفتح سنة
            جديدة. عند التنفيذ تُصدر شهادة نهاية السنة (معدل جميع الفصول) وشهادة التقدير للمؤهلين
            فقط — دون شهادة منفصلة للفصل الأخير — ثم تُؤرشف السنة. أنشئ السنة الدراسية الجديدة يدوياً
            من قسم السنوات الدراسية.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleLoadPreview} disabled={loadingPreview}>
            <Eye className="h-4 w-4" />
            {loadingPreview ? "جاري المعاينة..." : "معاينة النتائج"}
          </Button>
          {preview ? (
            <Button variant="outline" onClick={handleExportPdf} disabled={exportingPdf}>
              <Download className="h-4 w-4" />
              {exportingPdf ? "جاري التصدير..." : "تصدير PDF"}
            </Button>
          ) : null}
        </div>
      </div>

      {rolloverSuccess ? <Alert variant="success">{rolloverSuccess}</Alert> : null}

      {preview ? (
        <div className="min-w-0 max-w-full space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "ناجح في السنة", value: preview.summary.passed },
              { label: "راسب في السنة", value: preview.summary.failed },
              { label: "ترفيع", value: preview.summary.promote },
              { label: "إعادة", value: preview.summary.repeat },
              { label: "تخرّج", value: preview.summary.graduate },
              { label: "بانتظار قرار", value: preview.summary.pending },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-p-cream px-3 py-2 text-center">
                <p className="text-lg font-bold text-p-black">{item.value}</p>
                <p className="text-xs text-p-black/55">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-neutral-200 bg-white">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-p-cream/60 text-p-black/60">
                  <th className="px-3 py-2 text-start font-semibold">الطالب</th>
                  <th className="px-3 py-2 text-start font-semibold">الصف</th>
                  <th className="px-3 py-2 text-start font-semibold">الحالة السنوية</th>
                  <th className="px-3 py-2 text-start font-semibold">القرار</th>
                </tr>
              </thead>
              <tbody>
                {preview.students.map((row) => {
                  const decision =
                    decisions[row.studentId] ??
                    (row.finalAction === "pending"
                      ? "pending"
                      : (row.finalAction as PromotionStudentAction));
                  const resolvedAction = resolveStudentDecision(row, decisions);

                  return (
                    <tr key={row.studentId} className="border-b border-neutral-50">
                      <td className="px-3 py-2.5">
                        <p className="font-medium text-p-black">{row.name}</p>
                        <p className="text-xs text-p-black/45">{row.studentNumber || "—"}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        {row.currentGrade} {row.currentSection}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant={row.yearPassed ? "success" : "danger"}>
                          {row.yearPassed ? "ناجح في السنة" : "راسب في السنة"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        {row.needsReview || row.finalAction === "pending" ? (
                          <Select
                            value={decision === "pending" ? "repeat" : decision}
                            options={promotionDecisionOptions}
                            onChange={(e) =>
                              setStudentDecision(
                                row.studentId,
                                e.target.value as PromotionStudentAction
                              )
                            }
                          />
                        ) : (
                          <Badge variant={actionBadgeVariant(resolvedAction)}>
                            {promotionActionLabels[
                              resolvedAction as keyof typeof promotionActionLabels
                            ] ?? resolvedAction}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={handleLoadPreview} disabled={loadingPreview}>
              تحديث المعاينة
            </Button>
            <Button onClick={handleExecuteRollover} disabled={executingRollover}>
              <Play className="h-4 w-4" />
              {executingRollover ? "جاري التنفيذ..." : "تنفيذ نهاية السنة"}
            </Button>
          </div>

          <Alert variant="info">
            سيُصدر تلقائياً عند التنفيذ: شهادة نهاية السنة (معدل جميع الفصول) وشهادة تقدير نهاية السنة
            للطلاب المؤهلين حسب الحد الأدنى للمعدل — دون إصدار شهادة منفصلة للفصل الأخير. ثم تُؤرشف
            السنة الحالية دون إنشاء سنة جديدة تلقائياً — أنشئ السنة التالية من «السنوات الدراسية».
          </Alert>

          {preview.summary.pending > 0 ? (
            <Alert variant="warning">
              يوجد {preview.summary.pending} طالب يحتاج قراراً يدوياً. حدّد قراراً لكل منهم ثم اضغط
              «تحديث المعاينة».
            </Alert>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
