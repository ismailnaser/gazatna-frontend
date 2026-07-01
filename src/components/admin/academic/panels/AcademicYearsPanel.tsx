"use client";

import { Badge } from "@/components/atoms/Badge";
import { Card } from "@/components/atoms/Card";
import { useAcademicAdmin } from "../AcademicAdminContext";
import { getTermDisplayName } from "../academicAdminUtils";

export function AcademicYearsPanel() {
  const { selectedYear } = useAcademicAdmin();

  if (!selectedYear) return null;

  const currentTerm = selectedYear.terms.find((term) => term.isCurrent);

  return (
    <Card className="space-y-4 p-4">
      <div>
        <h3 className="font-bold text-p-black">نظرة عامة على السنة</h3>
        <p className="mt-1 text-xs text-p-black/55">
          اختر من القائمة الجانبية سنة أخرى، أو انتقل إلى الأقسام الأخرى لإدارة الفصول والسياسات
          والشهادات.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-p-cream/30 px-4 py-3">
          <p className="text-xs text-p-black/55">الحالة</p>
          <div className="mt-1">
            {selectedYear.isActive ? (
              <Badge variant="success">نشطة</Badge>
            ) : (
              <Badge variant="default">غير نشطة</Badge>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-p-cream/30 px-4 py-3">
          <p className="text-xs text-p-black/55">عدد الفصول</p>
          <p className="mt-1 text-lg font-bold text-p-black">{selectedYear.terms.length}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-p-cream/30 px-4 py-3">
          <p className="text-xs text-p-black/55">الفصل الحالي</p>
          <p className="mt-1 font-semibold text-p-black">{getTermDisplayName(currentTerm)}</p>
        </div>
      </div>
    </Card>
  );
}
