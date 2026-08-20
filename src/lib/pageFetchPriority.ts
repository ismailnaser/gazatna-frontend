/** Let the current page start its own API calls before shared providers. */
export function yieldToPageFetch(delayMs = 0) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

/** Admin pages that only need their own API — skip school catalog/staff bootstrap. */
export function adminPathNeedsCatalog(pathname: string) {
  if (!pathname.startsWith("/admin")) return false;
  if (pathname === "/admin") return false;
  if (pathname.startsWith("/admin/analytics")) return false;
  if (pathname.startsWith("/admin/grade-schemes")) return false;
  if (pathname.startsWith("/admin/notifications")) return false;
  if (pathname.startsWith("/admin/users")) return false;
  if (pathname.startsWith("/admin/content")) return false;
  if (pathname.startsWith("/admin/messages")) return false;
  if (pathname.startsWith("/admin/site")) return false;
  return true;
}

/** Teachers/subjects are heavy — only pages that edit assignments/schedules. */
export function adminPathNeedsStaff(pathname: string) {
  return (
    pathname.startsWith("/admin/teachers") ||
    pathname.startsWith("/admin/subjects") ||
    pathname.startsWith("/admin/classes") ||
    pathname.startsWith("/admin/schedules") ||
    pathname.startsWith("/admin/academic") ||
    pathname.startsWith("/admin/promotion-policies") ||
    pathname.startsWith("/admin/certificate-settings") ||
    pathname.startsWith("/admin/term-end") ||
    pathname.startsWith("/admin/year-end")
  );
}

export function teacherPathNeedsSchool(pathname: string) {
  if (!pathname.startsWith("/teacher")) return false;
  if (pathname.startsWith("/teacher/schedules")) return false;
  if (pathname.startsWith("/teacher/archive")) return false;
  return true;
}

export function teacherPathNeedsAssignmentLists(pathname: string) {
  return (
    pathname === "/teacher" ||
    pathname.startsWith("/teacher/homework") ||
    pathname.startsWith("/teacher/quizzes")
  );
}

export function teacherPathNeedsAssessments(pathname: string) {
  return pathname.startsWith("/teacher/homework") || pathname.startsWith("/teacher/quizzes");
}

export function parentPathNeedsAssignments(pathname: string) {
  return (
    pathname.startsWith("/parent/homework/") ||
    pathname.startsWith("/parent/quizzes")
  );
}
