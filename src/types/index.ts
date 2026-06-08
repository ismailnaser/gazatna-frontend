export type UserRole = "admin" | "teacher" | "parent";

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

export type AdminStudent = {
  id: string;
  name: string;
  grade: string;
  paymentStatus: PaymentStatus;
  documents: string[];
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
  email: string;
  role: UserRole;
  status: "active" | "inactive";
};
