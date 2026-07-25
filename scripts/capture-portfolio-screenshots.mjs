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
  const page = await context.newPage();
  return { context, page };
}

async function settle(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(2500);
}

async function capturePublic(pathname, filename) {
  const { context, page } = await newPage();
  await page.goto(`${baseUrl}${pathname}`, { waitUntil: "domcontentloaded" });
  await settle(page);
  await page.screenshot({
    path: path.join(output, filename),
    fullPage: true,
  });
  await context.close();
}

async function capturePortal(username, password, expectedPath, filename) {
  const { context, page } = await newPage();
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[autocomplete="username"]').fill(username);
  await page.locator('input[autocomplete="current-password"]').fill(password);
  await page.getByRole("button", { name: "دخول" }).click();
  await page.waitForURL((url) => url.pathname.startsWith(expectedPath), {
    timeout: 20_000,
  });
  await settle(page);
  await page.screenshot({
    path: path.join(output, filename),
    fullPage: true,
  });
  await context.close();
}

await capturePublic("/", "01-homepage.png");
await capturePublic("/about", "02-about.png");
await capturePublic("/login", "03-login.png");
await capturePortal("ismail", "123456", "/admin", "04-admin-portal.png");
await capturePortal("guide_teacher", "123456", "/teacher", "05-teacher-portal.png");
await capturePortal("2026001", "123456", "/parent", "06-parent-portal.png");

await browser.close();
console.log(`Portfolio screenshots saved to ${output}`);
