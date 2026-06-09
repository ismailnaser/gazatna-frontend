import type { SchoolClass, TeacherProfile } from "@/types/teacher";

export const schoolClasses: SchoolClass[] = [
  { id: "c1", name: "الصف العاشر - أ", studentCount: 28 },
  { id: "c2", name: "الصف الحادي عشر - ب", studentCount: 24 },
  { id: "c3", name: "الصف التاسع - أ", studentCount: 30 },
  { id: "c4", name: "الصف الثامن - ب", studentCount: 26 },
];

export const initialTeachers: TeacherProfile[] = [
  {
    id: "t1",
    userId: "u2",
    name: "أحمد المعلم",
    subject: "الرياضيات",
    experience: "٨ سنوات في تدريس الرياضيات للمرحلة الثانوية",
    bio: "متخصص في تبسيط المفاهيم الرياضية وبناء مهارات التفكير التحليلي لدى الطلاب. حاصل على ماجستير في تعليم الرياضيات.",
    imageGradient: "from-[#064E3B] to-[#0d6b4f]",
  },
  {
    id: "t2",
    name: "د. سامي الحسيني",
    subject: "الرياضيات",
    experience: "١٢ سنة خبرة أكاديمية",
    bio: "يركز على ربط الرياضيات بالحياة اليومية وإعداد الطلاب للامتحانات الوطنية بأسلوب تفاعلي.",
    imageGradient: "from-[#881337] to-[#9f1239]",
  },
  {
    id: "t3",
    name: "أ. نورا أبو بكر",
    subject: "اللغة العربية",
    experience: "٨ سنوات في تعليم اللغة والأدب",
    bio: "شغوفة بتنمية مهارات القراءة والكتابة والتعبير الإبداعي، مع خبرة في تنظيم مسابقات الإلقاء والشعر.",
    imageGradient: "from-[#1a1a1a] to-[#404040]",
  },
  {
    id: "t4",
    name: "م. يوسف العمري",
    subject: "الفيزياء والروبوتات",
    experience: "١٠ سنوات — مدرب فريق الروبوتات المدرسي",
    bio: "يجمع بين الفيزياء النظرية والتطبيق العملي عبر مختبرات الروبوتات والمشاريع العلمية.",
    imageGradient: "from-[#064E3B] to-[#0d6b4f]",
  },
  {
    id: "t5",
    name: "أ. لينا محمود",
    subject: "اللغة الإنجليزية",
    experience: "٦ سنوات في التدريس والترجمة",
    bio: "تعتمد أسلوب التعلم التفاعلي لتعزيز المحادثة والكتابة الأكاديمية باللغة الإنجليزية.",
    imageGradient: "from-[#881337] to-[#9f1239]",
  },
];

export const initialAssignments: Record<string, string[]> = {
  t1: ["c1", "c2"],
  t2: ["c3"],
  t4: ["c4"],
};
