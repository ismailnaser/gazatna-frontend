/** @typedef {{ name: string; type: string; description: string }} GuideElement */

/**
 * @param {object} p
 * @returns {import('./types.mjs').GuidePage}
 */
export function page(p) {
  return {
    waitMs: 2500,
    skipScreenshot: false,
    ...p,
  };
}

export const AUDIENCE = {
  public: "الزوار — أي شخص يتصفح الموقع دون تسجيل دخول",
  parent: "ولي الأمر / الطالب — الحساب المرتبط بابن أو ابنة مسجّلين في المدرسة",
  teacher: "المعلم — عضو الكادر التعليمي المسند إليه فصول ومواد",
  admin: "الإدارة — مدير النظام أو أحد أدوار الإدارة الفرعية",
};

export const AUTH = {
  none: null,
  admin: { username: "ismail", password: "123456", role: "admin" },
  parent: { username: "2026001", password: "123456", role: "parent" },
  teacher: { username: "guide_teacher", password: "123456", role: "teacher" },
};
