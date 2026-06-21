import type { UserRole } from "@/types";
import { getAdminNav, isAdminRole } from "@/lib/adminRoles";
import {
  BarChart3,
  Bell,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  ClipboardList,
  CreditCard,
  FileText,
  FolderOpen,
  GraduationCap,
  Home,
  PenLine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const publicNavLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/about", label: "من نحن" },
  { href: "/programs", label: "البرامج" },
  { href: "/faculty", label: "الكادر التعليمي" },
  { href: "/register", label: "التسجيل" },
  { href: "/contact", label: "تواصل" },
] as const;

const parentNav: NavItem[] = [
  { href: "/parent", label: "الرئيسية", icon: Home },
  { href: "/parent/subjects", label: "المواد المسندة", icon: BookMarked },
  { href: "/parent/homework", label: "محتوى المواد", icon: PenLine },
  { href: "/parent/assessments", label: "التقييمات", icon: BookOpenCheck },
  { href: "/parent/grades", label: "النتائج", icon: BookOpen },
  { href: "/parent/fees", label: "المالية", icon: CreditCard },
];

const teacherNav: NavItem[] = [
  { href: "/teacher", label: "فصولي", icon: GraduationCap },
  { href: "/teacher/homework", label: "الواجبات", icon: PenLine },
  { href: "/teacher/quizzes", label: "الاختبارات", icon: ClipboardList },
  { href: "/teacher/announcements", label: "الإعلانات", icon: Bell },
  { href: "/teacher/materials", label: "مرفقات المواد", icon: FolderOpen },
  { href: "/teacher/profile", label: "سيرتي الذاتية", icon: FileText },
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
