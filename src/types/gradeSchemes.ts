export type GradeSchemeComponent = {
  id: string;
  name: string;
  maxScore: number;
};

export type SubjectGradeScheme = {
  id: string;
  classId: string;
  className: string;
  subject: string;
  maxScore: number;
  components: GradeSchemeComponent[];
  updatedAt?: string | null;
  managedByAdmin?: boolean;
};

export type GradeSchemeEntry = {
  studentId: string;
  classId?: string;
  className?: string;
  name: string;
  studentNumber?: string;
  nationalId: string;
  scores: Record<string, number | string>;
  total: number | string;
};

export type GradeSchemeBundle = {
  availableSubjects: string[];
  scheme: SubjectGradeScheme | null;
  entries: GradeSchemeEntry[];
  classIds?: string[];
  subjects?: string[];
  academicContext?: {
    academicYear?: { name?: string } | null;
    currentTerm?: { name?: string } | null;
  };
};
