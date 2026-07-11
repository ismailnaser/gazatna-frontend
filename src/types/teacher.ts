import type { PromotionPolicy } from "@/types/academic";
import type { StaffGender, StaffMaritalStatus } from "@/lib/staffProfile";

export type StaffType = {
  id: string;
  name: string;
  isTeacher: boolean;
  sortOrder?: number;
};

export type TeacherProfile = {
  id: string;
  userId?: string;
  username?: string;
  generatedPassword?: string;
  staffTypeId?: string;
  staffTypeName?: string;
  isTeacher?: boolean;
  name: string;
  nameEn?: string;
  nationalId?: string;
  dateOfBirth?: string | null;
  age?: number | null;
  gender?: StaffGender;
  maritalStatus?: StaffMaritalStatus;
  mobile?: string;
  altMobile?: string;
  address?: string;
  joinDate?: string | null;
  notes?: string;
  subject: string;
  subjects?: string[];
  subjectIds?: string[];
  experience: string;
  bio: string;
  imageGradient: string;
  imageUrl?: string | null;
  classIds?: string[];
  teachingClasses?: SchoolClass[];
  teachableClassIds?: string[];
  subjectClassIds?: Record<string, string[]>;
  homeroomClassId?: string | null;
  homeroomClassName?: string | null;
  status?: "active" | "inactive";
};

export type SchoolClass = {
  id: string;
  name: string;
  gradeLevel?: string;
  section?: string;
  studentCount: number;
  homeroomTeacherId?: string | null;
  homeroomTeacherName?: string | null;
};

export type Grade = {
  id: string;
  name: string;
  sectionsCount: number;
  sortOrder?: number;
  promotionPolicy?: PromotionPolicy | null;
};

export type Subject = {
  id: string;
  name: string;
  teacherCount: number;
  classIds?: string[];
};
