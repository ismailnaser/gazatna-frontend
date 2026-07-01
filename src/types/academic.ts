export type AcademicTermStatus = {
  id: string;
  academicYearId: string;
  name: string;
  displayName?: string;
  sortOrder: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isClosed: boolean;
  closedAt: string | null;
};

export type PromotionPolicy = {
  gradeId?: string | null;
  evaluationScope: "single_term" | "full_year";
  yearCalculationMethod:
    | "term_average"
    | "year_total"
    | "per_term_combine"
    | "single_term_only";
  evaluationTermId: string | null;
  passRule: "all_subjects" | "minimum_count";
  passMinimumCount: number;
  requiredSubjects: string[];
  passScoreRatio: number;
  passPromotionMode: "automatic" | "manual";
  failHandlingMode: "repeat_auto" | "manual_review";
  isConfigured?: boolean;
  updatedAt?: string | null;
};

export type AcademicYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "draft" | "active" | "archived";
  isActive: boolean;
  terms: AcademicTermStatus[];
  currentTermId: string | null;
  createdAt?: string | null;
};

export type AcademicContext = {
  academicYear: AcademicYear | null;
  currentTerm: AcademicTermStatus | null;
};

export function mapAcademicTerm(raw: Record<string, unknown>): AcademicTermStatus {
  return {
    id: String(raw.id),
    academicYearId: String(raw.academicYearId),
    name: String(raw.name),
    displayName: raw.displayName ? String(raw.displayName) : undefined,
    sortOrder: Number(raw.sortOrder ?? 1),
    startDate: String(raw.startDate),
    endDate: String(raw.endDate),
    isCurrent: Boolean(raw.isCurrent),
    isClosed: Boolean(raw.isClosed),
    closedAt: raw.closedAt ? String(raw.closedAt) : null,
  };
}

export function mapPromotionPolicy(raw: Record<string, unknown>): PromotionPolicy {
  return {
    gradeId: raw.gradeId ? String(raw.gradeId) : null,
    evaluationScope: (raw.evaluationScope as PromotionPolicy["evaluationScope"]) ?? "single_term",
    yearCalculationMethod:
      (raw.yearCalculationMethod as PromotionPolicy["yearCalculationMethod"]) ?? "term_average",
    evaluationTermId: raw.evaluationTermId ? String(raw.evaluationTermId) : null,
    passRule: (raw.passRule as PromotionPolicy["passRule"]) ?? "minimum_count",
    passMinimumCount: Number(raw.passMinimumCount ?? 1),
    requiredSubjects: Array.isArray(raw.requiredSubjects)
      ? raw.requiredSubjects.map((item) => String(item))
      : [],
    passScoreRatio: Number(raw.passScoreRatio ?? 0.5),
    passPromotionMode:
      (raw.passPromotionMode as PromotionPolicy["passPromotionMode"]) ?? "automatic",
    failHandlingMode:
      (raw.failHandlingMode as PromotionPolicy["failHandlingMode"]) ?? "manual_review",
    isConfigured: Boolean(raw.isConfigured),
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : null,
  };
}

export function mapAcademicYear(raw: Record<string, unknown>): AcademicYear {
  return {
    id: String(raw.id),
    name: String(raw.name),
    startDate: String(raw.startDate),
    endDate: String(raw.endDate),
    status: (raw.status as AcademicYear["status"]) ?? "draft",
    isActive: Boolean(raw.isActive),
    terms: Array.isArray(raw.terms)
      ? raw.terms.map((item) => mapAcademicTerm(item as Record<string, unknown>))
      : [],
    currentTermId: raw.currentTermId ? String(raw.currentTermId) : null,
    createdAt: raw.createdAt ? String(raw.createdAt) : null,
  };
}

export function mapAcademicContext(raw: Record<string, unknown>): AcademicContext {
  return {
    academicYear: raw.academicYear
      ? mapAcademicYear(raw.academicYear as Record<string, unknown>)
      : null,
    currentTerm: raw.currentTerm
      ? mapAcademicTerm(raw.currentTerm as Record<string, unknown>)
      : null,
  };
}

