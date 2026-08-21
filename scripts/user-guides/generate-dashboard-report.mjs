import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { exportManualToPdf } from "./lib/pdf-builder.mjs";
import dashboardRedesign from "./content/dashboard-redesign.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../../../");

const browser = await chromium.launch({ headless: true });
const pdfPath = await exportManualToPdf(browser, dashboardRedesign, OUT_DIR);
await browser.close();
console.log(pdfPath);
