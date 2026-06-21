import {
  buildPdfBrandedHeaderHtml,
  escapeHtml,
  exportHTMLElementToPdf,
  formatExportDate,
  loadSchoolLogoDataUrl,
  mountPdfElement,
} from "@/lib/pdfExport";
import { formatClassLessonTimeRange, formatScheduleTime12 } from "@/lib/scheduleTime";
import type { ClassScheduleEntry, Schedule } from "@/types/schedules";
import {
  formatClassDurationLabel,
  parseClassDurationMinutes,
  SCHEDULE_TYPE_LABELS,
  sortClassScheduleEntries,
} from "@/types/schedules";

export type SchedulePdfExportOptions = {
  schoolName?: string;
};

async function buildSchedulePdfElement(schedule: Schedule, options: SchedulePdfExportOptions = {}) {
  const logoDataUrl = await loadSchoolLogoDataUrl();
  const schoolName = options.schoolName?.trim() || "مدرسة غَزتنا";
  const isExam = schedule.scheduleType === "exam";
  const thStyle =
    "border:1px solid #d4d4d4;background:#f5f5f5;padding:8px 12px;text-align:right;font-size:12px;font-weight:700;color:#111;";
  const tdStyle =
    "border:1px solid #d4d4d4;padding:8px 12px;font-size:13px;color:#111;vertical-align:top;text-align:right;";

  const headers = isExam
    ? ["المادة", "التاريخ", "الوقت", "المدة (دقيقة)", "ملاحظات"]
    : ["اليوم", "الحصة", "الموعد", "مدة الحصة", "المادة", "المعلم", "القاعة", "ملاحظات"];

  const displayEntries = isExam
    ? schedule.entries
    : sortClassScheduleEntries(schedule.entries as ClassScheduleEntry[]);

  const rowsHtml =
    displayEntries.length === 0
      ? `<tr><td colspan="${headers.length}" style="${tdStyle}text-align:center;color:#666;">لا توجد صفوف في هذا الجدول</td></tr>`
      : displayEntries
          .map((entry, index) => {
            const rowBg = index % 2 === 1 ? "background:#fafafa;" : "";
            if (isExam) {
              const row = entry as {
                subject?: string;
                date?: string;
                time?: string;
                duration?: string;
                notes?: string;
              };
              return `<tr style="${rowBg}">
                <td style="${tdStyle}font-weight:600;">${escapeHtml(row.subject || "—")}</td>
                <td style="${tdStyle}direction:ltr;text-align:left;">${escapeHtml(row.date || "—")}</td>
                <td style="${tdStyle}">${escapeHtml(formatScheduleTime12(row.time))}</td>
                <td style="${tdStyle}direction:ltr;text-align:left;">${escapeHtml(row.duration || "—")}</td>
                <td style="${tdStyle}">${escapeHtml(row.notes || "—")}</td>
              </tr>`;
            }
            const row = entry as ClassScheduleEntry;
            const durationMinutes = parseClassDurationMinutes(row.duration);
            const timeLabel = formatClassLessonTimeRange(row.time, durationMinutes);
            return `<tr style="${rowBg}">
              <td style="${tdStyle}font-weight:600;">${escapeHtml(row.day || "—")}</td>
              <td style="${tdStyle}">${escapeHtml(row.period || "—")}</td>
              <td style="${tdStyle}">${escapeHtml(timeLabel)}</td>
              <td style="${tdStyle}">${escapeHtml(formatClassDurationLabel(row.duration))}</td>
              <td style="${tdStyle}font-weight:600;">${escapeHtml(row.subject || "—")}</td>
              <td style="${tdStyle}">${escapeHtml(row.teacher || "—")}</td>
              <td style="${tdStyle}">${escapeHtml(row.room || "—")}</td>
              <td style="${tdStyle}">${escapeHtml(row.notes || "—")}</td>
            </tr>`;
          })
          .join("");

  const headerLines = [SCHEDULE_TYPE_LABELS[schedule.scheduleType]];
  if (schedule.classLabels.length > 0) {
    headerLines.push(`الفصول: ${schedule.classLabels.join(" · ")}`);
  }
  headerLines.push(`تاريخ التصدير: ${formatExportDate()}`);

  return mountPdfElement(`
    <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#ffffff;color:#111111;width:746px;">
      ${buildPdfBrandedHeaderHtml({
        logoDataUrl,
        schoolName,
        title: schedule.name,
        lines: headerLines,
      })}
      <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
        <thead>
          <tr>
            ${headers.map((label) => `<th style="${thStyle}">${label}</th>`).join("")}
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `);
}

export async function exportSchedulePdf(schedule: Schedule, options: SchedulePdfExportOptions = {}) {
  const element = await buildSchedulePdfElement(schedule, options);
  const safeName = schedule.name.replace(/[\\/:*?"<>|]/g, "-").trim() || "جدول";
  await exportHTMLElementToPdf(element, `${safeName}_${formatExportDate()}.pdf`);
}

export function schedulePdfTitle(schedule: Schedule) {
  return `${schedule.name} — ${SCHEDULE_TYPE_LABELS[schedule.scheduleType]}`;
}