export const evaluationScopeLabels: Record<PromotionPolicy["evaluationScope"], string> = {
  single_term: "فصل واحد",
  full_year: "السنة كاملة",
};

export const yearCalculationLabels: Record<PromotionPolicy["yearCalculationMethod"], string> = {
  term_average: "متوسط الفصلين",
  year_total: "مجموع السنة",
  per_term_combine: "كل فصل على حدة ثم يُجمع القرار",
  single_term_only: "فصل واحد محدد",
};

export const passRuleLabels: Record<PromotionPolicy["passRule"], string> = {
  all_subjects: "جميع المواد",
  minimum_count: "عدد محدد من المواد",
};

export const promotionModeLabels: Record<PromotionPolicy["passPromotionMode"], string> = {
  automatic: "تلقائي",
  manual: "يدوي",
};

export const failureModeLabels: Record<PromotionPolicy["failHandlingMode"], string> = {
  repeat_auto: "إعادة تلقائية",
  manual_review: "اعتماد يدوي",
};

export type PromotionStudentAction = "promote" | "repeat" | "graduate" | "pending";

export type PromotionPreviewStudent = {
  studentId: string;
  name: string;
  studentNumber: string;
  currentGrade: string;
  currentSection: string;
  yearPassed: boolean;
  passedSubjectsCount: number;
  totalSubjectsCount: number;
  subjects: Array<{
    subject: string;
    score: number;
    maxScore: number;
    passScore: number;
    passed: boolean;
  }>;
  suggestedAction: string;
  finalAction: PromotionStudentAction;
  proposedGrade: string;
  needsReview: boolean;
  overrideAction?: string | null;
};

export type PromotionPreview = {
  scope?: "term" | "year";
  academicYearId: string;
  academicYearName: string;
  termId?: string | null;
  termName?: string | null;
  nextTermId?: string | null;
  nextTermName?: string | null;
  nextTermActivatesImmediately?: boolean;
  nextTermStartDate?: string | null;
  summary: {
    promote: number;
    repeat: number;
    graduate: number;
    pending: number;
    passed: number;
    failed: number;
  };
  students: PromotionPreviewStudent[];
};

export function mapPromotionPreview(raw: Record<string, unknown>): PromotionPreview {
  const summary = (raw.summary as Record<string, unknown>) ?? {};
  return {
    scope: (raw.scope as PromotionPreview["scope"]) ?? "year",
    academicYearId: String(raw.academicYearId ?? ""),
    academicYearName: String(raw.academicYearName ?? ""),
    termId: raw.termId ? String(raw.termId) : null,
    termName: raw.termName ? String(raw.termName) : null,
    nextTermId: raw.nextTermId ? String(raw.nextTermId) : null,
    nextTermName: raw.nextTermName ? String(raw.nextTermName) : null,
    nextTermActivatesImmediately:
      raw.nextTermActivatesImmediately === undefined
        ? undefined
        : Boolean(raw.nextTermActivatesImmediately),
    nextTermStartDate: raw.nextTermStartDate ? String(raw.nextTermStartDate) : null,
    summary: {
      promote: Number(summary.promote ?? 0),
      repeat: Number(summary.repeat ?? 0),
      graduate: Number(summary.graduate ?? 0),
      pending: Number(summary.pending ?? 0),
      passed: Number(summary.passed ?? 0),
      failed: Number(summary.failed ?? 0),
    },
    students: Array.isArray(raw.students)
      ? raw.students.map((item) => {
          const row = item as Record<string, unknown>;
          return {
            studentId: String(row.studentId),
            name: String(row.name),
            studentNumber: String(row.studentNumber ?? ""),
            currentGrade: String(row.currentGrade ?? ""),
            currentSection: String(row.currentSection ?? ""),
            yearPassed: Boolean(row.yearPassed),
            passedSubjectsCount: Number(row.passedSubjectsCount ?? 0),
            totalSubjectsCount: Number(row.totalSubjectsCount ?? 0),
            subjects: Array.isArray(row.subjects)
              ? row.subjects.map((subject) => {
                  const s = subject as Record<string, unknown>;
                  return {
                    subject: String(s.subject),
                    score: Number(s.score ?? 0),
                    maxScore: Number(s.maxScore ?? 0),
                    passScore: Number(s.passScore ?? 0),
                    passed: Boolean(s.passed),
                  };
                })
              : [],
            suggestedAction: String(row.suggestedAction ?? ""),
            finalAction: (row.finalAction as PromotionStudentAction) ?? "pending",
            proposedGrade: String(row.proposedGrade ?? ""),
            needsReview: Boolean(row.needsReview),
            overrideAction: row.overrideAction ? String(row.overrideAction) : null,
          };
        })
      : [],
  };
}

