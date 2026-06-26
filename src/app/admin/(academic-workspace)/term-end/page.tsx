"use client";

import { PageHeader } from "@/components/molecules/PageHeader";
import { TermEndPanel } from "@/components/admin/academic/panels/TermEndPanel";

export default function AdminTermEndPage() {
  return (
    <div>
      <PageHeader
        title="نهاية الفصل"
        description="معاينة نتائج الفصل الحالي، إصدار شهاداته، والانتقال للفصل التالي"
      />
      <TermEndPanel />
    </div>
  );
}
