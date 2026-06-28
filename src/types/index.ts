export type { UserRole, AdminRole } from "@/lib/adminRoles";
export { adminRoleLabels, isAdminRole } from "@/lib/adminRoles";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type PaymentStatus = "unpaid" | "pending" | "approved" | "rejected";

export type Student = {
  id: string;
  name: string;
  grade: string;
  section: string;
  studentNumber: string;
  nationalId?: string;
  feesPaid: boolean;
  paymentStatus: PaymentStatus;
  balance: { total: number; paid: number; remaining: number };
};

export type GradeComponent = {
  id: string;
  name: string;
  score: number | null;
  maxScore: number;
  passScore: number;
  passed: boolean | null;
};

export type Grade = {
  id: string;
  subject: string;
  score: number | null;
  maxScore: number;
  passScore: number;
  passed: boolean | null;
  note?: string;
  components?: GradeComponent[];
};

export type PaymentNotice = {
  id: string;
  date: string;
  declaredAmount?: number;
  amount: number;
  status: PaymentStatus;
  note?: string;
  receiptUrl?: string | null;
};

export type TeacherClass = {
  id: string;
  name: string;
  studentCount: number;
};

export type ClassStudent = {
  id: string;
  name: string;
  nationalId?: string;
  grade: number | "";
  note: string;
};

export type AssignmentStatus = "active" | "closed";
export type HomeworkWindowStatus = "scheduled" | "active" | "ended" | "closed";

export type HomeworkAttachmentItem = {
  id: string;
  url: string;
  name: string;
};

export type Homework = {
  id: string;
  classId: string;
  teacherId: string;
  subject?: string;
  title: string;
  description: string;
  dueDate: string;
  startAt?: string;
  endAt?: string;
  gradesVisible?: boolean;
  maxScore?: number;
  attachments?: HomeworkAttachmentItem[];
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  className?: string;
  teacherName?: string;
  windowStatus?: HomeworkWindowStatus;
  submissionCount?: number;
  groupId?: string;
  status: AssignmentStatus;
  createdAt: string;
};

export type QuestionType = "choice" | "true_false" | "essay" | "term" | "matching";

export type MatchingPair = {
  left: string;
  right?: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  questionType: QuestionType;
  options: string[];
  correctIndex?: number | null;
  correctText?: string;
  pairs?: MatchingPair[];
  points: number;
};

export type Quiz = {
  id: string;
  groupId?: string;
  classId: string;
  className?: string;
  teacherId: string;
  subject?: string;
  title: string;
  description: string;
  dueDate: string;
  startAt: string;
  endAt?: string | null;
  durationMinutes: number;
  maxAttempts?: number;
  attemptCount?: number;
  attemptsRemaining?: number;
  canRetake?: boolean;
  gradesVisible?: boolean;
  reviewAllowed?: boolean;
  maxScore?: number;
  windowStatus?: "scheduled" | "active" | "ended" | "closed";
  submissionCount?: number;
  status: AssignmentStatus;
  questions: QuizQuestion[];
  createdAt: string;
};

export type ParentAssessmentItem = {
  id: string;
  kind: "homework" | "quiz";
  refId: string;
  title: string;
  subject: string;
  score: number;
  maxScore: number;
  teacherNote: string;
  at?: string | null;
};

export type HomeworkSubmission = {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName?: string;
  homeworkTitle?: string;
  homeworkSubject?: string;
  className?: string;
  content: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  score?: number | null;
  maxScore?: number;
  teacherNote?: string;
  gradesVisible?: boolean;
  submittedAt: string;
  gradedAt?: string | null;
};

export type HomeworkSubjectGroup = {
  subject: string;
  teacherName: string;
  homework: Homework[];
};

export type ParentSubjectSummary = {
  subject: string;
  teacherName?: string;
  homeworkCount: number;
  quizCount: number;
  announcementCount?: number;
  materialCount?: number;
  totalCount: number;
  latestAt?: string | null;
};

export type SubjectAnnouncement = {
  id: string;
  groupId?: string;
  classId: string;
  className?: string;
  teacherId: string;
  teacherName?: string;
  subject?: string;
  title: string;
  body: string;
  createdAt: string;
};

export type MaterialCategory = "book" | "slides" | "resources" | "other";

export type SubjectMaterial = {
  id: string;
  groupId?: string;
  classId: string;
  className?: string;
  teacherId: string;
  teacherName?: string;
  subject?: string;
  title: string;
  description?: string;
  category: MaterialCategory;
  categoryLabel?: string;
  attachments?: HomeworkAttachmentItem[];
  createdAt: string;
};

export type ParentSubjectItem =
  | { kind: "homework"; createdAt: string; homework: Homework }
  | { kind: "quiz"; createdAt: string; quiz: Quiz }
  | { kind: "announcement"; createdAt: string; announcement: SubjectAnnouncement }
  | { kind: "material"; createdAt: string; material: SubjectMaterial };

export type ParentSubjectDetail = {
  subject: string;
  teacherName: string;
  items: ParentSubjectItem[];
};

export type TeacherAlert = {
  id: string;
  submissionId: string;
  type: "homework_submission" | "quiz_submission";
  text: string;
  homeworkId?: string;
  quizId?: string;
  groupId?: string;
  homeworkTitle?: string;
  quizTitle?: string;
  studentName: string;
  className: string;
  submittedAt: string;
  graded: boolean;
  needsGrading: boolean;
  opened?: boolean;
};

/** @deprecated استخدم TeacherAlert */
export type TeacherHomeworkAlert = TeacherAlert;

export type ParentAlert = {
  id: string;
  text: string;
  type: string;
  homeworkId?: string;
  quizId?: string;
  announcementId?: string;
  materialId?: string;
  subject?: string;
};

export type TeacherAssessmentItem = {
  groupId: string;
  homework: Homework;
  targets: Array<{
    id: string;
    classId: string;
    className: string;
    submissionCount: number;
  }>;
  submissions: HomeworkSubmission[];
};

export type TeacherQuizGradingItem = {
  groupId: string;
  overviewQuizId?: string;
  quiz: Quiz;
  targets: Array<{
    id: string;
    classId: string;
    className: string;
    submissionCount: number;
  }>;
  submissions: QuizSubmission[];
};

export type QuizAnswerAttachment = {
  id: string;
  questionId: string;
  url: string;
  name: string;
};

export type QuizSubmission = {
  id: string;
  quizId: string;
  studentId: string;
  studentName?: string;
  className?: string;
  answers: unknown[];
  answerAttachments?: QuizAnswerAttachment[];
  autoScore?: number;
  manualScores?: Record<string, number>;
  score: number | null;
  maxScore: number;
  teacherNote?: string;
  gradedAt?: string | null;
  fullyGraded?: boolean;
  needsManualGrading?: boolean;
  gradesVisible?: boolean;
  submittedAt: string;
  timeSpentSeconds: number;
  attemptNumber?: number;
  isBestAttempt?: boolean;
  attemptsRemaining?: number;
  attemptsUsed?: number;
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
  nationalId?: string;
  username?: string;
  generatedPassword?: string;
  paymentStatus: PaymentStatus;
  balance?: { total: number; paid: number; remaining: number };
  documents: Array<{ id?: string | null; name: string; url?: string | null }>;
  isActive: boolean;
};

export type AccountCredentials = {
  name: string;
  username: string;
  password: string;
  role: "teacher" | "parent" | "admin";
};

export type { FeePlan, FeeStatus, FeeInstallmentItem, FinanceNotice } from "@/types/finance";
export { mapFeePlan, mapFinanceNotice, mapFeeStatus } from "@/types/finance";

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
