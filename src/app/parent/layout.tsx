import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell area="parent">{children}</DashboardShell>;
}
