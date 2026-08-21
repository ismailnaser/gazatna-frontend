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
  Medal,
  Newspaper,
  Play,
  Scale,
  Settings,
  Settings2,
  Users,
  Archive,
  Flag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AdminNavGroup = "overview" | "people" | "academics" | "operations";

export const adminNavGroupLabels: Record<AdminNavGroup, string> = {
  overview: "نظرة عامة",
  people: "الأشخاص",
  academics: "الدراسة",
  operations: "التشغيل",
};

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  group: AdminNavGroup;
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

export type AdminAnalyticsTab = "students" | "grades" | "fees";

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
  admin_academics: "إدارة المواد والجداول والسنوات الدراسية وتحليلات نسب النجاح.",
  admin_finance: "إدارة المالية، تحليلات التحصيل، والتنبيهات (رسوم متأخرة).",
  admin_content: "إدارة محتوى الموقع، الأخبار، ورسائل التواصل.",
  admin_staff: "إدارة الكادر التعليمي وملفات المعلمين.",
};

const academicAdminNav: AdminNavItem[] = [
  { href: "/admin/academic-years", label: "السنوات الدراسية", icon: CalendarRange, group: "academics" },
  { href: "/admin/academic-terms", label: "الفصول الدراسية", icon: CalendarDays, group: "academics" },
  { href: "/admin/promotion-policies", label: "سياسات الترفيع", icon: Scale, group: "academics" },
  { href: "/admin/certificate-settings", label: "إعدادات الشهادات", icon: Medal, group: "academics" },
  { href: "/admin/term-end", label: "نهاية الفصل", icon: Flag, group: "academics" },
  { href: "/admin/year-end", label: "نهاية السنة", icon: Play, group: "academics" },
  { href: "/admin/academic-archive", label: "أرشيف السنوات", icon: Archive, group: "academics" },
];

const allAdminNav: AdminNavItem[] = [
  { href: "/admin", label: "الرئيسية", icon: BarChart3, group: "overview" },
  { href: "/admin/analytics", label: "التحليلات", icon: LineChart, group: "overview" },
  { href: "/admin/notifications", label: "التنبيهات", icon: Bell, group: "overview" },
  { href: "/admin/students", label: "الطلاب", icon: Users, group: "people" },
  { href: "/admin/admissions", label: "طلبات التسجيل", icon: ClipboardList, group: "people" },
  { href: "/admin/teachers", label: "الكادر", icon: GraduationCap, group: "people" },
  { href: "/admin/users", label: "المستخدمون", icon: Settings, group: "people" },
  { href: "/admin/classes", label: "المراحل الدراسية", icon: Layers, group: "academics" },
  ...academicAdminNav,
  { href: "/admin/schedules", label: "الجداول", icon: CalendarDays, group: "academics" },
  { href: "/admin/grade-schemes", label: "تقسيمة العلامات", icon: Layers, group: "academics" },
  { href: "/admin/subjects", label: "المواد", icon: BookMarked, group: "academics" },
  { href: "/admin/finance", label: "المالية", icon: CreditCard, group: "operations" },
  { href: "/admin/content", label: "المحتوى", icon: Newspaper, group: "operations" },
  { href: "/admin/messages", label: "رسائل التواصل", icon: Mail, group: "operations" },
  { href: "/admin/site", label: "إعدادات الموقع", icon: Settings2, group: "operations" },
];

const roleNavPaths: Record<AdminRole, string[]> = {
  admin: allAdminNav.map((item) => item.href),
  admin_students: [
    "/admin",
    "/admin/analytics",
    "/admin/students",
    "/admin/admissions",
    "/admin/schedules",
  ],
  admin_academics: [
    "/admin",
    "/admin/academic-years",
    "/admin/academic-terms",
    "/admin/promotion-policies",
    "/admin/certificate-settings",
    "/admin/term-end",
    "/admin/year-end",
    "/admin/academic-archive",
    "/admin/subjects",
    "/admin/grade-schemes",
    "/admin/schedules",
    "/admin/analytics",
  ],
  admin_finance: ["/admin", "/admin/finance", "/admin/notifications", "/admin/analytics"],
  admin_content: ["/admin", "/admin/content", "/admin/messages"],
  admin_staff: ["/admin", "/admin/teachers"],
};

const roleAnalyticsTabs: Record<AdminRole, AdminAnalyticsTab[]> = {
  admin: ["students", "grades", "fees"],
  admin_students: ["students"],
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
  return role === SUPER_ADMIN_ROLE;
}

export function getAdminNav(role: AdminRole): AdminNavItem[] {
  const allowed = new Set(roleNavPaths[role]);
  return allAdminNav.filter((item) => allowed.has(item.href));
}

export function groupAdminNav(items: AdminNavItem[]): Array<{
  id: AdminNavGroup;
  label: string;
  items: AdminNavItem[];
}> {
  const order: AdminNavGroup[] = ["overview", "people", "academics", "operations"];
  return order
    .map((id) => ({
      id,
      label: adminNavGroupLabels[id],
      items: items.filter((item) => item.group === id),
    }))
    .filter((group) => group.items.length > 0);
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
