import {
  buildPdfBrandedHeaderHtml,
  escapeHtml,
  exportHTMLElementToPdf,
  formatExportDate,
  loadSchoolLogoDataUrl,
  mountPdfElement,
} from "@/lib/pdfExport";
import { formatClassLessonTimeRange, formatScheduleTime12 } from "@/lib/scheduleTime";
import type { ClassScheduleEntry, Schedule, TeacherScheduleRow } from "@/types/schedules";
import {
  buildStudentScheduleGrid,
  formatClassDurationLabel,
  parseClassDurationMinutes,
  SCHEDULE_TYPE_LABELS,
  sortClassScheduleEntries,
  sortTeacherScheduleRows,
} from "@/types/schedules";

export type SchedulePdfVariant = "full" | "student" | "exam";

export type SchedulePdfExportOptions = {
  schoolName?: string;
  variant?: SchedulePdfVariant;
};

export type TeacherSchedulePdfExportOptions = {
  schoolName?: string;
  title?: string;
};

const thStyle =
  "border:1px solid #d4d4d4;background:#f5f5f5;padding:8px 12px;text-align:right;font-size:12px;font-weight:700;color:#111;";
const tdStyle =
  "border:1px solid #d4d4d4;padding:8px 12px;font-size:13px;color:#111;vertical-align:top;text-align:right;";

function buildStudentGridPdfHtml(schedule: Schedule) {
  const grid = buildStudentScheduleGrid(schedule.entries as ClassScheduleEntry[]);
  const headerCells = grid.lessonColumns
    .map(
      (column) =>
        `<th style="${thStyle}text-align:center;">${escapeHtml(column.period)}${
          column.timeLabel && column.timeLabel !== "—"
            ? `<div style="margin-top:2px;font-size:10px;font-weight:500;color:#666;">${escapeHtml(column.timeLabel)}</div>`
            : ""
        }</th>`
    )
    .join("");

  const bodyRows =
    grid.rows.length === 0
      ? `<tr><td colspan="${Math.max(grid.lessonColumns.length + 1, 2)}" style="${tdStyle}text-align:center;color:#666;">لا توجد حصص في هذا الجدول</td></tr>`
      : grid.rows
          .map((row, index) => {
            const rowBg = index % 2 === 1 ? "background:#fafafa;" : "";
            const cells = row.subjects
              .map(
                (subject) =>
                  `<td style="${tdStyle}text-align:center;${subject !== "—" ? "font-weight:600;" : ""}">${escapeHtml(subject)}</td>`
              )
              .join("");
            return `<tr style="${rowBg}"><td style="${tdStyle}font-weight:600;background:#fafafa;">${escapeHtml(row.day)}</td>${cells}</tr>`;
          })
          .join("");

  return `
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
      <thead>
        <tr>
          <th style="${thStyle}">اليوم</th>
          ${headerCells}
        </tr>
      </thead>
      <tbody>${bodyRows}</tbody>
    </table>
  `;
}

