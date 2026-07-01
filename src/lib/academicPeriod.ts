import { getTermDisplayName } from "@/components/admin/academic/academicAdminUtils";
import type { AcademicContext, AcademicTermStatus } from "@/types/academic";

export function formatAcademicYearLabel(yearName: string | null | undefined): string {
  const trimmed = (yearName ?? "").trim();
  if (!trimmed) return "—";
  return trimmed.replace(/-/g, "/");
}

export function getAcademicTermLabel(term: AcademicTermStatus | null | undefined): string {
  return getTermDisplayName(term);
}

export function formatAcademicPeriodCombined(context: AcademicContext): string | null {
  const yearLabel = context.academicYear?.name
    ? formatAcademicYearLabel(context.academicYear.name)
    : null;
  const termLabel = context.currentTerm ? getAcademicTermLabel(context.currentTerm) : null;

  if (termLabel && yearLabel) return `${termLabel} من ${yearLabel}`;
  if (yearLabel) return `السنة الدراسية ${yearLabel}`;
  if (termLabel) return termLabel;
  return null;
}

export function formatAcademicPeriodParts(context: AcademicContext): {
  yearLabel: string | null;
  termLabel: string | null;
  combined: string | null;
} {
  const yearLabel = context.academicYear?.name
    ? formatAcademicYearLabel(context.academicYear.name)
    : null;
  const termLabel = context.currentTerm ? getAcademicTermLabel(context.currentTerm) : null;
  const combined = formatAcademicPeriodCombined(context);
  return { yearLabel, termLabel, combined };
}
