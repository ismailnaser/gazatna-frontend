import {
  BarChart3,
  Bell,
  BookMarked,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  CreditCard,
  GraduationCap,
  Layers,
  LineChart,
  Mail,
  Newspaper,
  Settings,
  Settings2,
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

export type AdminAnalyticsTab = "grades" | "fees";

export const adminRoleLabels: Record<AdminRole, string> = {
  admin: "إدارة كلية",
  admin_students: "إدارة الطلاب",
  admin_academics: "إدارة الفصول والمواد",
  admin_finance: "إدارة المالية",
  admin_content: "إدارة المحتوى",
  admin_staff: "إدارة الكادر",
};

export const adminRoleDescriptions: Record<AdminRole, string> = {
  admin: "صلاحية كاملة — جميع أقسام الإدارة: المستخدمون، التحليلات، إعدادات الموقع، والتنبيهات.",
  admin_students: "إدارة الطلاب وطلبات التسجيل.",
  admin_academics: "إدارة الفصول والمواد وتحليلات نسب النجاح.",
  admin_finance: "إدارة المالية، تحليلات التحصيل، والتنبيهات (رسوم متأخرة).",
  admin_content: "إدارة محتوى الموقع، الأخبار، ورسائل التواصل.",
  admin_staff: "إدارة الكادر التعليمي وملفات المعلمين.",
};

const allAdminNav: NavItem[] = [
  { href: "/admin", label: "الرئيسية", icon: BarChart3 },
  { href: "/admin/analytics", label: "التحليلات", icon: LineChart },
  { href: "/admin/notifications", label: "التنبيهات", icon: Bell },
  { href: "/admin/students", label: "الطلاب", icon: Users },
  { href: "/admin/admissions", label: "طلبات التسجيل", icon: ClipboardList },
  { href: "/admin/classes", label: "الفصول", icon: Layers },
  { href: "/admin/academic-years", label: "السنوات الدراسية", icon: CalendarRange },
  { href: "/admin/schedules", label: "الجداول", icon: CalendarDays },
  { href: "/admin/subjects", label: "المواد", icon: BookMarked },
  { href: "/admin/finance", label: "المالية", icon: CreditCard },
  { href: "/admin/content", label: "المحتوى", icon: Newspaper },
  { href: "/admin/messages", label: "رسائل التواصل", icon: Mail },
  { href: "/admin/site", label: "إعدادات الموقع", icon: Settings2 },
  { href: "/admin/teachers", label: "الكادر", icon: GraduationCap },
  { href: "/admin/users", label: "المستخدمون", icon: Settings },
];

const roleNavPaths: Record<AdminRole, string[]> = {
  admin: allAdminNav.map((item) => item.href),
  admin_students: [
    "/admin",
    "/admin/students",
    "/admin/admissions",
    "/admin/schedules",
  ],
  admin_academics: ["/admin", "/admin/classes", "/admin/academic-years", "/admin/subjects", "/admin/schedules", "/admin/analytics"],
  admin_finance: ["/admin", "/admin/finance", "/admin/notifications", "/admin/analytics"],
  admin_content: ["/admin", "/admin/content", "/admin/messages"],
  admin_staff: ["/admin", "/admin/teachers"],
};

const roleAnalyticsTabs: Record<AdminRole, AdminAnalyticsTab[]> = {
  admin: ["grades", "fees"],
  admin_students: [],
  admin_academics: ["grades"],
  admin_finance: ["fees"],
  admin_content: [],
  admin_staff: [],
};

export function isAdminRole(role: string): role is AdminRole {
  return (ADMIN_ROLES as readonly string[]).includes(role);
}

export function isSuperAdmin(role: string): role is typeof SUPER_ADMIN_ROLE {
  return role === SUPER_ADMIN_ROLE;
}

export function canManageAdminClasses(role: AdminRole): boolean {
  return role === SUPER_ADMIN_ROLE || role === "admin_academics";
}

export function getAdminNav(role: AdminRole): NavItem[] {
  const allowed = new Set(roleNavPaths[role]);
  return allAdminNav.filter((item) => allowed.has(item.href));
}

export function canAccessAdminPath(role: AdminRole, pathname: string): boolean {
  const allowed = roleNavPaths[role];
  if (pathname === "/admin") return allowed.includes("/admin");
  return allowed.some((path) => {
    if (path === "/admin") return false;
    return pathname === path || pathname.startsWith(`${path}/`);
  });
}

export function canAccessAdminAnalyticsTab(role: AdminRole, tab: AdminAnalyticsTab): boolean {
  return roleAnalyticsTabs[role].includes(tab);
}

export function getAdminAnalyticsTabs(role: AdminRole): AdminAnalyticsTab[] {
  return roleAnalyticsTabs[role];
}

export const adminRoleOptions = ADMIN_ROLES.map((role) => ({
  value: role,
  label: adminRoleLabels[role],
}));
