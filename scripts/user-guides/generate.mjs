import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { exportManualToPdf } from "./lib/pdf-builder.mjs";
import adminManual from "./content/admin.mjs";
import teacherManual from "./content/teacher.mjs";
import parentManual from "./content/parent-student.mjs";
import lifecycleManual from "./content/lifecycle.mjs";
import cpanelDeployManual from "./content/cpanel-deploy.mjs";
import cpanelDeployTerminalManual from "./content/cpanel-deploy-terminal.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../../../docs/user-guides");

const ONLY = process.argv.includes("--only")
  ? process.argv[process.argv.indexOf("--only") + 1]
  : null;

const ALL_MANUALS = [
  adminManual,
  teacherManual,
  parentManual,
  lifecycleManual,
  cpanelDeployManual,
  cpanelDeployTerminalManual,
];

const MANUALS = ONLY
  ? ALL_MANUALS.filter((m) => m.filename.includes(ONLY) || m.filename === ONLY)
  : ALL_MANUALS;

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  console.log(`إخراج الملفات إلى: ${OUT_DIR}\n`);

  for (const manual of MANUALS) {
    const pdfPath = await exportManualToPdf(browser, manual, OUT_DIR);
    console.log(`✓ ${manual.filename}`);
    console.log(`  ${pdfPath}\n`);
  }

  await browser.close();
  console.log("✅ تم إنشاء جميع أدلة المستخدم بنجاح.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
