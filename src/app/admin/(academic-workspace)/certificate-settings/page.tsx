"use client";

import { PageHeader } from "@/components/molecules/PageHeader";
import { CertificateSettingsPanel } from "@/components/admin/academic/panels/CertificateSettingsPanel";

export default function AdminCertificateSettingsPage() {
  return (
    <div>
      <PageHeader
        title="إعدادات الشهادات"
        description="إعداد شهادات العلامات والتقدير، معاينتها، ونشرها للطلاب"
      />
      <CertificateSettingsPanel />
    </div>
  );
}
