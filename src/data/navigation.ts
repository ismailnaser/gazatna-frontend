import type { UserRole } from "@/types";
import {
  BarChart3,
  BookOpen,
  CreditCard,
  FileText,
  GraduationCap,
  Home,
  Newspaper,
  Settings,
  Users,
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

export const dashboardNav: Record<UserRole, NavItem[]> = {
  parent: [
    { href: "/parent", label: "الرئيسية", icon: Home },
    { href: "/parent/grades", label: "النتائج", icon: BookOpen },
    { href: "/parent/fees", label: "المالية", icon: CreditCard },
  ],
  teacher: [
    { href: "/teacher", label: "فصولي", icon: GraduationCap },
    { href: "/teacher/profile", label: "سيرتي الذاتية", icon: FileText },
  ],
  admin: [
    { href: "/admin", label: "الرئيسية", icon: BarChart3 },
    { href: "/admin/students", label: "الطلاب", icon: Users },
    { href: "/admin/finance", label: "المالية", icon: CreditCard },
    { href: "/admin/content", label: "المحتوى", icon: Newspaper },
    { href: "/admin/teachers", label: "الكادر", icon: GraduationCap },
    { href: "/admin/users", label: "المستخدمون", icon: Settings },
  ],
};

export const roleLabels: Record<UserRole, string> = {
  admin: "مدير النظام",
  teacher: "معلم",
  parent: "ولي أمر",
};