export const promotionActionLabels: Record<Exclude<PromotionStudentAction, "pending">, string> = {
  promote: "ترفيع",
  repeat: "إعادة الصف",
  graduate: "تخرّج",
};

export type CertificateIssuanceScope = "term" | "year";

export type CertificateConfig = {
  academicYearId: string;
  issuanceScope: CertificateIssuanceScope;
  isPublished: boolean;
  publishedAt: string | null;
  isTermPublished?: boolean;
  termPublishedAt?: string | null;
  isYearPublished?: boolean;
  yearPublishedAt?: string | null;
  publishedTermId: string | null;
  honorsEnabled: boolean;
  honorsMinAverage: number;
  honorsTitle: string;
  honorsMessage: string;
  certificateTitle: string;
  updatedAt: string | null;
};

export type PublishedCertificate = {
  scope: CertificateIssuanceScope;
  scopeLabel: string;
  academicYearId?: string;
  academicYearName?: string;
  honorsTitle?: string;
  visibleUntil?: string;
  archiveAfterGrace?: boolean;
  config?: CertificateConfig;
  certificate: StudentCertificate;
};

export type StudentCertificateSubject = {
  subject: string;
  score: number | null;
  maxScore: number | null;
  percent: number | null;
  hasGrade: boolean;
};

export type StudentCertificate = {
  studentId: string;
  studentName: string;
  studentNumber: string;
  gradeLevel: string;
  section: string;
  periodLabel: string;
  subjects: StudentCertificateSubject[];
  gradedSubjectsCount: number;
  assignedSubjectsCount: number;
  averagePercent: number | null;
  qualifiesHonors: boolean;
  honorsMinAverage: number;
};

export type ParentCertificatesResponse = {
  published: boolean;
  message: string;
  config: CertificateConfig | null;
  certificate: StudentCertificate | null;
  certificates: PublishedCertificate[];
};

export function mapCertificateConfig(raw: Record<string, unknown>): CertificateConfig {
  return {
    academicYearId: String(raw.academicYearId ?? ""),
    issuanceScope: (raw.issuanceScope as CertificateIssuanceScope) ?? "term",
    isPublished: Boolean(raw.isPublished),
    publishedAt: raw.publishedAt ? String(raw.publishedAt) : null,
    isTermPublished: Boolean(raw.isTermPublished),
    termPublishedAt: raw.termPublishedAt ? String(raw.termPublishedAt) : null,
    isYearPublished: Boolean(raw.isYearPublished),
    yearPublishedAt: raw.yearPublishedAt ? String(raw.yearPublishedAt) : null,
    publishedTermId: raw.publishedTermId ? String(raw.publishedTermId) : null,
    honorsEnabled: Boolean(raw.honorsEnabled),
    honorsMinAverage: Number(raw.honorsMinAverage ?? 95),
    honorsTitle: String(raw.honorsTitle ?? "شهادة تقدير"),
    honorsMessage: String(raw.honorsMessage ?? ""),
    certificateTitle: String(raw.certificateTitle ?? "شهادة علامات"),
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : null,
  };
}

