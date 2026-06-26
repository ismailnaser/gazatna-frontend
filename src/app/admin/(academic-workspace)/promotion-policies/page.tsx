"use client";

import { PageHeader } from "@/components/molecules/PageHeader";
import { PromotionPoliciesPanel } from "@/components/admin/academic/panels/PromotionPoliciesPanel";

export default function AdminPromotionPoliciesPage() {
  return (
    <div>
      <PageHeader
        title="سياسات الترفيع والنجاح"
        description="ضبط سياسات النجاح والترفيع لكل صف دراسي على مستوى السنة"
      />
      <PromotionPoliciesPanel />
    </div>
  );
}
