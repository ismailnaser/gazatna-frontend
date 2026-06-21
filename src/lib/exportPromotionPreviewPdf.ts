import {
  buildPdfBrandedFooterHtml,
  buildPdfBrandedHeaderHtml,
  escapeHtml,
  exportHTMLElementToPdf,
  formatExportDate,
  loadSchoolLogoDataUrl,
  mountPdfElement,
} from "@/lib/pdfExport";
import type { PromotionPreview, PromotionStudentAction } from "@/types/academic";
import { promotionActionLabels } from "@/types/academic";

export type PromotionPreviewPdfInput = {
  preview: PromotionPreview;
  decisions?: Record<string, PromotionStudentAction>;
  schoolName?: string;
};

function resolveDecision(
  row: PromotionPreview["students"][number],
  decisions?: Record<string, PromotionStudentAction>
): PromotionStudentAction {
  const override = decisions?.[row.studentId];
  if (override && override !== "pending") return override;
  if (row.finalAction !== "pending") return row.finalAction;
  return row.yearPassed ? "promote" : "repeat";
}

function decisionLabel(action: PromotionStudentAction) {
  if (action === "pending") return "بانتظار قرار";
  return promotionActionLabels[action] ?? action;
}

function scoreStyle(passed: boolean) {
  return passed ? "color:#16a34a;font-weight:700;" : "color:#ea6622;font-weight:700;";
}

