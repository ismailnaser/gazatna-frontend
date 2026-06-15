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
};

export type SchoolClass = {
  id: string;
  name: string;
  gradeLevel?: string;
  section?: string;
  studentCount: number;
};

export type Subject = {
  id: string;
  name: string;
  teacherCount: number;
};
