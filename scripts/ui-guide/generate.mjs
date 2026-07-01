import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { GUIDE_PAGES, GUIDE_SECTIONS } from "./lib/pages-index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const OUT_DIR = path.resolve(ROOT, "../docs/ui-guide");
const SHOTS_DIR = path.join(OUT_DIR, "screenshots");
const PDF_PATH = path.join(OUT_DIR, "دليل-واجهات-غزتنا.pdf");
const HTML_PATH = path.join(OUT_DIR, "guide.html");

const BASE_URL = process.env.GUIDE_BASE_URL || "http://localhost:3001";

const DESKTOP = { width: 1920, height: 1080 };
const DEVICE_SCALE = 2;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildStyles() {
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
    line-height: 1.65;
    font-size: 11pt;
  }
  .page-break { page-break-before: always; break-before: page; }
  .cover {
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center;
    background: linear-gradient(160deg, #fcc018 0%, #f87050 45%, #4bc2fc 100%);
    color: #1a1a1a;
    padding: 3rem 2rem;
  }
  .cover h1 { font-size: 2.6rem; font-weight: 800; margin: 0.5rem 0; }
  .cover .sub { font-size: 1.15rem; max-width: 32rem; opacity: 0.9; }
  .cover .badge {
    background: #424cf3; color: #fff; padding: 0.35rem 1rem;
    border-radius: 999px; font-weight: 700; margin-top: 1.5rem;
  }
  .toc { padding: 2rem 1.5rem; }
  .toc h2 { color: #424cf3; border-bottom: 3px solid #ea6622; padding-bottom: 0.4rem; }
  .toc-section { margin: 1.25rem 0; }
  .toc-section h3 { color: #ea6622; margin-bottom: 0.5rem; }
  .toc ul { list-style: none; padding: 0; margin: 0; }
  .toc li { padding: 0.2rem 0; border-bottom: 1px dotted #ddd; }
  .toc a { color: #1a1a1a; text-decoration: none; }
  .doc-page { padding: 1.25rem 1rem 2rem; }
  .doc-header {
    border-right: 5px solid #4bc2fc;
    padding-right: 0.85rem;
    margin-bottom: 1rem;
  }
  .doc-header .section-tag {
    display: inline-block; background: #424cf3; color: #fff;
    font-size: 0.75rem; padding: 0.15rem 0.55rem; border-radius: 6px;
    font-weight: 700;
  }
  .doc-header h2 { margin: 0.35rem 0 0; color: #1a1a1a; font-size: 1.55rem; }
  .meta-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.5rem 0 1rem; }
  .meta-pill {
    background: #fff; border: 1px solid #e5e5e5; border-radius: 8px;
    padding: 0.25rem 0.6rem; font-size: 0.8rem;
  }
  .meta-pill strong { color: #424cf3; }
  .purpose-box {
    background: linear-gradient(90deg, #fffdf8, #fff);
    border: 1px solid #f9b42855;
    border-right: 4px solid #f9b428;
    padding: 0.75rem 1rem; border-radius: 10px; margin-bottom: 1rem;
  }
  .overview { color: #444; margin-bottom: 1rem; }
  .shots {
    display: flex; flex-direction: column; gap: 1.25rem; margin: 1.25rem 0;
  }
  .shot-card {
    border: 2px solid #e0e0e0; border-radius: 14px; overflow: hidden;
    background: #fff; box-shadow: 0 4px 16px #00000012;
    page-break-inside: avoid; break-inside: avoid;
  }
  .shot-card.shot-desktop { border-color: #424cf344; }
  .shot-card figcaption {
    text-align: center; font-weight: 800; padding: 0.55rem;
    background: #424cf3; color: #fff; font-size: 0.95rem;
  }
  .shot-card img { width: 100%; display: block; height: auto; }
  .shot-missing {
    min-height: 120px; display: flex; align-items: center; justify-content: center;
    color: #999; font-size: 0.85rem; padding: 1rem; text-align: center;
  }
  h3.elements-title {
    color: #424cf3; margin: 1.25rem 0 0.6rem;
    padding-bottom: 0.25rem; border-bottom: 2px solid #ea6622;
  }
  .element {
    background: #fff; border: 1px solid #eee; border-radius: 10px;
    padding: 0.65rem 0.85rem; margin-bottom: 0.5rem;
    border-right: 3px solid #4bc2fc;
  }
  .element .el-head { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
  .element .el-name { font-weight: 700; color: #1a1a1a; }
  .element .el-type {
    font-size: 0.72rem; background: #ea662222; color: #ea6622;
    padding: 0.1rem 0.45rem; border-radius: 6px; font-weight: 600;
  }
  .element .el-desc { margin: 0.35rem 0 0; color: #555; font-size: 0.92rem; }
  .tips {
    background: #f9b42818; border: 1px dashed #f9b428; border-radius: 10px;
    padding: 0.65rem 0.9rem; margin-top: 0.75rem;
  }
  .tips h4 { margin: 0 0 0.35rem; color: #ea6622; font-size: 0.95rem; }
  .sub-pages { margin-top: 0.75rem; }
  .sub-page-item {
    padding: 0.5rem 0.65rem; background: #424cf308; border-radius: 8px;
    margin-bottom: 0.35rem; font-size: 0.9rem;
  }
  .sub-page-item strong { color: #424cf3; }
  .footer-note {
    text-align: center; color: #888; font-size: 0.75rem; margin-top: 2rem;
    padding-top: 1rem; border-top: 1px solid #eee;
  }
  @media print {
    .shot-card img { max-height: none; object-fit: contain; object-position: top center; }
    .shot-desktop { page-break-after: always; break-after: page; }
  }
  `;
}

function buildHtml(pages, shotMap) {
  const date = new Date().toLocaleDateString("ar-PS", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const toc = GUIDE_SECTIONS.map(
    (sec) => `
    <div class="toc-section">
      <h3>${escapeHtml(sec.key)}</h3>
      <ul>
        ${sec.pages.map((p) => `<li><a href="#${p.id}">${escapeHtml(p.title)}</a> — <span style="color:#888;font-size:0.85em">${escapeHtml(p.path)}</span></li>`).join("")}
      </ul>
    </div>`
  ).join("");

  const body = pages
    .map((p, idx) => {
      const desktop = shotMap[`${p.id}-desktop`];
      const elements = (p.elements || [])
        .map(
          (el) => `
        <div class="element">
          <div class="el-head">
            <span class="el-name">${escapeHtml(el.name)}</span>
            <span class="el-type">${escapeHtml(el.type)}</span>
          </div>
          <p class="el-desc">${escapeHtml(el.description)}</p>
        </div>`
        )
        .join("");

      const tips = p.tips?.length
        ? `<div class="tips"><h4>ملاحظات مهمة</h4><ul>${p.tips.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul></div>`
        : "";

      const subPages = p.subPages?.length
        ? `<div class="sub-pages"><h3 class="elements-title">صفحات فرعية مرتبطة</h3>${p.subPages
            .map(
              (sp) =>
                `<div class="sub-page-item"><strong>${escapeHtml(sp.title)}</strong> (${escapeHtml(sp.path)}) — ${escapeHtml(sp.description)}</div>`
            )
            .join("")}</div>`
        : "";

      const shotBlock = (file, label, variant) =>
        file
          ? `<figure class="shot-card shot-${variant}"><img src="screenshots/${path.basename(file)}" alt="${escapeHtml(label)}"/><figcaption>${escapeHtml(label)}</figcaption></figure>`
          : `<figure class="shot-card shot-${variant}"><div class="shot-missing">لم تُلتقط صورة — تأكد من تشغيل الموقع والبيانات التجريبية</div><figcaption>${escapeHtml(label)}</figcaption></figure>`;

      return `
      <article id="${p.id}" class="doc-page ${idx > 0 ? "page-break" : ""}">
        <header class="doc-header">
          <span class="section-tag">${escapeHtml(p.section)}</span>
          <h2>${escapeHtml(p.title)}</h2>
        </header>
        <div class="meta-row">
          <span class="meta-pill"><strong>المسار:</strong> ${escapeHtml(p.path)}</span>
          <span class="meta-pill"><strong>الجمهور:</strong> ${escapeHtml(p.audience)}</span>
        </div>
        <div class="purpose-box"><strong>الغرض:</strong> ${escapeHtml(p.purpose)}</div>
        <p class="overview">${escapeHtml(p.overview)}</p>
        <div class="shots">
          ${shotBlock(desktop, "سطح المكتب — 1920 × 1080", "desktop")}
        </div>
        <h3 class="elements-title">شرح تفصيلي لكل عنصر في الواجهة</h3>
        ${elements}
        ${subPages}
        ${tips}
      </article>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8"/>
  <title>دليل واجهات منصة غَزتنا</title>
  <style>${buildStyles()}</style>
</head>
<body>
  <section class="cover">
    <div class="badge">غَزتنا — Gazatna</div>
    <h1>دليل واجهات المنصة</h1>
    <p class="sub">شرح مفصّل لكل صفحة وزر وحقل إدخال — بصور سطح المكتب (اللابتوب) بألوان الموقع الأصلية</p>
    <p class="sub" style="margin-top:2rem;font-size:0.95rem">تاريخ الإصدار: ${escapeHtml(date)}</p>
    <p class="sub" style="font-size:0.85rem">يشمل: الموقع العام • بوابة ولي الأمر • بوابة المعلم • لوحة الإدارة</p>
  </section>

  <section class="toc page-break">
    <h2>فهرس المحتويات</h2>
    ${toc}
  </section>

  ${body}

  <p class="footer-note page-break">نهاية الدليل — منصة غَزتنا التعليمية</p>
</body>
</html>`;
}

async function clearAuth(page) {
  await page.context().clearCookies();
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    sessionStorage.removeItem("ghazatna_access");
    sessionStorage.removeItem("ghazatna_refresh");
    sessionStorage.removeItem("ghazatna_auth");
  });
}

async function login(page, auth) {
  await clearAuth(page);
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle", timeout: 60000 });
  await page.getByLabel("اسم المستخدم").waitFor({ state: "visible", timeout: 20000 });
  await page.getByLabel("اسم المستخدم").fill(auth.username);
  await page.getByLabel("كلمة المرور").fill(auth.password);
  await page.getByRole("button", { name: "دخول", exact: true }).click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30000 });
  await page.waitForTimeout(1500);
}

async function captureScreenshots(browser) {
  const shotMap = {};
  let currentAuth = null;
  const context = await browser.newContext({
    locale: "ar",
    deviceScaleFactor: DEVICE_SCALE,
  });
  const page = await context.newPage();

  for (const guidePage of GUIDE_PAGES) {
    if (guidePage.skipScreenshot) continue;

    const authKey = guidePage.auth ? JSON.stringify(guidePage.auth) : "none";
    if (authKey !== currentAuth) {
      try {
        if (guidePage.auth) {
          await login(page, guidePage.auth);
        } else {
          await clearAuth(page);
        }
        currentAuth = authKey;
      } catch (err) {
        console.warn(`⚠ فشل تسجيل الدخول (${guidePage.auth?.username}): ${err.message}`);
      }
    }

    const url = `${BASE_URL}${guidePage.path}`;
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(guidePage.waitMs ?? 2500);

      const desktopPath = path.join(SHOTS_DIR, `${guidePage.id}-desktop.png`);
      await page.setViewportSize(DESKTOP);
      await page.waitForTimeout(400);
      await page.screenshot({ path: desktopPath, fullPage: false });
      shotMap[`${guidePage.id}-desktop`] = desktopPath;

      console.log(`✓ ${guidePage.title}`);
    } catch (err) {
      console.warn(`⚠ ${guidePage.path}: ${err.message}`);
    }
  }

  await context.close();
  return shotMap;
}

async function main() {
  await fs.mkdir(SHOTS_DIR, { recursive: true });

  console.log(`الموقع: ${BASE_URL}`);
  console.log(`عدد الصفحات: ${GUIDE_PAGES.length}`);

  const browser = await chromium.launch({ headless: true });

  let shotMap = {};
  try {
    shotMap = await captureScreenshots(browser);
  } catch (err) {
    console.warn("تعذر التقاط بعض الصور:", err.message);
  }

  const html = buildHtml(GUIDE_PAGES, shotMap);
  await fs.writeFile(HTML_PATH, html, "utf8");
  console.log(`HTML: ${HTML_PATH}`);

  const pdfPage = await browser.newPage();
  await pdfPage.goto(`file:///${HTML_PATH.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
  await pdfPage.pdf({
    path: PDF_PATH,
    format: "A4",
    printBackground: true,
    margin: { top: "10mm", bottom: "12mm", left: "8mm", right: "8mm" },
  });
  await pdfPage.close();
  await browser.close();

  console.log(`\n✅ PDF جاهز:\n${PDF_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
