import type {
  AcademicTermStatus,
  AcademicYear,
  CertificateConfig,
  PromotionPolicy,
  PromotionPreview,
  PromotionStudentAction,
} from "@/types/academic";
import type { Grade } from "@/types/teacher";

export const TERM_ORDINALS = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس"];

export const DEFAULT_SCHOOL_NAME = "مدرسة غَزتنا";

export function defaultTermName(sortOrder: number) {
  const ordinal = TERM_ORDINALS[sortOrder - 1] ?? String(sortOrder);
  return `الفصل ${ordinal}`;
}

export function cloneTerms(terms: AcademicTermStatus[]): AcademicTermStatus[] {
  return terms.map((term) => ({ ...term }));
}

export function suggestedTermDates(year: AcademicYear, terms: AcademicTermStatus[]) {
  const last = terms[terms.length - 1];
  if (last) {
    const start = new Date(last.endDate);
    start.setDate(start.getDate() + 1);
    const startDate = start.toISOString().slice(0, 10);
    return { startDate, endDate: year.endDate };
  }
  return { startDate: year.startDate, endDate: year.endDate };
}

export function reindexTerms(terms: AcademicTermStatus[]): AcademicTermStatus[] {
  return terms.map((term, index) => ({
    ...term,
    sortOrder: index + 1,
  }));
}

export const defaultPolicy = (): PromotionPolicy => ({
  evaluationScope: "single_term",
  yearCalculationMethod: "term_average",
  evaluationTermId: null,
  passRule: "minimum_count",
  passMinimumCount: 1,
  requiredSubjects: [],
  passScoreRatio: 0.5,
  passPromotionMode: "automatic",
  failHandlingMode: "manual_review",
});

export function buildPolicyDraftsFromGrades(gradeRows: Grade[]): Record<string, PromotionPolicy> {
  const drafts: Record<string, PromotionPolicy> = {};
  for (const grade of gradeRows) {
    drafts[grade.id] = grade.promotionPolicy ? { ...grade.promotionPolicy } : defaultPolicy();
  }
  return drafts;
}

export function buildPassMinimumCountInputs(drafts: Record<string, PromotionPolicy>): Record<string, string> {
  const inputs: Record<string, string> = {};
  for (const [termId, policy] of Object.entries(drafts)) {
    inputs[termId] = String(policy.passMinimumCount);
  }
  return inputs;
}

export const ACADEMIC_YEAR_SELECT_SPAN = 10;

/** بداية السنة الدراسية الحالية حسب التقويم (أيلول = بداية العام الدراسي). */
export function currentAcademicYearStart(reference = new Date()) {
  const calendarYear = reference.getFullYear();
  return reference.getMonth() >= 8 ? calendarYear : calendarYear - 1;
}

/** أول سنة في قائمة الإنشاء: السنة الميلادية الحالية / التالية (مثال: 2026 ← 2026/2027). */
export function academicYearSelectRangeStart(reference = new Date()) {
  return reference.getFullYear();
}

export function nextYearName(years: AcademicYear[]) {
  const options = academicYearSelectOptions(years, 1);
  if (options.length > 0) {
    return options[0].value.replace("/", "-");
  }
  const start = currentAcademicYearStart();
  return `${start}-${start + 1}`;
}

export function academicYearLabel(startYear: number) {
  return `${startYear}/${startYear + 1}`;
}

export function academicYearFormFromLabel(label: string) {
  const startYear = Number(label.split("/")[0]);
  return {
    name: label,
    startDate: `${startYear}-09-01`,
    endDate: `${startYear + 1}-06-30`,
  };
}

function normalizeAcademicYearName(name: string) {
  return name.trim().replace("-", "/");
}

export function academicYearSelectOptions(
  existingYears: AcademicYear[],
  span = ACADEMIC_YEAR_SELECT_SPAN,
  reference = new Date()
) {
  const existing = new Set(existingYears.map((year) => normalizeAcademicYearName(year.name)));
  const options: { value: string; label: string }[] = [];
  const firstStartYear = academicYearSelectRangeStart(reference);

  for (let index = 0; index <= span; index += 1) {
    const startYear = firstStartYear + index;
    const label = academicYearLabel(startYear);
    if (!existing.has(label)) {
      options.push({ value: label, label });
    }
  }

  return options;
}

export function suggestNewYearForm(years: AcademicYear[]) {
  const options = academicYearSelectOptions(years);
  if (options.length > 0) {
    return academicYearFormFromLabel(options[0].value);
  }
  const start = academicYearSelectRangeStart();
  return academicYearFormFromLabel(academicYearLabel(start));
}

export function resolveStudentDecision(
  row: PromotionPreview["students"][number],
  decisions: Record<string, PromotionStudentAction>
): PromotionStudentAction {
  const override = decisions[row.studentId];
  if (override && override !== "pending") return override;
  if (row.finalAction !== "pending") return row.finalAction;
  return row.yearPassed ? "promote" : "repeat";
}

export function formatCertificatePercent(value: number | null) {
  if (value == null) return "—";
  return `${value.toFixed(2)}%`;
}

export function isArchivedAcademicYear(year: AcademicYear): boolean {
  return year.status === "archived";
}

export function isManageableAcademicYear(year: AcademicYear): boolean {
  return !isArchivedAcademicYear(year);
}

export function sortedTerms(year: AcademicYear) {
  return [...year.terms].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCurrentTerm(year: AcademicYear) {
  return year.terms.find((term) => term.isCurrent) ?? sortedTerms(year)[0] ?? null;
}

export function isLastTermInYear(year: AcademicYear, term: AcademicTermStatus) {
  const terms = sortedTerms(year);
  return terms.length > 0 && terms[terms.length - 1].id === term.id;
}

export function priorTermsAllClosed(year: AcademicYear, term: AcademicTermStatus) {
  for (const item of sortedTerms(year)) {
    if (item.id === term.id) return true;
    if (!item.isClosed) return false;
  }
  return true;
}

export function canUseTermEnd(year: AcademicYear) {
  const current = getCurrentTerm(year);
  if (!current || current.isClosed) return false;
  return !isLastTermInYear(year, current) && priorTermsAllClosed(year, current);
}

export function canUseYearEnd(year: AcademicYear) {
  const current = getCurrentTerm(year);
  if (!current) return false;
  return isLastTermInYear(year, current) && priorTermsAllClosed(year, current);
}

export const defaultCertificateConfig = (): CertificateConfig => ({
  academicYearId: "",
  issuanceScope: "term",
  isPublished: false,
  publishedAt: null,
  publishedTermId: null,
  honorsEnabled: true,
  honorsMinAverage: 95,
  honorsTitle: "شهادة تقدير",
  honorsMessage:
    "تقديراً للتميز والاجتهاد، تُمنح هذه الشهادة اعترافاً بالمعدل العالي والأداء المتميز طوال الفترة الدراسية.",
  certificateTitle: "شهادة علامات",
  updatedAt: null,
});
