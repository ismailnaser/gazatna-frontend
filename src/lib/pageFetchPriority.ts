/** Let the current page start its own API calls before shared providers. */
export function yieldToPageFetch() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
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
