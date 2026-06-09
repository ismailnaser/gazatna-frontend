import type { LucideIcon } from "lucide-react";
import { GraduationCap, Star, Users } from "lucide-react";

export type NewsCategory = "أخبار" | "فعاليات" | "إنجازات";

export type NewsItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  category: NewsCategory;
  gradient: string;
  featured?: boolean;
};

export const newsFilters = ["الكل", "أخبار", "فعاليات", "إنجازات"] as const;
export type NewsFilter = (typeof newsFilters)[number];

export const newsItems: NewsItem[] = [
  {
    id: "3",
    title: "برنامج القراءة الصيفي يبدأ قريباً",
    description:
      "يبدأ برنامج القراءة الصيفي في أول يوليو لجميع المراحل الدراسية، بهدف تعزيز مهارات القراءة والتعلم الذاتي خلال العطلة.",
    date: "٢٠ يونيو ٢٠٢٦",
    category: "أخبار",
    gradient: "from-[#064E3B] to-[#0d6b4f]",
    featured: true,
  },
  {
    id: "2",
    title: "فريق الروبوتات يفوز بالمركز الأول",
    description: "حقق فريق الروبوتات إنجازاً وطنياً في المسابقة.",
    date: "١٠ مايو ٢٠٢٦",
    category: "إنجازات",
    gradient: "from-[#881337] to-[#9f1239]",
  },
  {
    id: "1",
    title: "افتتاح معرض العلوم السنوي",
    description: "استضافت المدرسة معرض العلوم بمشاركة جميع المراحل.",
    date: "١٥ مايو ٢٠٢٦",
    category: "فعاليات",
    gradient: "from-[#1a1a1a] to-[#404040]",
  },
];

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
