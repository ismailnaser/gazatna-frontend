import type { LucideIcon } from "lucide-react";
import { GraduationCap, Star, Users } from "lucide-react";

export const navLinks = [
  { href: "#الرئيسية", label: "الرئيسية" },
  { href: "#من-نحن", label: "من نحن" },
  { href: "#البرامج", label: "البرامج" },
  { href: "#التسجيل", label: "التسجيل" },
  { href: "#تواصل", label: "تواصل" },
] as const;

export const newsItems = [
  {
    id: "1",
    title: "افتتاح معرض العلوم السنوي",
    image: "/news/science-fair.jpg",
    gradient: "from-violet-400 to-purple-600",
  },
  {
    id: "2",
    title: "فريق الروبوتات يفوز بالمركز الأول",
    image: "/news/robotics.jpg",
    gradient: "from-teal-400 to-cyan-600",
  },
  {
    id: "3",
    title: "برنامج القراءة الصيفي يبدأ قريباً",
    image: "/news/reading.jpg",
    gradient: "from-amber-300 to-orange-500",
  },
] as const;

export type StatItem = {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
};

export const stats: StatItem[] = [
  {
    id: "success",
    label: "نسبة النجاح",
    value: "٩٨٪",
    icon: Star,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  {
    id: "university",
    label: "القبول الجامعي",
    value: "٨٥٪",
    icon: GraduationCap,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    id: "teachers",
    label: "عدد المعلمين",
    value: "+٤٥",
    icon: Users,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
  },
];
