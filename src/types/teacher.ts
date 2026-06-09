export type TeacherProfile = {
  id: string;
  userId?: string;
  name: string;
  subject: string;
  experience: string;
  bio: string;
  imageGradient: string;
};

export type SchoolClass = {
  id: string;
  name: string;
  studentCount: number;
};