export function mapStudentCertificate(raw: Record<string, unknown>): StudentCertificate {
  return {
    studentId: String(raw.studentId ?? ""),
    studentName: String(raw.studentName ?? ""),
    studentNumber: String(raw.studentNumber ?? ""),
    gradeLevel: String(raw.gradeLevel ?? ""),
    section: String(raw.section ?? ""),
    periodLabel: String(raw.periodLabel ?? ""),
    subjects: Array.isArray(raw.subjects)
      ? raw.subjects.map((item) => {
          const row = item as Record<string, unknown>;
          return {
            subject: String(row.subject ?? ""),
            score: row.score == null ? null : Number(row.score),
            maxScore: row.maxScore == null ? null : Number(row.maxScore),
            percent: row.percent == null ? null : Number(row.percent),
            hasGrade: Boolean(row.hasGrade),
          };
        })
      : [],
    gradedSubjectsCount: Number(raw.gradedSubjectsCount ?? 0),
    assignedSubjectsCount: Number(raw.assignedSubjectsCount ?? 0),
    averagePercent: raw.averagePercent == null ? null : Number(raw.averagePercent),
    qualifiesHonors: Boolean(raw.qualifiesHonors),
    honorsMinAverage: Number(raw.honorsMinAverage ?? 95),
  };
}

export function mapParentCertificatesResponse(raw: Record<string, unknown>): ParentCertificatesResponse {
  const certificates = Array.isArray(raw.certificates)
    ? raw.certificates.map((item) => {
        const row = item as Record<string, unknown>;
        return {
          scope: (row.scope as CertificateIssuanceScope) ?? "term",
          scopeLabel: String(row.scopeLabel ?? ""),
          academicYearId: row.academicYearId ? String(row.academicYearId) : undefined,
          academicYearName: row.academicYearName ? String(row.academicYearName) : undefined,
          honorsTitle: row.honorsTitle ? String(row.honorsTitle) : undefined,
          visibleUntil: row.visibleUntil ? String(row.visibleUntil) : undefined,
          archiveAfterGrace: row.archiveAfterGrace === undefined ? undefined : Boolean(row.archiveAfterGrace),
          config: row.config
            ? mapCertificateConfig(row.config as Record<string, unknown>)
            : undefined,
          certificate: mapStudentCertificate(row.certificate as Record<string, unknown>),
        };
      })
    : [];

  const fallbackCertificate = raw.certificate
    ? mapStudentCertificate(raw.certificate as Record<string, unknown>)
    : null;

  return {
    published: Boolean(raw.published),
    message: String(raw.message ?? ""),
    config: raw.config ? mapCertificateConfig(raw.config as Record<string, unknown>) : null,
    certificate: fallbackCertificate ?? certificates[0]?.certificate ?? null,
    certificates,
  };
}

export const certificateScopeLabels: Record<CertificateIssuanceScope, string> = {
  term: "كل فصل دراسي",
  year: "كل سنة دراسية",
};

export type CertificatePreview = {
  academicYearId: string;
  academicYearName: string;
  periodLabel: string;
  config: CertificateConfig;
  summary: {
    total: number;
    withAverage: number;
    withoutAverage: number;
    honors: number;
  };
  students: StudentCertificate[];
};

export function mapCertificatePreview(raw: Record<string, unknown>): CertificatePreview {
  const summary = (raw.summary as Record<string, unknown>) ?? {};
  return {
    academicYearId: String(raw.academicYearId ?? ""),
    academicYearName: String(raw.academicYearName ?? ""),
    periodLabel: String(raw.periodLabel ?? ""),
    config: mapCertificateConfig((raw.config as Record<string, unknown>) ?? {}),
    summary: {
      total: Number(summary.total ?? 0),
      withAverage: Number(summary.withAverage ?? 0),
      withoutAverage: Number(summary.withoutAverage ?? 0),
      honors: Number(summary.honors ?? 0),
    },
    students: Array.isArray(raw.students)
      ? raw.students.map((item) => mapStudentCertificate(item as Record<string, unknown>))
      : [],
  };
}
