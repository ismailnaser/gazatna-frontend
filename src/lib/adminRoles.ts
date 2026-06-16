import {
  BarChart3,
  BookMarked,
  ClipboardList,
  CreditCard,
  GraduationCap,
  Layers,
  Mail,
  Newspaper,
  Settings,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const SUPER_ADMIN_ROLE = "admin" as const;

export const ADMIN_ROLES = [
  SUPER_ADMIN_ROLE,
  "admin_students",
  "admin_academics",
  "admin_finance",
  "admin_content",
  "admin_staff",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export type UserRole = AdminRole | "teacher" | "parent";

export const adminRoleLabels: Record<AdminRole, string> = {
  admin: "إدارة كلية",
  admin_students: "إدارة الطلاب",
  admin_academics: "إدارة الفصول والمواد",
  admin_finance: "إدارة المالية",
  admin_content: "إدارة المحتوى",
  admin_staff: "إدارة الكادر",
};

const allAdminNav: NavItem[] = [
  { href: "/admin", label: "الرئيسية", icon: BarChart3 },
  { href: "/admin/students", label: "الطلاب", icon: Users },
  { href: "/admin/admissions", label: "طلبات التسجيل", icon: ClipboardList },
  { href: "/admin/classes", label: "الفصول", icon: Layers },
  { href: "/admin/subjects", label: "المواد", icon: BookMarked },
  { href: "/admin/finance", label: "المالية", icon: CreditCard },
  { href: "/admin/content", label: "المحتوى", icon: Newspaper },
  { href: "/admin/messages", label: "رسائل التواصل", icon: Mail },
  { href: "/admin/teachers", label: "الكادر", icon: GraduationCap },
  { href: "/admin/users", label: "المستخدمون", icon: Settings },
];

const roleNavPaths: Record<AdminRole, string[]> = {
  admin: allAdminNav.map((item) => item.href),
  admin_students: ["/admin", "/admin/students", "/admin/admissions", "/admin/notifications"],
  admin_academics: ["/admin", "/admin/classes", "/admin/subjects"],
  admin_finance: ["/admin", "/admin/finance", "/admin/notifications"],
  admin_content: ["/admin", "/admin/content", "/admin/messages"],
  admin_staff: ["/admin", "/admin/teachers"],
};

export function isAdminRole(role: string): role is AdminRole {
  return (ADMIN_ROLES as readonly string[]).includes(role);
}

export function getAdminNav(role: AdminRole): NavItem[] {
  const allowed = new Set(roleNavPaths[role]);
  return allAdminNav.filter((item) => allowed.has(item.href));
}

export function canAccessAdminPath(role: AdminRole, pathname: string): boolean {
  const allowed = roleNavPaths[role];
  if (pathname === "/admin") return allowed.includes("/admin");
  return allowed.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export const adminRoleOptions = ADMIN_ROLES.map((role) => ({
  value: role,
  label: adminRoleLabels[role],
}));
