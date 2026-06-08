import type { LucideIcon } from "lucide-react";
import { GraduationCap, Star, Users } from "lucide-react";

export const newsItems = [
  {
    id: "1",
    title: "افتتاح معرض العلوم السنوي",
    image: "/news/science-fair.jpg",
    gradient: "from-[#064E3B] to-[#0d6b4f]",
  },
  {
    id: "2",
    title: "فريق الروبوتات يفوز بالمركز الأول",
    image: "/news/robotics.jpg",
    gradient: "from-[#881337] to-[#9f1239]",
  },
  {
    id: "3",
    title: "برنامج القراءة الصيفي يبدأ قريباً",
    image: "/news/reading.jpg",
    gradient: "from-[#1a1a1a] to-[#404040]",
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
    iconBg: "bg-p-red/10",
    iconColor: "text-p-red",
  },
  {
    id: "university",
    label: "القبول الجامعي",
    value: "٨٥٪",
    icon: GraduationCap,
    iconBg: "bg-p-green/10",
    iconColor: "text-p-green",
  },
  {
    id: "teachers",
    label: "عدد المعلمين",
    value: "+٤٥",
    icon: Users,
    iconBg: "bg-p-green/10",
    iconColor: "text-p-green",
  },
];
