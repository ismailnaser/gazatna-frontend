export type { UserRole, AdminRole } from "@/lib/adminRoles";
export { adminRoleLabels, isAdminRole } from "@/lib/adminRoles";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type PaymentStatus = "pending" | "approved" | "rejected";

export type Student = {
  id: string;
  name: string;
  grade: string;
  section: string;
  studentNumber: string;
  feesPaid: boolean;
  paymentStatus: PaymentStatus;
  balance: { total: number; paid: number; remaining: number };
};

export type Grade = {
  id: string;
  subject: string;
  score: number;
  maxScore: number;
  note?: string;
};

export type PaymentNotice = {
  id: string;
  date: string;
  amount: number;
  status: PaymentStatus;
  note?: string;
};

export type TeacherClass = {
  id: string;
  name: string;
  studentCount: number;
};

export type ClassStudent = {
  id: string;
  name: string;
  grade: number | "";
  note: string;
};

export type AssignmentStatus = "active" | "closed";

export type Homework = {
  id: string;
  classId: string;
  teacherId: string;
  title: string;
  description: string;
  dueDate: string;
  status: AssignmentStatus;
  createdAt: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

export type Quiz = {
  id: string;
  classId: string;
  teacherId: string;
  title: string;
  description: string;
  dueDate: string;
  startAt: string;
  durationMinutes: number;
  status: AssignmentStatus;
  questions: QuizQuestion[];
  createdAt: string;
};

export type HomeworkSubmission = {
  id: string;
  homeworkId: string;
  studentId: string;
  content: string;
  submittedAt: string;
};

export type QuizSubmission = {
  id: string;
  quizId: string;
  studentId: string;
  answers: number[];
  score: number;
  maxScore: number;
  submittedAt: string;
  timeSpentSeconds: number;
};

export type ParentChild = {
  parentUserId: string;
  studentId: string;
  classId: string;
  name: string;
};

export type AdminStudent = {
  id: string;
  name: string;
  grade: string;
  section?: string;
  classId?: string;
  studentNumber?: string;
  username?: string;
  generatedPassword?: string;
  paymentStatus: PaymentStatus;
  documents: string[];
};

export type AccountCredentials = {
  name: string;
  username: string;
  password: string;
  role: "teacher" | "parent";
};

export type FinanceNotice = {
  id: string;
  studentName: string;
  amount: number;
  status: PaymentStatus;
  date: string;
};

export type NewsItem = {
  id: string;
  title: string;
  body: string;
  date: string;
  gradient: string;
};

export type SystemUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive";
};
