import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const revalidate = 300;

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell area="teacher">{children}</DashboardShell>;
}
