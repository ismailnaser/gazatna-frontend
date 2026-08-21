import {
  buildPdfBrandedFooterHtml,
  escapeHtml,
  formatExportDate,
  loadSchoolLogoDataUrl,
} from "@/lib/pdfExport";
import type { CertificateConfig, StudentCertificate } from "@/types/academic";

export type CertificateRenderInput = {
  certificate: StudentCertificate;
  config: CertificateConfig;
  schoolName?: string;
  honorsTitle?: string;
};

const BODY_FONT =
  "var(--font-cairo),'Cairo',Tahoma,Arial,sans-serif";
const DISPLAY_FONT =
  "var(--font-kids),'Baloo Bhaijaan 2',Tahoma,Arial,sans-serif";

function formatPercent(value: number | null) {
  if (value == null) return "—";
  return `${value.toFixed(2)}%`;
}

function formatScore(score: number | null, maxScore: number | null) {
  if (score == null || maxScore == null) return "—";
  return `${score}/${maxScore}`;
}

function doodleStar(size = 34, fill = "#F9B428") {
  return `<svg width="${size}" height="${size}" viewBox="0 0 58 58" fill="none" aria-hidden>
    <path d="M29 4l7 16 18 2-13 12 4 17-16-9-16 9 4-17-13-12 18-2z" fill="${fill}" stroke="#EA6622" stroke-width="2.4" stroke-linejoin="round"/>
  </svg>`;
}

