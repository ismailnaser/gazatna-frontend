"use client";

import { Badge } from "@/components/atoms/Badge";
import { Card } from "@/components/atoms/Card";
import { certificateScopeLabels } from "@/types/academic";
import { isArchivedAcademicYear } from "../academicAdminUtils";
import { useAcademicAdmin } from "../AcademicAdminContext";

export function AcademicArchivePanel() {
  const { selectedYear, certificateConfig, loadingCertificate } = useAcademicAdmin();

  if (!selectedYear || !isArchivedAcademicYear(selectedYear)) return null;

  const publishedTerm = selectedYear.terms.find(
    (term) => term.id === certificateConfig?.publishedTermId
  );

  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-4">
        <div>
          <h3 className="font-bold text-p-black">بيانات السنة المؤرشفة</h3>
          <p className="mt-1 text-xs text-p-black/55">
            هذه السنة منتهية ومؤرشفة. يمكنك مراجعة بياناتها أو حذفها نهائياً من الأرشيف.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-p-cream/30 px-4 py-3">
            <p className="text-xs text-p-black/55">الحالة</p>
            <div className="mt-1">
              <Badge variant="default">مؤرشفة</Badge>
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-p-cream/30 px-4 py-3">
            <p className="text-xs text-p-black/55">عدد الفصول</p>
            <p className="mt-1 text-lg font-bold text-p-black">{selectedYear.terms.length}</p>
          </div>
          {selectedYear.createdAt ? (
            <div className="rounded-xl border border-neutral-200 bg-p-cream/30 px-4 py-3">
              <p className="text-xs text-p-black/55">تاريخ الإنشاء</p>
              <p className="mt-1 font-semibold text-p-black">
                {new Date(selectedYear.createdAt).toLocaleDateString("ar")}
              </p>
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-neutral-100 px-4 py-3">
          <h3 className="font-bold text-p-black">الفصول الدراسية</h3>
        </div>
        {selectedYear.terms.length === 0 ? (
          <p className="px-4 py-6 text-sm text-neutral-500">لا توجد فصول مسجّلة لهذه السنة.</p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {selectedYear.terms.map((term) => (
              <div
                key={term.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-p-black">{term.name}</p>
                  <p className="mt-0.5 text-xs text-p-black/55">
                    {term.startDate} — {term.endDate}
                  </p>
                </div>
                {term.isCurrent ? (
                  <Badge variant="success">كان الفصل الحالي</Badge>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-3 p-4">
        <h3 className="font-bold text-p-black">الشهادات</h3>
        {loadingCertificate ? (
          <p className="text-sm text-neutral-500">جاري التحميل...</p>
        ) : certificateConfig ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <p className="text-xs text-p-black/55">دورة الإصدار</p>
              <p className="mt-1 font-semibold text-p-black">
                {certificateScopeLabels[certificateConfig.issuanceScope]}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <p className="text-xs text-p-black/55">حالة النشر</p>
              <div className="mt-1">
                {certificateConfig.isPublished ? (
                  <Badge variant="success">كانت منشورة</Badge>
                ) : (
                  <Badge variant="default">لم تُنشر</Badge>
                )}
              </div>
            </div>
            {certificateConfig.isPublished && certificateConfig.publishedAt ? (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 sm:col-span-2">
                <p className="text-xs text-p-black/55">تاريخ النشر</p>
                <p className="mt-1 font-semibold text-p-black">
                  {new Date(certificateConfig.publishedAt).toLocaleString("ar")}
                  {publishedTerm ? ` — ${publishedTerm.name}` : ""}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">لا توجد إعدادات شهادات محفوظة لهذه السنة.</p>
        )}
      </Card>
    </div>
  );
}
