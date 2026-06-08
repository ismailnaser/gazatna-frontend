import type {
  AdminStudent,
  ClassStudent,
  FinanceNotice,
  Grade,
  NewsItem,
  PaymentNotice,
  Student,
  SystemUser,
  TeacherClass,
} from "@/types";

export const mockStudent: Student = {
  id: "s1",
  name: "أحمد محمد الخالد",
  grade: "الصف العاشر",
  section: "أ",
  studentNumber: "2024-0156",
  feesPaid: true,
  paymentStatus: "approved",
  balance: { total: 2500, paid: 2000, remaining: 500 },
};

export const mockStudentUnpaid: Student = {
  ...mockStudent,
  id: "s2",
  name: "سارة علي حسن",
  feesPaid: false,
  paymentStatus: "pending",
  balance: { total: 2500, paid: 500, remaining: 2000 },
};

export const mockGrades: Grade[] = [
  { id: "g1", subject: "الرياضيات", score: 92, maxScore: 100, note: "أداء ممتاز" },
  { id: "g2", subject: "الفيزياء", score: 88, maxScore: 100 },
  { id: "g3", subject: "اللغة العربية", score: 95, maxScore: 100, note: "مشاركة فعّالة" },
  { id: "g4", subject: "اللغة الإنجليزية", score: 85, maxScore: 100 },
  { id: "g5", subject: "الكيمياء", score: 90, maxScore: 100 },
];

export const mockPaymentNotices: PaymentNotice[] = [
  { id: "p1", date: "2026-05-10", amount: 1000, status: "approved" },
  { id: "p2", date: "2026-04-15", amount: 1000, status: "approved" },
  { id: "p3", date: "2026-06-01", amount: 500, status: "pending", note: "قيد المراجعة" },
];

export const mockTeacherClasses: TeacherClass[] = [
  { id: "c1", name: "الصف العاشر - أ", studentCount: 28 },
  { id: "c2", name: "الصف الحادي عشر - ب", studentCount: 24 },
  { id: "c3", name: "الصف التاسع - أ", studentCount: 30 },
];

export const mockClassStudents: Record<string, ClassStudent[]> = {
  c1: [
    { id: "st1", name: "أحمد محمد الخالد", grade: 92, note: "ممتاز" },
    { id: "st2", name: "فاطمة يوسف", grade: 88, note: "" },
    { id: "st3", name: "محمد سعيد", grade: 75, note: "يحتاج متابعة" },
    { id: "st4", name: "ليلى أحمد", grade: 95, note: "" },
    { id: "st5", name: "عمر حسن", grade: 82, note: "" },
  ],
  c2: [
    { id: "st6", name: "نور الدين", grade: 90, note: "" },
    { id: "st7", name: "ريم خالد", grade: 87, note: "" },
  ],
  c3: [
    { id: "st8", name: "ياسين علي", grade: 78, note: "" },
    { id: "st9", name: "مريم سالم", grade: 91, note: "" },
  ],
};

export const mockAdminStudents: AdminStudent[] = [
  { id: "s1", name: "أحمد محمد الخالد", grade: "الصف العاشر", paymentStatus: "approved", documents: ["شهادة ميلاد", "هوية"] },
  { id: "s2", name: "سارة علي حسن", grade: "الصف التاسع", paymentStatus: "pending", documents: ["شهادة ميلاد"] },
  { id: "s3", name: "محمد سعيد", grade: "الصف الحادي عشر", paymentStatus: "approved", documents: ["شهادة ميلاد", "هوية", "صورة شخصية"] },
  { id: "s4", name: "ليلى أحمد", grade: "الصف العاشر", paymentStatus: "rejected", documents: ["شهادة ميلاد"] },
];

export const mockFinanceNotices: FinanceNotice[] = [
  { id: "f1", studentName: "سارة علي حسن", amount: 500, status: "pending", date: "2026-06-01" },
  { id: "f2", studentName: "ليلى أحمد", amount: 1000, status: "rejected", date: "2026-05-28" },
  { id: "f3", studentName: "محمد سعيد", amount: 1500, status: "approved", date: "2026-05-20" },
];

export const mockNews: NewsItem[] = [
  { id: "n1", title: "افتتاح معرض العلوم السنوي", body: "استضافت المدرسة معرض العلوم بمشاركة جميع المراحل.", date: "2026-05-15", gradient: "from-[#064E3B] to-[#0d6b4f]" },
  { id: "n2", title: "فريق الروبوتات يفوز بالمركز الأول", body: "حقق فريق الروبوتات إنجازاً وطنياً في المسابقة.", date: "2026-05-10", gradient: "from-[#881337] to-[#9f1239]" },
  { id: "n3", title: "برنامج القراءة الصيفي", body: "يبدأ البرنامج في أول يوليو لجميع المراحل.", date: "2026-06-01", gradient: "from-[#1a1a1a] to-[#404040]" },
];

export const mockUsers: SystemUser[] = [
  { id: "u1", name: "محمد الإداري", email: "admin@ghazatna.edu.ps", role: "admin", status: "active" },
  { id: "u2", name: "أحمد المعلم", email: "teacher@ghazatna.edu.ps", role: "teacher", status: "active" },
  { id: "u3", name: "خالد ولي الأمر", email: "parent@ghazatna.edu.ps", role: "parent", status: "active" },
];

export const adminAnalytics = {
  avgGrade: 87.5,
  feesCollected: 78,
  urgentTasks: [
    { id: "t1", text: "٣ إشعارات دفع تنتظر الموافقة", type: "finance" as const },
    { id: "t2", text: "طالبان جديدان ينتظران التفعيل", type: "students" as const },
  ],
  gradeChart: [
    { label: "التاسع", value: 82 },
    { label: "العاشر", value: 88 },
    { label: "الحادي عشر", value: 91 },
    { label: "الثاني عشر", value: 89 },
  ],
  feesChart: [
    { label: "يناير", value: 65 },
    { label: "فبراير", value: 72 },
    { label: "مارس", value: 80 },
    { label: "أبريل", value: 78 },
    { label: "مايو", value: 85 },
  ],
};

export const parentAlerts = [
  { id: "a1", text: "آخر دفعة معتمدة: ١٠٠٠ ₪ — ١٥ أبريل", type: "payment" },
  { id: "a2", text: "ملاحظة من معلم الرياضيات: أداء ممتاز", type: "note" },
  { id: "a3", text: "تمت إضافة علامة الفيزياء: ٨٨/١٠٠", type: "grade" },
];
