import { AdminAccessGuard } from "@/components/admin/AdminAccessGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell area="admin">
      <AdminAccessGuard>{children}</AdminAccessGuard>
    </DashboardShell>
  );
}
