"use client";

import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Download, Eye, Play } from "lucide-react";
import {
  canUseTermEnd,
  getCurrentTerm,
  isLastTermInYear,
  priorTermsAllClosed,
  sortedTerms,
} from "../academicAdminUtils";
import { useAcademicAdmin } from "../AcademicAdminContext";

export function TermEndPanel() {
  const {
    selectedYear,
    termPreview,
    loadingTermPreview,
    executingTermEnd,
    termEndSuccess,
    exportingTermPdf,
    handleLoadTermPreview,
    handleExecuteTermEnd,
    handleExportTermPdf,
  } = useAcademicAdmin();

  if (!selectedYear) return null;

  if (!selectedYear.isActive) {
    return (
      <Alert variant="info">
        معاينة وتنفيذ نهاية الفصل متاحة للسنة الدراسية النشطة فقط.
      </Alert>
    );
  }

  const currentTerm = getCurrentTerm(selectedYear);
  const isLast = currentTerm ? isLastTermInYear(selectedYear, currentTerm) : false;
  const canClose = canUseTermEnd(selectedYear);

  if (!currentTerm) {
    return <Alert variant="warning">لا يوجد فصل دراسي حالي لهذه السنة.</Alert>;
  }

  if (isLast) {
    return (
      <Alert variant="info">
        «{currentTerm.name}» هو الفصل الأخير في السنة. استخدم صفحة <strong>نهاية السنة</strong>{" "}
        لمعاينة المعدل السنوي والترفيع وأرشفة السنة.
      </Alert>
    );
  }

  if (currentTerm.isClosed) {
    return <Alert variant="info">الفصل الحالي مُغلق مسبقاً.</Alert>;
  }

  if (!priorTermsAllClosed(selectedYear, currentTerm)) {
    const pending = sortedTerms(selectedYear).filter(
      (term) => term.id !== currentTerm.id && !term.isClosed
    );
    return (
      <Alert variant="warning">
        يجب إغلاق الفصول السابقة أولاً: {pending.map((term) => term.name).join("، ")}
      </Alert>
    );
  }

  return (
    <Card className="min-w-0 max-w-full space-y-4 overflow-hidden p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-p-black">معاينة وتنفيذ نهاية الفصل</h3>
          <p className="text-xs text-p-black/55">
            راجع نتائج <strong>{currentTerm.name}</strong> على مستوى الطالب، ثم أغلق الفصل وانشر
            شهاداته وانتقل للفصل التالي. تُصفَّر علامات الفصل الجديد تلقائياً.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleLoadTermPreview} disabled={loadingTermPreview || !canClose}>
            <Eye className="h-4 w-4" />
            {loadingTermPreview ? "جاري المعاينة..." : "معاينة نتائج الفصل"}
          </Button>
          {termPreview ? (
            <Button variant="outline" onClick={handleExportTermPdf} disabled={exportingTermPdf}>
              <Download className="h-4 w-4" />
              {exportingTermPdf ? "جاري التصدير..." : "تصدير PDF"}
            </Button>
          ) : null}
        </div>
      </div>

      {termEndSuccess ? <Alert variant="success">{termEndSuccess}</Alert> : null}

      {termPreview ? (
        <div className="min-w-0 max-w-full space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
            <div className="rounded-xl bg-p-cream px-3 py-2 text-center">
              <p className="text-lg font-bold text-p-black">{termPreview.summary.passed}</p>
              <p className="text-xs text-p-black/55">ناجح في الفصل</p>
            </div>
            <div className="rounded-xl bg-p-cream px-3 py-2 text-center">
              <p className="text-lg font-bold text-p-black">{termPreview.summary.failed}</p>
              <p className="text-xs text-p-black/55">راسب في الفصل</p>
            </div>
          </div>

          <div className="max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-neutral-200 bg-white">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-p-cream/60 text-p-black/60">
                  <th className="px-3 py-2 text-start font-semibold">الطالب</th>
                  <th className="px-3 py-2 text-start font-semibold">الصف</th>
                  <th className="px-3 py-2 text-start font-semibold">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {termPreview.students.map((row) => (
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
                        {row.yearPassed ? "ناجح" : "راسب"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={handleLoadTermPreview} disabled={loadingTermPreview}>
              تحديث المعاينة
            </Button>
            <Button onClick={handleExecuteTermEnd} disabled={executingTermEnd}>
              <Play className="h-4 w-4" />
              {executingTermEnd ? "جاري التنفيذ..." : "إغلاق الفصل والانتقال للتالي"}
            </Button>
          </div>

          {termPreview.nextTermName ? (
            <Alert variant="info">
              بعد التنفيذ سيتم نشر شهادات «{termPreview.termName}»، تعيين «
              {termPreview.nextTermName}» كفصل حالي، ومسح علامات الفصل الجديد لبدء إدخال جديد.
            </Alert>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
