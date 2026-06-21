import {
  buildPdfBrandedFooterHtml,
  buildPdfBrandedHeaderHtml,
  escapeHtml,
  exportHTMLElementToPdf,
  formatExportDate,
  loadSchoolLogoDataUrl,
  mountPdfElement,
} from "@/lib/pdfExport";
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
  return score == null ? "—" : String(score);
}

function buildGradeSection(grade: Grade) {
  const thStyle =
    "border:1px solid #d4d4d4;background:#f5f5f5;padding:8px 10px;text-align:right;font-size:11px;font-weight:700;color:#111;";
  const tdStyle =
    "border:1px solid #d4d4d4;padding:8px 10px;font-size:12px;color:#111;vertical-align:middle;text-align:right;";

  const components = grade.components ?? [];
  const rows =
    components.length > 0
      ? components
          .map((component) => {
            return `<tr>
              <td style="${tdStyle}font-weight:600;">${escapeHtml(component.name)}</td>
              <td style="${tdStyle}${scoreStyle(component.passed)}">${formatScore(component.score, component.maxScore)}/${component.maxScore}</td>
              <td style="${tdStyle}color:#666;">${component.passScore}</td>
              <td style="${tdStyle}">${statusBadge(component.passed)}</td>
            </tr>`;
          })
          .join("")
      : "";

  const totalRow = `<tr style="background:#fafafa;">
    <td style="${tdStyle}font-weight:700;">المجموع</td>
    <td style="${tdStyle}${scoreStyle(grade.passed)}">${formatScore(grade.score, grade.maxScore)}/${grade.maxScore}</td>
    <td style="${tdStyle}font-weight:600;color:#444;">${grade.passScore}</td>
    <td style="${tdStyle}">${statusBadge(grade.passed)}</td>
  </tr>`;

  const noteLine = grade.note
    ? `<p style="margin:8px 0 0;font-size:11px;color:#666;">ملاحظات المعلم: ${escapeHtml(grade.note)}</p>`
    : "";

  return `
    <section style="margin-bottom:22px;page-break-inside:avoid;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px;">
        <div>
          <h2 style="margin:0;font-size:15px;font-weight:700;color:#111;">${escapeHtml(grade.subject)}</h2>
          <p style="margin:4px 0 0;font-size:11px;color:#666;">العلامة الكاملة: ${grade.maxScore} — علامة النجاح: ${grade.passScore}</p>
        </div>
        <div style="text-align:left;white-space:nowrap;">
          <span style="${scoreStyle(grade.passed)}font-size:14px;">${formatScore(grade.score, grade.maxScore)}/${grade.maxScore}</span>
          <span style="margin-right:8px;">${statusBadge(grade.passed)}</span>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
        <thead>
          <tr>
            <th style="${thStyle}">التقسيم</th>
            <th style="${thStyle}">العلامة</th>
            <th style="${thStyle}">علامة النجاح</th>
            <th style="${thStyle}">الحالة</th>
          </tr>
        </thead>
        <tbody>${rows}${totalRow}</tbody>
      </table>
      ${noteLine}
    </section>
  `;
}

async function buildGradesCertificateElement({
  student,
  grades,
  schoolName = "مدرسة غَزتنا",
}: GradesCertificateInput) {
  const logoDataUrl = await loadSchoolLogoDataUrl();
  const sections = grades.map(buildGradeSection).join("");
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

      ${sections || '<p style="text-align:center;color:#666;font-size:13px;">لا توجد علامات مسجّلة.</p>'}

      ${buildPdfBrandedFooterHtml(schoolName)}
    </div>
  `);
}

export async function exportGradesCertificatePdf(input: GradesCertificateInput) {
  const element = await buildGradesCertificateElement(input);
  const safeName = input.student.name.replace(/[\\/:*?"<>|]/g, "-").trim() || "طالب";
  await exportHTMLElementToPdf(element, `كشف_علامات_${safeName}_${formatExportDate()}.pdf`);
}
