import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(here, "../../docs/portfolio-ghazatna/images");
const baseUrl = process.env.PORTFOLIO_BASE_URL ?? "http://localhost:3001";

fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true });

async function newPage() {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: "ar",
  });
  return { context, page: await context.newPage() };
}

async function settle(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(2200);
}

async function capturePublic(pathname, filename) {
  const { context, page } = await newPage();
  await page.goto(`${baseUrl}${pathname}`, { waitUntil: "domcontentloaded" });
  await settle(page);
  await page.screenshot({ path: path.join(output, filename), fullPage: true });
  await context.close();
}

async function loginAndCapture(username, password, pathname, filename) {
  const { context, page } = await newPage();
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[autocomplete="username"]').fill(username);
  await page.locator('input[autocomplete="current-password"]').fill(password);
  await page.getByRole("button", { name: "دخول" }).click();
  await page.waitForTimeout(1500);
  await page.goto(`${baseUrl}${pathname}`, { waitUntil: "domcontentloaded" });
  await settle(page);
  await page.screenshot({ path: path.join(output, filename), fullPage: true });
  await context.close();
}

await capturePublic("/programs", "07-programs.png");
await capturePublic("/register", "08-registration.png");
await loginAndCapture("ismail", "123456", "/admin/students", "09-admin-students.png");
await loginAndCapture("guide_teacher", "123456", "/teacher/schedules", "10-teacher-schedule.png");
await loginAndCapture("2026001", "123456", "/parent/fees", "11-parent-fees.png");

await browser.close();
console.log(`Extra screenshots saved to ${output}`);
