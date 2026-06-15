import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell area="teacher">{children}</DashboardShell>;
}
