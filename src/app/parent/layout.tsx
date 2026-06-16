import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ParentFeeGuard } from "@/components/parent/ParentFeeGuard";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell area="parent">
      <ParentFeeGuard>{children}</ParentFeeGuard>
    </DashboardShell>
  );
}
