import type { UserRole } from "@/types";
import {
  adminNavGroupLabels,
  getAdminNav,
  isAdminRole,
  type AdminNavGroup,
} from "@/lib/adminRoles";
import {
  Bell,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  FolderOpen,
  GraduationCap,
  Home,
  Medal,
  Archive,
  FolderArchive,
  PenLine,
  Phone,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type DashboardNavGroup =
  | AdminNavGroup
  | "teaching"
  | "records"
  | "study"
  | "documents"
  | "finance";

export const dashboardNavGroupLabels: Record<DashboardNavGroup, string> = {
  ...adminNavGroupLabels,
  teaching: "التدريس",
  records: "السجلات",
  study: "عالمي الدراسي",
  documents: "الوثائق",
  finance: "المالية",
};

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  group?: DashboardNavGroup;
};

const NAV_GROUP_ORDER: DashboardNavGroup[] = [
  "overview",
  "people",
  "academics",
  "operations",
  "teaching",
  "records",
  "study",
  "documents",
  "finance",
];

export function groupDashboardNav(items: NavItem[]): Array<{
  id: DashboardNavGroup;
  label: string;
  items: NavItem[];
}> | null {
  if (!items.some((item) => item.group)) return null;
  return NAV_GROUP_ORDER.map((id) => ({
    id,
    label: dashboardNavGroupLabels[id],
    items: items.filter((item) => item.group === id),
  })).filter((group) => group.items.length > 0);
}

export const publicNavLinks = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/about", label: "من نحن", icon: Sparkles },
  { href: "/programs", label: "البرامج", icon: BookOpen },
  { href: "/faculty", label: "الكادر التعليمي", icon: GraduationCap },
  { href: "/register", label: "التسجيل", icon: ClipboardList },
  { href: "/contact", label: "تواصل", icon: Phone },
] as const;

const parentNav: NavItem[] = [
  { href: "/parent", label: "الرئيسية", icon: Home, group: "overview" },
  { href: "/parent/subjects", label: "موادي", icon: BookMarked, group: "study" },
  { href: "/parent/homework", label: "مهام المغامرة", icon: PenLine, group: "study" },
  { href: "/parent/assessments", label: "التقييمات", icon: BookOpenCheck, group: "study" },
  { href: "/parent/grades", label: "العلامات", icon: BookOpen, group: "study" },
  { href: "/parent/schedules", label: "الجداول", icon: CalendarDays, group: "study" },
  { href: "/parent/certificates", label: "الشهادات", icon: Medal, group: "documents" },
  { href: "/parent/certificate-archive", label: "أرشيف الشهادات", icon: FolderArchive, group: "documents" },
  { href: "/parent/archive", label: "أرشيف السنوات السابقة", icon: Archive, group: "documents" },
  { href: "/parent/fees", label: "المالية", icon: CreditCard, group: "finance" },
];

const teacherNav: NavItem[] = [
  { href: "/teacher", label: "فصولي", icon: GraduationCap, group: "overview" },
  { href: "/teacher/homework", label: "الواجبات", icon: PenLine, group: "teaching" },
  { href: "/teacher/quizzes", label: "الاختبارات", icon: ClipboardList, group: "teaching" },
  { href: "/teacher/grade-entry", label: "التقييمات والعلامات", icon: BookOpenCheck, group: "teaching" },
  { href: "/teacher/announcements", label: "الإعلانات", icon: Bell, group: "teaching" },
  { href: "/teacher/materials", label: "مرفقات المواد", icon: FolderOpen, group: "teaching" },
  { href: "/teacher/schedules", label: "جدول حصصي", icon: CalendarDays, group: "records" },
  { href: "/teacher/archive", label: "أرشيف السنوات السابقة", icon: Archive, group: "records" },
  { href: "/teacher/profile", label: "سيرتي الذاتية", icon: FileText, group: "records" },
];

export const roleLabels: Record<UserRole, string> = {
  admin: "إدارة كلية",
  admin_students: "إدارة الطلاب",
  admin_academics: "إدارة الفصول والمواد",
  admin_finance: "إدارة المالية",
  admin_content: "إدارة المحتوى",
  admin_staff: "إدارة الكادر",
  teacher: "معلم",
  parent: "ولي أمر / طالب",
};

export function getDashboardNav(role: UserRole): NavItem[] {
  if (isAdminRole(role)) return getAdminNav(role);
  if (role === "teacher") return teacherNav;
  return parentNav;
}

/** @deprecated استخدم getDashboardNav */
export const dashboardNav = {
  parent: parentNav,
  teacher: teacherNav,
  admin: getAdminNav("admin"),
};