function buildFullClassPdfHtml(schedule: Schedule) {
  const displayEntries = sortClassScheduleEntries(schedule.entries as ClassScheduleEntry[]);
  const headers = ["اليوم", "الحصة", "الموعد", "مدة الحصة", "المادة", "المعلم", "القاعة", "ملاحظات"];
  const rowsHtml =
    displayEntries.length === 0
      ? `<tr><td colspan="${headers.length}" style="${tdStyle}text-align:center;color:#666;">لا توجد صفوف في هذا الجدول</td></tr>`
      : displayEntries
          .map((row, index) => {
            const rowBg = index % 2 === 1 ? "background:#fafafa;" : "";
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

  return `
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
      <thead>
        <tr>${headers.map((label) => `<th style="${thStyle}">${label}</th>`).join("")}</tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;
}

function buildExamPdfHtml(schedule: Schedule) {
  const headers = ["المادة", "التاريخ", "الوقت", "المدة (دقيقة)", "ملاحظات"];
  const rowsHtml =
    schedule.entries.length === 0
      ? `<tr><td colspan="${headers.length}" style="${tdStyle}text-align:center;color:#666;">لا توجد صفوف في هذا الجدول</td></tr>`
      : schedule.entries
          .map((entry, index) => {
            const row = entry as {
              subject?: string;
              date?: string;
              time?: string;
              duration?: string;
              notes?: string;
            };
            const rowBg = index % 2 === 1 ? "background:#fafafa;" : "";
            return `<tr style="${rowBg}">
              <td style="${tdStyle}font-weight:600;">${escapeHtml(row.subject || "—")}</td>
              <td style="${tdStyle}direction:ltr;text-align:left;">${escapeHtml(row.date || "—")}</td>
              <td style="${tdStyle}">${escapeHtml(formatScheduleTime12(row.time))}</td>
              <td style="${tdStyle}direction:ltr;text-align:left;">${escapeHtml(row.duration || "—")}</td>
              <td style="${tdStyle}">${escapeHtml(row.notes || "—")}</td>
            </tr>`;
          })
          .join("");

  return `
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
      <thead>
        <tr>${headers.map((label) => `<th style="${thStyle}">${label}</th>`).join("")}</tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;
}

async function buildSchedulePdfElement(schedule: Schedule, options: SchedulePdfExportOptions = {}) {
  const logoDataUrl = await loadSchoolLogoDataUrl();
  const schoolName = options.schoolName?.trim() || "مدرسة غَزتنا";
  const variant =
    options.variant ?? (schedule.scheduleType === "exam" ? "exam" : "full");
  const tableHtml =
    variant === "student"
      ? buildStudentGridPdfHtml(schedule)
      : variant === "exam"
        ? buildExamPdfHtml(schedule)
        : schedule.scheduleType === "exam"
          ? buildExamPdfHtml(schedule)
          : buildFullClassPdfHtml(schedule);

  const headerLines = [SCHEDULE_TYPE_LABELS[schedule.scheduleType]];
  if (schedule.classLabels.length > 0) {
    headerLines.push(
      variant === "student"
        ? `الشعبة: ${schedule.classLabels.join(" · ")}`
        : `الفصول: ${schedule.classLabels.join(" · ")}`
    );
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
      ${tableHtml}
    </div>
  `);
}

async function buildTeacherSchedulePdfElement(
  rows: TeacherScheduleRow[],
  options: TeacherSchedulePdfExportOptions = {}
) {
  const logoDataUrl = await loadSchoolLogoDataUrl();
  const schoolName = options.schoolName?.trim() || "مدرسة غَزتنا";
  const title = options.title?.trim() || "جدول حصصي الأسبوعي";
  const displayRows = sortTeacherScheduleRows(rows);
  const headers = ["اليوم", "موعد الحصة", "الفصل والشعبة", "المادة"];
  const rowsHtml =
    displayRows.length === 0
      ? `<tr><td colspan="${headers.length}" style="${tdStyle}text-align:center;color:#666;">لا توجد حصص مسندة إليك</td></tr>`
      : displayRows
          .map((row, index) => {
            const rowBg = index % 2 === 1 ? "background:#fafafa;" : "";
            const timeLabel = formatClassLessonTimeRange(
              row.time,
              parseClassDurationMinutes(row.duration)
            );
            return `<tr style="${rowBg}">
              <td style="${tdStyle}font-weight:600;">${escapeHtml(row.day || "—")}</td>
              <td style="${tdStyle}">${escapeHtml(timeLabel)}</td>
              <td style="${tdStyle}">${escapeHtml(row.classLabel || "—")}</td>
              <td style="${tdStyle}font-weight:600;">${escapeHtml(row.subject || "—")}</td>
            </tr>`;
          })
          .join("");

  return mountPdfElement(`
    <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#ffffff;color:#111111;width:746px;">
      ${buildPdfBrandedHeaderHtml({
        logoDataUrl,
        schoolName,
        title,
        lines: ["جدول حصصي الأسبوعي", `تاريخ التصدير: ${formatExportDate()}`],
      })}
      <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
        <thead>
          <tr>${headers.map((label) => `<th style="${thStyle}">${label}</th>`).join("")}</tr>
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

export async function exportTeacherSchedulePdf(
  rows: TeacherScheduleRow[],
  options: TeacherSchedulePdfExportOptions = {}
) {
  const element = await buildTeacherSchedulePdfElement(rows, options);
  const safeName = (options.title || "جدول-المعلم").replace(/[\\/:*?"<>|]/g, "-").trim();
  await exportHTMLElementToPdf(element, `${safeName}_${formatExportDate()}.pdf`);
}

export function schedulePdfTitle(schedule: Schedule) {
  return `${schedule.name} — ${SCHEDULE_TYPE_LABELS[schedule.scheduleType]}`;
}
