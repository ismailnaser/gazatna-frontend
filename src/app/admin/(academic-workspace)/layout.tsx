"use client";

import { AcademicAdminProvider } from "@/components/admin/academic/AcademicAdminContext";
import { AcademicAdminShell } from "@/components/admin/academic/AcademicAdminShell";

export default function AcademicWorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <AcademicAdminProvider>
      <AcademicAdminShell>{children}</AcademicAdminShell>
    </AcademicAdminProvider>
  );
}
