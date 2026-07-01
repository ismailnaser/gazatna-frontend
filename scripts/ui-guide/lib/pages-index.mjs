import { publicPages } from "./pages-public.mjs";
import { parentPages } from "./pages-parent.mjs";
import { teacherPages } from "./pages-teacher.mjs";
import { adminPages } from "./pages-admin.mjs";

/** @type {import('./types.mjs').GuidePage[]} */
export const GUIDE_PAGES = [
  ...publicPages,
  ...parentPages,
  ...teacherPages,
  ...adminPages,
];

export const GUIDE_SECTIONS = [
  { key: "الموقع العام", pages: publicPages.filter((p) => p.section === "الموقع العام" || p.section === "الدخول") },
  { key: "بوابة ولي الأمر", pages: parentPages },
  { key: "بوابة المعلم", pages: teacherPages },
  { key: "لوحة الإدارة", pages: adminPages.filter((p) => p.section === "لوحة الإدارة") },
  { key: "الإدارة الأكاديمية", pages: adminPages.filter((p) => p.section === "الإدارة الأكاديمية") },
];
