import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="parent">{children}</DashboardShell>;
}