function doodleTrophy(size = 42) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" aria-hidden>
    <path d="M14 10h20v10c0 7-4.5 12-10 12s-10-5-10-12V10z" fill="#F9B428" stroke="#EA6622" stroke-width="2.2"/>
    <path d="M14 14H8c0 6 3 9 6 10M34 14h6c0 6-3 9-6 10" stroke="#424CF3" stroke-width="2.1" stroke-linecap="round"/>
    <rect x="20" y="32" width="8" height="5" rx="1" fill="#EA6622"/>
    <rect x="16" y="37" width="16" height="5" rx="2" fill="#424CF3"/>
  </svg>`;
}

function doodleBook(size = 40) {
  return `<svg width="${size}" height="${Math.round(size * 0.78)}" viewBox="0 0 70 54" fill="none" aria-hidden>
    <path d="M8 8c18-8 36-8 54 0v38c-18-6-36-6-54 0z" fill="#4BC2FC" fill-opacity=".7" stroke="#424CF3" stroke-width="2.2"/>
    <path d="M35 6v42" stroke="#424CF3" stroke-width="2"/>
  </svg>`;
}

function doodlePencil(size = 52) {
  return `<svg width="${size}" height="${Math.round(size * 0.28)}" viewBox="0 0 90 24" fill="none" aria-hidden>
    <rect x="8" y="6" width="58" height="12" rx="2" fill="#F9B428" stroke="#EA6622" stroke-width="1.8"/>
    <path d="M66 6l16 6-16 6z" fill="#1A1A1A"/>
    <rect x="0" y="6" width="10" height="12" rx="1" fill="#EA6622"/>
  </svg>`;
}

function paperFrame(inner: string, accent = "#424CF3") {
  return `
    <div style="position:relative;border:4px solid ${accent};border-radius:28px 12px 28px 16px;background:#fff8ec;padding:10px;box-sizing:border-box;">
      <div style="position:relative;border:2px dashed #EA6622;border-radius:22px 10px 22px 12px;background:#ffffff;padding:22px 20px 18px;overflow:hidden;">
        <span style="position:absolute;top:10px;right:12px;opacity:.9;">${doodleStar(28)}</span>
        <span style="position:absolute;top:14px;left:14px;opacity:.9;">${doodleBook(34)}</span>
        <span style="position:absolute;bottom:12px;right:16px;opacity:.85;">${doodlePencil(48)}</span>
        <span style="position:absolute;bottom:10px;left:14px;opacity:.9;">${doodleStar(22, "#4BC2FC")}</span>
        <div style="position:relative;z-index:1;">${inner}</div>
      </div>
    </div>
  `;
}

export async function buildHonorsCertificateHtml({
  certificate,
  config,
  schoolName = "مدرسة غَزتنا",
  honorsTitle,
}: CertificateRenderInput) {
  const title = honorsTitle?.trim() || config.honorsTitle;
  const logoDataUrl = await loadSchoolLogoDataUrl();
  const exportDate = formatExportDate();
  const averageText =
    certificate.averagePercent != null ? `${certificate.averagePercent.toFixed(1)}%` : "—";

  const inner = `
    <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
      <tr>
        <td style="width:120px;vertical-align:middle;">
          <img src="${logoDataUrl}" alt="" style="height:64px;width:auto;max-width:120px;object-fit:contain;display:block;" />
        </td>
        <td style="vertical-align:middle;text-align:center;">
          <p style="margin:0;font-family:${DISPLAY_FONT};font-size:15px;font-weight:800;color:#424CF3;">${escapeHtml(schoolName)}</p>
          <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:#1a1a1a99;">${escapeHtml(certificate.periodLabel)}</p>
        </td>
        <td style="width:56px;text-align:left;vertical-align:middle;">${doodleTrophy(48)}</td>
      </tr>
    </table>

    <div style="margin:12px auto 8px;max-width:460px;background:#F9B428;border:3px solid #1a1a1a14;border-radius:999px;padding:10px 18px;text-align:center;box-shadow:-4px 5px 0 0 rgba(234,102,34,.35);">
      <p style="margin:0;font-family:${DISPLAY_FONT};font-size:26px;font-weight:800;color:#1a1a1a;line-height:1.35;">
        ${escapeHtml(title)}
      </p>
    </div>

    <p style="margin:10px 0 6px;text-align:center;font-family:${DISPLAY_FONT};font-size:15px;font-weight:800;color:#EA6622;">
      أحسنت… شهادة فخر
    </p>
    <p style="margin:0 auto 14px;max-width:480px;text-align:center;font-size:13px;line-height:1.7;color:#1a1a1acc;">
      تُمنح بكل حب وتقدير إلى النجم/ة
    </p>

    <div style="margin:0 auto 16px;max-width:520px;background:#fff8ec;border:3px solid #F9B428;border-radius:22px;padding:14px 16px;text-align:center;">
      <p style="margin:0;font-family:${DISPLAY_FONT};font-size:30px;font-weight:800;color:#424CF3;line-height:1.3;">
        ${escapeHtml(certificate.studentName)}
      </p>
      <p style="margin:8px 0 0;font-size:13px;font-weight:700;color:#1a1a1a99;">
        الصف ${escapeHtml(certificate.gradeLevel || "—")}
        · الشعبة ${escapeHtml(certificate.section || "—")}
        · رقم ${escapeHtml(certificate.studentNumber || "—")}
      </p>
    </div>

    <div style="margin:0 auto 18px;text-align:center;">
      <span style="display:inline-block;vertical-align:middle;">${doodleStar(30)}</span>
      <div style="display:inline-block;width:158px;height:158px;margin:0 10px;border-radius:50%;background:#424CF3;color:#ffffff;vertical-align:middle;box-shadow:-5px 6px 0 0 rgba(249,180,40,.55);">
        <div style="display:table;width:100%;height:100%;">
          <div style="display:table-cell;vertical-align:middle;text-align:center;">
            <p style="margin:0;font-size:12px;font-weight:800;opacity:.88;">المعدل</p>
            <p style="margin:6px 0 0;font-family:${DISPLAY_FONT};font-size:36px;font-weight:800;line-height:1;direction:ltr;">${averageText}</p>
          </div>
        </div>
      </div>
      <span style="display:inline-block;vertical-align:middle;">${doodleStar(30)}</span>
    </div>

    <p style="margin:0 auto 10px;max-width:540px;text-align:center;font-size:14px;line-height:1.9;font-weight:600;color:#1a1a1add;">
      ${escapeHtml(config.honorsMessage)}
    </p>
    <p style="margin:0 0 18px;text-align:center;font-size:11px;font-weight:700;color:#EA6622;">
      الحد الأدنى لهذه الشهادة: ${config.honorsMinAverage}%
    </p>

    <table style="width:100%;max-width:480px;margin:0 auto;border-collapse:collapse;">
      <tr>
        <td style="width:50%;padding-top:10px;text-align:center;">
          <p style="margin:0 auto;width:70%;border-top:2px solid #424CF3;padding-top:8px;font-size:12px;font-weight:800;color:#424CF3;">مدير/ة المدرسة</p>
        </td>
        <td style="width:50%;padding-top:10px;text-align:center;">
          <p style="margin:0 auto;width:70%;border-top:2px solid #EA6622;padding-top:8px;font-size:12px;font-weight:800;color:#EA6622;">تاريخ الإصدار: ${exportDate}</p>
        </td>
      </tr>
    </table>
  `;

  return `
    <div dir="rtl" style="font-family:${BODY_FONT};background:#ffffff;color:#1a1a1a;width:746px;">
      ${paperFrame(inner, "#424CF3")}
      ${buildPdfBrandedFooterHtml(schoolName)}
    </div>
  `;
}

export async function buildStudentCertificateHtml({
  certificate,
  config,
  schoolName = "مدرسة غَزتنا",
}: CertificateRenderInput) {
  const logoDataUrl = await loadSchoolLogoDataUrl();
  const exportDate = formatExportDate();

  const thStyle =
    `border:2px solid #fff;background:#424CF3;padding:10px 12px;text-align:right;font-size:12px;font-weight:800;color:#fff;font-family:${DISPLAY_FONT};`;
  const tdStyle =
    "border:1px solid #ece7d8;padding:10px 12px;font-size:13px;color:#1a1a1a;vertical-align:middle;text-align:right;font-weight:600;";

  const rows = certificate.subjects
    .map((subject, index) => {
      const percentStyle =
        subject.percent == null
          ? "color:#888;font-weight:700;"
          : subject.percent >= 90
            ? "color:#EA6622;font-weight:800;"
            : subject.percent >= 50
              ? "color:#2F9E44;font-weight:800;"
              : "color:#ea6622;font-weight:800;";
      const rowBg = index % 2 === 0 ? "#fffdf6" : "#ffffff";

      return `<tr style="background:${rowBg};">
        <td style="${tdStyle}font-weight:800;">${escapeHtml(subject.subject)}</td>
        <td style="${tdStyle}">${formatScore(subject.score, subject.maxScore)}</td>
        <td style="${tdStyle}${percentStyle}">${formatPercent(subject.percent)}</td>
      </tr>`;
    })
    .join("");

  const averageBlock =
    certificate.averagePercent != null
      ? `<table style="width:100%;margin-top:16px;border-collapse:collapse;">
          <tr>
            <td style="padding:14px 16px;background:#fff8ec;border:3px solid #F9B428;border-radius:18px;vertical-align:middle;">
              <p style="margin:0;font-family:${DISPLAY_FONT};font-size:14px;font-weight:800;color:#1a1a1a;">المعدل العام</p>
              <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:#1a1a1a99;">${certificate.gradedSubjectsCount} من ${certificate.assignedSubjectsCount} مادة</p>
            </td>
            <td style="width:16px;"></td>
            <td style="width:150px;padding:14px 10px;background:#424CF3;border-radius:18px;text-align:center;vertical-align:middle;box-shadow:-4px 5px 0 0 rgba(249,180,40,.45);">
              <p style="margin:0;font-family:${DISPLAY_FONT};font-size:28px;font-weight:800;color:#ffffff;direction:ltr;">${certificate.averagePercent.toFixed(1)}%</p>
            </td>
          </tr>
        </table>`
      : `<p style="margin-top:16px;text-align:center;color:#666;font-size:13px;">لا توجد علامات كافية لحساب المعدل.</p>`;

  const inner = `
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
      <tr>
        <td style="width:120px;vertical-align:middle;">
          <img src="${logoDataUrl}" alt="" style="height:64px;width:auto;max-width:120px;object-fit:contain;display:block;" />
        </td>
        <td style="vertical-align:middle;text-align:right;">
          <p style="margin:0;font-family:${DISPLAY_FONT};font-size:14px;font-weight:800;color:#424CF3;">${escapeHtml(schoolName)}</p>
          <h1 style="margin:4px 0 0;font-family:${DISPLAY_FONT};font-size:26px;font-weight:800;color:#1a1a1a;line-height:1.3;">${escapeHtml(config.certificateTitle)}</h1>
          <p style="margin:6px 0 0;font-size:12px;font-weight:700;color:#1a1a1a99;">${escapeHtml(certificate.periodLabel)} · ${exportDate}</p>
        </td>
        <td style="width:48px;text-align:left;vertical-align:top;">${doodleStar(32)}</td>
      </tr>
    </table>

    <table style="width:100%;border-collapse:separate;border-spacing:8px;margin-bottom:12px;">
      <tr>
        <td style="padding:12px;background:#fff8ec;border:2px solid #F9B42855;border-radius:16px;width:50%;">
          <span style="font-size:11px;font-weight:800;color:#EA6622;">اسم الطالب</span>
          <p style="margin:2px 0 0;font-family:${DISPLAY_FONT};font-size:16px;font-weight:800;">${escapeHtml(certificate.studentName)}</p>
        </td>
        <td style="padding:12px;background:#eef2ff;border:2px solid #424CF322;border-radius:16px;width:50%;">
          <span style="font-size:11px;font-weight:800;color:#424CF3;">رقم الطالب</span>
          <p style="margin:2px 0 0;font-size:16px;font-weight:800;direction:ltr;text-align:right;">${escapeHtml(certificate.studentNumber || "—")}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:12px;background:#fff;border:2px solid #ece7d8;border-radius:16px;width:50%;">
          <span style="font-size:11px;font-weight:800;color:#1a1a1a88;">الصف</span>
          <p style="margin:2px 0 0;font-size:15px;font-weight:800;">${escapeHtml(certificate.gradeLevel || "—")}</p>
        </td>
        <td style="padding:12px;background:#fff;border:2px solid #ece7d8;border-radius:16px;width:50%;">
          <span style="font-size:11px;font-weight:800;color:#1a1a1a88;">الشعبة</span>
          <p style="margin:2px 0 0;font-size:15px;font-weight:800;">${escapeHtml(certificate.section || "—")}</p>
        </td>
      </tr>
    </table>

    <table style="width:100%;border-collapse:collapse;table-layout:fixed;border-radius:16px;overflow:hidden;">
      <thead>
        <tr>
          <th style="${thStyle}">المادة</th>
          <th style="${thStyle}">العلامة</th>
          <th style="${thStyle}">النسبة</th>
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td colspan="3" style="${tdStyle}text-align:center;color:#666;">لا توجد مواد مسندة.</td></tr>`}
      </tbody>
    </table>

    ${averageBlock}

    <table style="width:100%;margin-top:22px;border-collapse:collapse;">
      <tr>
        <td style="width:50%;padding-top:8px;text-align:center;">
          <p style="margin:0 auto;width:60%;border-top:2px solid #424CF3;padding-top:8px;font-size:12px;font-weight:800;color:#424CF3;">توقيع الإدارة</p>
        </td>
        <td style="width:50%;padding-top:8px;text-align:center;">
          <p style="margin:0 auto;width:60%;border-top:2px solid #EA6622;padding-top:8px;font-size:12px;font-weight:800;color:#EA6622;">ختم المدرسة</p>
        </td>
      </tr>
    </table>
  `;

  return `
    <div dir="rtl" style="font-family:${BODY_FONT};background:#ffffff;color:#1a1a1a;width:746px;">
      ${paperFrame(inner, "#EA6622")}
      ${buildPdfBrandedFooterHtml(schoolName)}
    </div>
  `;
}
