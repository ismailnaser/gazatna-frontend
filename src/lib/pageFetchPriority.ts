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
  if (pathname.startsWith("/admin/notifications")) return false;
  if (pathname.startsWith("/admin/users")) return false;
  if (pathname.startsWith("/admin/content")) return false;
  if (pathname.startsWith("/admin/messages")) return false;
  if (pathname === "/admin/admissions") return false;
  if (pathname === "/admin/site" || pathname.startsWith("/admin/site/hero") || pathname.startsWith("/admin/site/about") || pathname.startsWith("/admin/site/contact")) {
    return false;
  }
  if (pathname.startsWith("/admin/finance")) {
    return pathname.includes("/plans/");
  }
  if (pathname.startsWith("/admin/grade-schemes")) return false;
  if (pathname === "/admin/schedules") return false;
  return true;
}

/** Teachers/subjects are heavy — only pages that edit assignments/schedules. */
export function adminPathNeedsStaff(pathname: string) {
  return (
    pathname.startsWith("/admin/teachers") ||
    pathname.startsWith("/admin/subjects") ||
    /\/admin\/classes\/[^/]+\/sections\//.test(pathname) ||
    pathname.startsWith("/admin/schedules/create") ||
    /\/admin\/schedules\/[^/]+/.test(pathname)
  );
}

export function teacherPathNeedsSchool(pathname: string) {
  if (!pathname.startsWith("/teacher")) return false;
  if (pathname.startsWith("/teacher/schedules")) return false;
  if (pathname.startsWith("/teacher/archive")) return false;
  if (pathname === "/teacher/alerts") return false;
  return true;
}

export function teacherPathNeedsAssignmentLists(pathname: string) {
  return (
    pathname.startsWith("/teacher/homework") ||
    pathname.startsWith("/teacher/quizzes")
  );
}

export function teacherPathNeedsAssessments(pathname: string) {
  return pathname.startsWith("/teacher/homework") || pathname.startsWith("/teacher/quizzes");
}

export function parentPathNeedsAssignments(pathname: string) {
  // Subject detail already loads its own payload — avoid fan-out of all lists.
  if (pathname.startsWith("/parent/homework/subject/")) return false;
  return (
    pathname.startsWith("/parent/homework/") ||
    pathname.startsWith("/parent/quizzes")
  );
}

/** Academic workspace: only load grades/policies on these routes. */
export function academicPathNeedsGrades(pathname: string) {
  return (
    pathname.startsWith("/admin/promotion-policies") ||
    pathname.startsWith("/admin/term-end") ||
    pathname.startsWith("/admin/year-end")
  );
}

export function academicPathNeedsSubjects(pathname: string) {
  return pathname.startsWith("/admin/promotion-policies");
}

export function academicPathNeedsSchoolName(pathname: string) {
  return (
    pathname.startsWith("/admin/certificate-settings") ||
    pathname.startsWith("/admin/term-end") ||
    pathname.startsWith("/admin/year-end")
  );
}
