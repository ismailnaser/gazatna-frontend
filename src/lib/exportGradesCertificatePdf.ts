import {
  buildPdfBrandedFooterHtml,
  buildPdfBrandedHeaderHtml,
  escapeHtml,
  exportHTMLElementToPdf,
  formatExportDate,
  loadSchoolLogoDataUrl,
  mountPdfElement,
} from "@/lib/pdfExport";
import {
  collectGradeReportColumns,
  findGradeComponent,
} from "@/lib/gradesReportLayout";
import type { Grade, Student } from "@/types";

export type GradesCertificateInput = {
  student: Student;
  grades: Grade[];
  schoolName?: string;
};

function scoreStyle(passed: boolean | null | undefined) {
  if (passed == null) return "color:#888888;font-weight:600;";
  return passed ? "color:#16a34a;font-weight:700;" : "color:#ea6622;font-weight:700;";
}

function statusBadge(passed: boolean | null | undefined) {
  if (passed == null) {
    return '<span style="color:#888888;font-size:12px;">—</span>';
  }
  if (passed) {
    return '<span style="display:inline-block;background:#dcfce7;color:#16a34a;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;">ناجح</span>';
  }
  return '<span style="display:inline-block;background:#ffedd5;color:#ea6622;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;">راسب</span>';
}

function formatScore(score: number | null, maxScore: number) {
  return score == null ? "—" : `${score}/${maxScore}`;
}

function buildGradesTable(grades: Grade[]) {
  const thStyle =
    "border:1px solid #d4d4d4;background:#f5f5f5;padding:8px 10px;text-align:center;font-size:11px;font-weight:700;color:#111;";
  const tdStyle =
    "border:1px solid #d4d4d4;padding:8px 10px;font-size:12px;color:#111;vertical-align:middle;text-align:center;";
  const subjectTdStyle = `${tdStyle}text-align:right;font-weight:600;`;

  const componentColumns = collectGradeReportColumns(grades);
  const headerCells = [
    `<th style="${thStyle}text-align:right;">المادة</th>`,
    ...componentColumns.map(
      (column) => `<th style="${thStyle}">${escapeHtml(column.name)}</th>`
    ),
    `<th style="${thStyle}">المجموع</th>`,
    `<th style="${thStyle}">الحالة</th>`,
  ].join("");

  const bodyRows = grades
    .map((grade) => {
      const componentCells = componentColumns
        .map((column) => {
          const component = findGradeComponent(grade, column.key);
          if (!component) {
            return `<td style="${tdStyle}color:#888;">—</td>`;
          }
          return `<td style="${tdStyle}${scoreStyle(component.passed)}">${formatScore(component.score, component.maxScore)}</td>`;
        })
        .join("");

      return `<tr>
        <td style="${subjectTdStyle}">${escapeHtml(grade.subject)}</td>
        ${componentCells}
        <td style="${tdStyle}${scoreStyle(grade.passed)}">${formatScore(grade.score, grade.maxScore)}</td>
        <td style="${tdStyle}">${statusBadge(grade.passed)}</td>
      </tr>`;
    })
    .join("");

  const notes = grades
    .filter((grade) => grade.note?.trim())
    .map(
      (grade) =>
        `<p style="margin:6px 0 0;font-size:11px;color:#666;"><strong style="color:#444;">${escapeHtml(grade.subject)}:</strong> ${escapeHtml(grade.note ?? "")}</p>`
    )
    .join("");

  return `
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr>${headerCells}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
    ${notes}
  `;
}

async function buildGradesCertificateElement({
  student,
  grades,
  schoolName = "مدرسة غَزتنا",
}: GradesCertificateInput) {
  const logoDataUrl = await loadSchoolLogoDataUrl();
  const tableHtml = grades.length > 0 ? buildGradesTable(grades) : '<p style="text-align:center;color:#666;font-size:13px;">لا توجد علامات مسجّلة.</p>';
  const exportDate = formatExportDate();

  return mountPdfElement(`
    <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#ffffff;color:#111111;width:746px;">
      ${buildPdfBrandedHeaderHtml({
        logoDataUrl,
        schoolName,
        title: "كشف علامات الطالب",
        lines: [`تاريخ الإصدار: ${exportDate}`],
      })}

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 16px;margin-bottom:20px;padding:14px;background:#fffdf8;border:1px solid #ececec;border-radius:8px;">
        <div><span style="font-size:11px;color:#666;">اسم الطالب</span><p style="margin:2px 0 0;font-size:14px;font-weight:700;">${escapeHtml(student.name)}</p></div>
        <div><span style="font-size:11px;color:#666;">رقم الطالب</span><p style="margin:2px 0 0;font-size:14px;font-weight:700;direction:ltr;text-align:right;">${escapeHtml(student.studentNumber || "—")}</p></div>
        <div><span style="font-size:11px;color:#666;">الصف</span><p style="margin:2px 0 0;font-size:14px;font-weight:700;">${escapeHtml(student.grade || "—")}</p></div>
        <div><span style="font-size:11px;color:#666;">الشعبة</span><p style="margin:2px 0 0;font-size:14px;font-weight:700;">${escapeHtml(student.section || "—")}</p></div>
      </div>

      ${tableHtml}

      ${buildPdfBrandedFooterHtml(schoolName)}
    </div>
  `);
}

export async function exportGradesCertificatePdf(input: GradesCertificateInput) {
  const element = await buildGradesCertificateElement(input);
  const safeName = input.student.name.replace(/[\\/:*?"<>|]/g, "-").trim() || "طالب";
  await exportHTMLElementToPdf(element, `كشف_علامات_${safeName}_${formatExportDate()}.pdf`);
}