async function buildPromotionPreviewElement({
  preview,
  decisions,
  schoolName = "مدرسة غَزتنا",
}: PromotionPreviewPdfInput) {
  const logoDataUrl = await loadSchoolLogoDataUrl();
  const exportDate = formatExportDate();
  const thStyle =
    "border:1px solid #d4d4d4;background:#f5f5f5;padding:8px 10px;text-align:right;font-size:11px;font-weight:700;color:#111;";
  const tdStyle =
    "border:1px solid #d4d4d4;padding:8px 10px;font-size:11px;color:#111;vertical-align:middle;text-align:right;";

  const summaryItems = [
    { label: "ناجح", value: preview.summary.passed },
    { label: "راسب", value: preview.summary.failed },
    { label: "ترفيع", value: preview.summary.promote },
    { label: "إعادة", value: preview.summary.repeat },
    { label: "تخرّج", value: preview.summary.graduate },
    { label: "بانتظار قرار", value: preview.summary.pending },
  ];

  const summaryHtml = summaryItems
    .map(
      (item) => `
      <div style="flex:1;min-width:90px;border:1px solid #ececec;border-radius:10px;padding:10px;text-align:center;background:#fffdf8;">
        <p style="margin:0;font-size:18px;font-weight:700;color:#111;">${item.value}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#666;">${escapeHtml(item.label)}</p>
      </div>`
    )
    .join("");

  const overviewRows = preview.students
    .map((row) => {
      const action = resolveDecision(row, decisions);
      return `<tr>
        <td style="${tdStyle}font-weight:600;">${escapeHtml(row.name)}<br/><span style="color:#888;font-size:10px;">${escapeHtml(row.studentNumber || "—")}</span></td>
        <td style="${tdStyle}">${escapeHtml(`${row.currentGrade} ${row.currentSection}`.trim())}</td>
        <td style="${tdStyle}">${row.passedSubjectsCount}/${row.totalSubjectsCount}</td>
        <td style="${tdStyle}${row.yearPassed ? "color:#16a34a;font-weight:700;" : "color:#ea6622;font-weight:700;"}">${row.yearPassed ? "ناجح" : "راسب"}</td>
        <td style="${tdStyle}font-weight:600;">${escapeHtml(decisionLabel(action))}</td>
        <td style="${tdStyle}">${escapeHtml(row.proposedGrade)}</td>
      </tr>`;
    })
    .join("");

  const detailSections = preview.students
    .map((row) => {
      const action = resolveDecision(row, decisions);
      if (row.subjects.length === 0) {
        return `
          <section style="margin-bottom:16px;page-break-inside:avoid;">
            <h3 style="margin:0 0 8px;font-size:13px;font-weight:700;color:#111;">
              ${escapeHtml(row.name)} — ${escapeHtml(`${row.currentGrade} ${row.currentSection}`.trim())}
            </h3>
            <p style="margin:0;font-size:11px;color:#666;">لا توجد علامات مسجّلة لهذا الطالب.</p>
          </section>`;
      }

      const subjectRows = row.subjects
        .map(
          (subject) => `<tr>
            <td style="${tdStyle}font-weight:600;">${escapeHtml(subject.subject)}</td>
            <td style="${tdStyle}${scoreStyle(subject.passed)}">${subject.score}/${subject.maxScore}</td>
            <td style="${tdStyle}">${subject.passScore}</td>
            <td style="${tdStyle}${scoreStyle(subject.passed)}">${subject.passed ? "ناجح" : "راسب"}</td>
          </tr>`
        )
        .join("");

      return `
        <section style="margin-bottom:18px;page-break-inside:avoid;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:8px;">
            <div>
              <h3 style="margin:0;font-size:13px;font-weight:700;color:#111;">${escapeHtml(row.name)}</h3>
              <p style="margin:4px 0 0;font-size:11px;color:#666;">
                ${escapeHtml(`${row.currentGrade} ${row.currentSection}`.trim())} — ${row.passedSubjectsCount}/${row.totalSubjectsCount} مواد
              </p>
            </div>
            <div style="text-align:left;font-size:11px;color:#444;">
              <span style="${row.yearPassed ? "color:#16a34a;font-weight:700;" : "color:#ea6622;font-weight:700;"}">${row.yearPassed ? "ناجح" : "راسب"}</span>
              — ${escapeHtml(decisionLabel(action))}
            </div>
          </div>
          <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
            <thead>
              <tr>
                <th style="${thStyle}">المادة</th>
                <th style="${thStyle}">العلامة</th>
                <th style="${thStyle}">علامة النجاح</th>
                <th style="${thStyle}">الحالة</th>
              </tr>
            </thead>
            <tbody>${subjectRows}</tbody>
          </table>
        </section>`;
    })
    .join("");

  return mountPdfElement(`
    <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#ffffff;color:#111111;width:746px;">
      ${buildPdfBrandedHeaderHtml({
        logoDataUrl,
        schoolName,
        title: "معاينة نتائج نهاية السنة",
        lines: [
          `السنة الدراسية: ${preview.academicYearName}`,
          `تاريخ التصدير: ${exportDate}`,
        ],
      })}

      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px;">${summaryHtml}</div>

      <h2 style="margin:0 0 10px;font-size:15px;font-weight:700;color:#111;">ملخص الطلاب</h2>
      <table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-bottom:22px;">
        <thead>
          <tr>
            <th style="${thStyle}">الطالب</th>
            <th style="${thStyle}">الصف</th>
            <th style="${thStyle}">المواد</th>
            <th style="${thStyle}">حالة السنة</th>
            <th style="${thStyle}">القرار</th>
            <th style="${thStyle}">الصف المقترح</th>
          </tr>
        </thead>
        <tbody>${overviewRows}</tbody>
      </table>

      <h2 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#111;">تفاصيل المواد</h2>
      ${detailSections}

      ${buildPdfBrandedFooterHtml(schoolName)}
    </div>
  `);
}

export async function exportPromotionPreviewPdf(input: PromotionPreviewPdfInput) {
  const element = await buildPromotionPreviewElement(input);
  const safeYear = input.preview.academicYearName.replace(/[\\/:*?"<>|]/g, "-").trim() || "سنة";
  await exportHTMLElementToPdf(element, `نتائج_نهاية_السنة_${safeYear}_${formatExportDate()}.pdf`);
}
