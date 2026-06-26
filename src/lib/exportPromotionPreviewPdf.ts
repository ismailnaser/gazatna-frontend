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
  title?: string;
  passedLabel?: string;
  failedLabel?: string;
  hideDecisionColumns?: boolean;
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

async function buildPromotionPreviewElement({
  preview,
  decisions,
  schoolName = "مدرسة غَزتنا",
  title = "معاينة نتائج نهاية السنة",
  passedLabel = "ناجح",
  failedLabel = "راسب",
  hideDecisionColumns = false,
}: PromotionPreviewPdfInput) {
  const logoDataUrl = await loadSchoolLogoDataUrl();
  const exportDate = formatExportDate();
  const thStyle =
    "border:1px solid #d4d4d4;background:#f5f5f5;padding:8px 10px;text-align:right;font-size:11px;font-weight:700;color:#111;";
  const tdStyle =
    "border:1px solid #d4d4d4;padding:8px 10px;font-size:11px;color:#111;vertical-align:middle;text-align:right;";

  const summaryItems = hideDecisionColumns
    ? [
        { label: passedLabel, value: preview.summary.passed },
        { label: failedLabel, value: preview.summary.failed },
      ]
    : [
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
        <td style="${tdStyle}${row.yearPassed ? "color:#16a34a;font-weight:700;" : "color:#ea6622;font-weight:700;"}">${row.yearPassed ? escapeHtml(passedLabel) : escapeHtml(failedLabel)}</td>
        ${hideDecisionColumns ? "" : `<td style="${tdStyle}font-weight:600;">${escapeHtml(decisionLabel(action))}</td>
        <td style="${tdStyle}">${escapeHtml(row.proposedGrade)}</td>`}
      </tr>`;
    })
    .join("");

  return mountPdfElement(`
    <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#ffffff;color:#111111;width:746px;">
      ${buildPdfBrandedHeaderHtml({
        logoDataUrl,
        schoolName,
        title,
        lines: [
          `السنة الدراسية: ${preview.academicYearName}`,
          preview.termName ? `الفصل: ${preview.termName}` : "",
          `تاريخ التصدير: ${exportDate}`,
        ].filter(Boolean),
      })}

      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px;">${summaryHtml}</div>

      <h2 style="margin:0 0 10px;font-size:15px;font-weight:700;color:#111;">ملخص الطلاب</h2>
      <table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-bottom:22px;">
        <thead>
          <tr>
            <th style="${thStyle}">الطالب</th>
            <th style="${thStyle}">الصف</th>
            <th style="${thStyle}">الحالة</th>
            ${hideDecisionColumns ? "" : `<th style="${thStyle}">القرار</th>
            <th style="${thStyle}">الصف المقترح</th>`}
          </tr>
        </thead>
        <tbody>${overviewRows}</tbody>
      </table>

      ${buildPdfBrandedFooterHtml(schoolName)}
    </div>
  `);
}

export async function exportPromotionPreviewPdf(input: PromotionPreviewPdfInput) {
  const element = await buildPromotionPreviewElement(input);
  const safeYear = input.preview.academicYearName.replace(/[\\/:*?"<>|]/g, "-").trim() || "سنة";
  const safeTerm = input.preview.termName?.replace(/[\\/:*?"<>|]/g, "-").trim();
  const prefix = input.preview.scope === "term" ? "نتائج_نهاية_الفصل" : "نتائج_نهاية_السنة";
  const namePart = safeTerm ? `${safeYear}_${safeTerm}` : safeYear;
  await exportHTMLElementToPdf(element, `${prefix}_${namePart}_${formatExportDate()}.pdf`);
}
