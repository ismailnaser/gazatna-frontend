"use client";

import { PageHeader } from "@/components/molecules/PageHeader";
import { YearEndPanel } from "@/components/admin/academic/panels/YearEndPanel";

export default function AdminYearEndPage() {
  return (
    <div>
      <PageHeader
        title="نهاية السنة"
        description="معاينة المعدل السنوي عبر كل الفصول، الترفيع، إصدار شهادات نهاية السنة، وأرشفة السنة"
      />
      <YearEndPanel />
    </div>
  );
}
