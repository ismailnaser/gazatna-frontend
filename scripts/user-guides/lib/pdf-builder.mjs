import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildStyles() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; }
    @page { size: A4; margin: 14mm 12mm; }
    html, body {
      margin: 0; padding: 0;
      font-family: 'Cairo', sans-serif;
      color: #1a1a1a;
      background: #fffdf8;
      direction: rtl;
      line-height: 1.75;
      font-size: 11.5pt;
    }
    .page-break { page-break-before: always; break-before: page; }
    .cover {
      min-height: 100vh;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center;
      background: linear-gradient(160deg, #fcc018 0%, #f87050 40%, #4bc2fc 100%);
      padding: 3rem 2rem;
    }
    .cover .badge {
      background: #424cf3; color: #fff; padding: 0.4rem 1.1rem;
      border-radius: 999px; font-weight: 800; font-size: 0.9rem;
    }
    .cover h1 { font-size: 2.4rem; font-weight: 800; margin: 1rem 0 0.5rem; }
    .cover .sub { font-size: 1.05rem; max-width: 34rem; opacity: 0.92; }
    .cover .date { margin-top: 2rem; font-size: 0.9rem; opacity: 0.85; }
    .toc { padding: 1.5rem 1.25rem; }
    .toc h2 { color: #424cf3; border-bottom: 3px solid #ea6622; padding-bottom: 0.35rem; }
    .toc ol { padding-right: 1.25rem; }
    .toc li { margin: 0.35rem 0; }
    .toc a { color: #1a1a1a; text-decoration: none; }
    .section { padding: 0.5rem 1.25rem 1.5rem; }
    .section h2 {
      color: #424cf3; font-size: 1.45rem; margin: 0 0 0.75rem;
      border-right: 5px solid #4bc2fc; padding-right: 0.65rem;
    }
    .section h3 { color: #ea6622; font-size: 1.1rem; margin: 1.1rem 0 0.5rem; }
    .section h4 { color: #1a1a1a; font-size: 1rem; margin: 0.85rem 0 0.35rem; }
    .section p { margin: 0.45rem 0; color: #333; }
    .section ul, .section ol { margin: 0.35rem 0; padding-right: 1.35rem; }
    .section li { margin: 0.3rem 0; }
    .info-box {
      background: #4bc2fc15; border: 1px solid #4bc2fc55;
      border-right: 4px solid #4bc2fc; border-radius: 10px;
      padding: 0.7rem 0.9rem; margin: 0.75rem 0;
    }
    .warn-box {
      background: #f9b42818; border: 1px dashed #f9b428;
      border-right: 4px solid #ea6622; border-radius: 10px;
      padding: 0.7rem 0.9rem; margin: 0.75rem 0;
    }
    .step-card {
      background: #fff; border: 1px solid #e8e8e8; border-radius: 12px;
      padding: 0.85rem 1rem; margin: 0.65rem 0;
      border-right: 4px solid #424cf3;
      page-break-inside: avoid; break-inside: avoid;
    }
    .step-num {
      display: inline-block; background: #424cf3; color: #fff;
      width: 1.6rem; height: 1.6rem; line-height: 1.6rem; text-align: center;
      border-radius: 50%; font-weight: 800; font-size: 0.85rem; margin-left: 0.45rem;
    }
    .where-hint {
      display: block; background: #ea662212; color: #555;
      font-size: 0.92rem; padding: 0.35rem 0.55rem; border-radius: 8px;
      margin: 0.45rem 0 0.25rem; border-right: 3px solid #ea6622;
    }
    .where-hint strong { color: #ea6622; }
    table { width: 100%; border-collapse: collapse; margin: 0.75rem 0; font-size: 0.95rem; }
    th, td { border: 1px solid #ddd; padding: 0.45rem 0.55rem; text-align: right; }
    th { background: #424cf3; color: #fff; }
    tr:nth-child(even) { background: #fffdf8; }
    .footer { text-align: center; color: #888; font-size: 0.8rem; padding: 2rem 1rem; border-top: 1px solid #eee; }
  `;
}

function renderSection(section, index) {
  const id = section.id || `sec-${index + 1}`;
  let html = `<section id="${id}" class="section ${index > 0 ? "page-break" : ""}">`;
  html += `<h2>${escapeHtml(section.title)}</h2>`;
  if (section.intro) html += `<p>${section.intro}</p>`;

  for (const block of section.blocks || []) {
    if (block.type === "p") html += `<p>${block.text}</p>`;
    if (block.type === "info") html += `<div class="info-box">${block.html || escapeHtml(block.text)}</div>`;
    if (block.type === "warn") html += `<div class="warn-box">${block.html || escapeHtml(block.text)}</div>`;
    if (block.type === "h3") html += `<h3>${escapeHtml(block.text)}</h3>`;
    if (block.type === "h4") html += `<h4>${escapeHtml(block.text)}</h4>`;
    if (block.type === "ul") {
      html += "<ul>";
      for (const item of block.items) html += `<li>${item}</li>`;
      html += "</ul>";
    }
    if (block.type === "ol") {
      html += "<ol>";
      for (const item of block.items) html += `<li>${item}</li>`;
      html += "</ol>";
    }
    if (block.type === "steps") {
      for (const step of block.items) {
        html += `<div class="step-card"><span class="step-num">${step.n}</span><strong>${escapeHtml(step.title)}</strong>`;
        if (step.where) html += `<p class="where-hint"><strong>من وين؟</strong> ${step.where}</p>`;
        if (step.body) html += `<p>${step.body}</p>`;
        if (step.list) {
          html += "<ul>";
          for (const li of step.list) html += `<li>${li}</li>`;
          html += "</ul>";
        }
        html += "</div>";
      }
    }
    if (block.type === "table") {
      html += "<table><thead><tr>";
      for (const h of block.headers) html += `<th>${escapeHtml(h)}</th>`;
      html += "</tr></thead><tbody>";
      for (const row of block.rows) {
        html += "<tr>";
        for (const cell of row) html += `<td>${cell}</td>`;
        html += "</tr>";
      }
      html += "</tbody></table>";
    }
  }
  html += "</section>";
  return html;
}

export function buildManualHtml(manual) {
  const date = new Date().toLocaleDateString("ar-PS", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const toc = manual.sections
    .map((s, i) => {
      const id = s.id || `sec-${i + 1}`;
      return `<li><a href="#${id}">${escapeHtml(s.title)}</a></li>`;
    })
    .join("");

  const body = manual.sections.map((s, i) => renderSection(s, i)).join("");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(manual.title)}</title>
  <style>${buildStyles()}</style>
</head>
<body>
  <section class="cover">
    <div class="badge">غَزتنا — Gazatna</div>
    <h1>${escapeHtml(manual.title)}</h1>
    <p class="sub">${escapeHtml(manual.subtitle)}</p>
    <p class="date">تاريخ الإصدار: ${escapeHtml(date)}</p>
  </section>
  <section class="toc page-break">
    <h2>فهرس المحتويات</h2>
    <ol>${toc}</ol>
  </section>
  ${body}
  <p class="footer page-break">نهاية الدليل — منصة غَزتنا التعليمية</p>
</body>
</html>`;
}

export async function exportManualToPdf(browser, manual, outDir) {
  const html = buildManualHtml(manual);
  const safeName = manual.filename.replace(/\.pdf$/i, "");
  const htmlPath = path.join(outDir, `${safeName}.html`);
  const pdfPath = path.join(outDir, manual.filename);
  await fs.writeFile(htmlPath, html, "utf8");

  const page = await browser.newPage();
  await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "10mm", bottom: "12mm", left: "8mm", right: "8mm" },
  });
  await page.close();
  return pdfPath;
}
