import type { PromotionPolicy } from "@/types/academic";

export type TeacherProfile = {
  id: string;
  userId?: string;
  username?: string;
  generatedPassword?: string;
  name: string;
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
