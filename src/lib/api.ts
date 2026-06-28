import {
  getCacheKey,
  getCacheTtl,
  invalidateApiCache,
  isCacheableGet,
  readApiCache,
  writeApiCache,
} from "@/lib/apiCache";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const TOKEN_KEY = "ghazatna_access";
const REFRESH_KEY = "ghazatna_refresh";
const USER_KEY = "ghazatna_auth";

const DEFAULT_TIMEOUT_MS = 15000;

function mergeAbortSignals(signals: Array<AbortSignal | undefined>): AbortSignal | undefined {
  const active = signals.filter(Boolean) as AbortSignal[];
  if (active.length === 0) return undefined;
  if (active.length === 1) return active[0];
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  for (const s of active) {
    if (s.aborted) {
      controller.abort();
      break;
    }
    s.addEventListener("abort", onAbort, { once: true });
  }
  return controller.signal;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
) {
  const controller = new AbortController();
  const signal = mergeAbortSignals([options.signal, controller.signal]);
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal });
  } finally {
    clearTimeout(id);
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setTokens(access: string, refresh: string) {
  sessionStorage.setItem(TOKEN_KEY, access);
  sessionStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(USER_KEY);
  invalidateApiCache();
}

export function getStoredUser<T>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStoredUser<T>(user: T) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = sessionStorage.getItem(REFRESH_KEY);
  if (!refresh) return null;
  const res = await fetchWithTimeout(`${API_BASE}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  sessionStorage.setItem(TOKEN_KEY, data.access);
  return data.access;
}

function formatApiError(err: unknown, fallback: string): string {
  if (!err || typeof err !== "object") return fallback;
  const data = err as Record<string, unknown>;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) return data.detail.map(String).join("، ");
  const fieldMessages = Object.entries(data)
    .filter(([key]) => key !== "detail")
    .flatMap(([key, value]) => {
      if (Array.isArray(value)) return value.map((msg) => `${key}: ${String(msg)}`);
      if (typeof value === "string") return [`${key}: ${value}`];
      return [];
    });
  if (fieldMessages.length > 0) return fieldMessages.join(" — ");
  return fallback;
}

async function parseFailedResponse(res: Response): Promise<string> {
  const fallback =
    res.status === 500
      ? "خطأ في الخادم. تأكد أن الباكند شغال وتم تنفيذ migrate."
      : res.status === 401
        ? "انتهت جلسة الدخول. سجّل الدخول من جديد."
        : res.status === 403
          ? "ليس لديك صلاحية لهذا الإجراء."
          : res.status === 404
            ? "العنصر غير موجود أو تم حذفه مسبقاً."
            : "حدث خطأ في الاتصال بالخادم";
  const err = await res.json().catch(() => null);
  const message = formatApiError(err, fallback);
  if (message.includes("No SchoolClass matches the given query")) {
    return "الشعبة غير موجودة. حدّث الصفحة وحاول مرة أخرى.";
  }
  return message;
}

export function formatClientFetchError(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;
  const message = err.message.toLowerCase();
  if (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("load failed") ||
    message.includes("aborted")
  ) {
    return "تعذر الاتصال بالخادم. تأكد أن الخادم الخلفي يعمل على http://localhost:8000 ثم أعد المحاولة.";
  }
  return err.message || fallback;
}

function rebuildFormData(entries: [string, FormDataEntryValue][]): FormData {
  const body = new FormData();
  for (const [key, value] of entries) {
    body.append(key, value);
  }
  return body;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const cacheKey = getCacheKey(path, method);

  if (isCacheableGet(path, method)) {
    const cached = readApiCache<T>(cacheKey);
    if (cached !== null) return cached;
  } else if (method !== "GET") {
    if (path.startsWith("/content/") || path.startsWith("/admin/content/")) {
      invalidateApiCache("/content/");
    }
    if (path.startsWith("/admin/site-settings")) {
      invalidateApiCache("/site-settings");
    }
    if (path.startsWith("/admin/academic-years") || path.includes("term-end") || path.includes("rollover")) {
      invalidateApiCache("/academic-context");
    }
    if (path.startsWith("/admin/finance") || path.includes("/fee-access")) {
      invalidateApiCache("/admin/analytics");
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  let token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res = await fetchWithTimeout(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetchWithTimeout(`${API_BASE}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    throw new Error(await parseFailedResponse(res));
  }

  if (res.status === 204) return undefined as T;
  const data = (await res.json()) as T;

  if (isCacheableGet(path, method)) {
    writeApiCache(cacheKey, data, getCacheTtl(path));
  }

  return data;
}

async function apiFormFetch<T>(
  path: string,
  formData: FormData,
  method: "POST" | "PATCH" = "POST"
): Promise<T> {
  const entries = Array.from(formData.entries());

  async function send(token: string | null) {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetchWithTimeout(`${API_BASE}${path}`, {
      method,
      headers,
      body: rebuildFormData(entries),
    });
  }

  let token = getAccessToken();
  let res = await send(token);

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await send(newToken);
    }
  }

  if (!res.ok) {
    throw new Error(await parseFailedResponse(res));
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

type Paginated<T> = {
  count?: number;
  results?: T[];
  next?: string | null;
  previous?: string | null;
};

async function apiList<T>(path: string, options: RequestInit = {}): Promise<T[]> {
  const data = await apiFetch<T[] | Paginated<T>>(path, options);
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(data.results)) {
    return data.results;
  }
  return [];
}

export const api = {
  login: (username: string, password: string) =>
    apiFetch<{ user: unknown; access: string; refresh: string }>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  me: () => apiFetch<unknown>("/auth/me/"),

  getNews: () => apiList<unknown>("/content/news/"),
  getNewsItem: (id: string) => apiFetch<unknown>(`/content/news/${id}/`),
  getPrograms: () => apiList<unknown>("/content/programs/"),
  getSchoolValues: () => apiList<unknown>("/content/values/"),
  getTeachers: () => apiList<unknown>("/staff/teachers/"),
  getStats: () => apiList<unknown>("/content/stats/"),

  getSiteSettings: () => apiFetch<unknown>("/site-settings/"),
  getAdminSiteSettings: () => apiFetch<unknown>("/admin/site-settings/"),
  updateAdminSiteSettings: (data: unknown) =>
    apiFetch<unknown>("/admin/site-settings/", { method: "PATCH", body: JSON.stringify(data) }),

  submitAdmissionApplication: (data: unknown) =>
    apiFetch<unknown>("/admissions/", { method: "POST", body: JSON.stringify(data) }),
  submitContactMessage: (data: unknown) =>
    apiFetch<unknown>("/contact/messages/", { method: "POST", body: JSON.stringify(data) }),

  getAdminAdmissions: (status?: string) =>
    apiList<unknown>(status ? `/admin/admissions/?status=${encodeURIComponent(status)}` : "/admin/admissions/"),
  approveAdminAdmission: (id: string, data: { classId: string }) =>
    apiFetch<unknown>(`/admin/admissions/${id}/approve/`, { method: "POST", body: JSON.stringify(data) }),
  unapproveAdminAdmission: (id: string) =>
    apiFetch<unknown>(`/admin/admissions/${id}/unapprove/`, { method: "POST" }),
  deleteAdminAdmission: (id: string) =>
    apiFetch<void>(`/admin/admissions/${id}/`, { method: "DELETE" }),

  getAdminMessages: (status?: string) =>
    apiList<unknown>(status ? `/admin/messages/?status=${encodeURIComponent(status)}` : "/admin/messages/"),
  archiveAdminMessage: (id: string) =>
    apiFetch<unknown>(`/admin/messages/${id}/archive/`, { method: "POST", body: JSON.stringify({}) }),

  getAdminBlockedStudents: () => apiList<unknown>("/admin/notifications/blocked-students/"),
  getAdminInactiveStudents: () => apiList<unknown>("/admin/notifications/inactive-students/"),

  getAdminAnalytics: () => apiFetch<unknown>("/admin/analytics/"),
  getAdminAnalyticsDetails: (params: { gradeLevel?: string; from?: string; to?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.gradeLevel) qs.set("gradeLevel", params.gradeLevel);
    if (params.from) qs.set("from", params.from);
    if (params.to) qs.set("to", params.to);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return apiFetch<unknown>(`/admin/analytics/details/${suffix}`);
  },
  getAdminStudents: () => apiList<unknown>("/admin/students/"),
  getAdminStudent: (id: string) => apiFetch<unknown>(`/admin/students/${id}/`),
  createAdminStudent: (data: FormData | Record<string, unknown>) =>
    data instanceof FormData
      ? apiFormFetch<unknown>("/admin/students/", data, "POST")
      : apiFetch<unknown>("/admin/students/", { method: "POST", body: JSON.stringify(data) }),
  updateAdminStudent: (id: string, data: unknown) =>
    apiFetch<unknown>(`/admin/students/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteAdminStudent: (id: string) =>
    apiFetch<void>(`/admin/students/${id}/`, { method: "DELETE" }),
  resetAdminStudentPassword: (id: string) =>
    apiFetch<unknown>(`/admin/students/${id}/reset-password/`, { method: "POST" }),
  getAdminStudentDocuments: (id: string) => apiList<unknown>(`/admin/students/${id}/documents/`),
  addAdminStudentDocuments: (id: string, data: FormData) =>
    apiFormFetch<unknown>(`/admin/students/${id}/documents/`, data, "POST"),
  updateAdminStudentDocument: (studentId: string, docId: string, data: FormData) =>
    apiFormFetch<unknown>(`/admin/students/${studentId}/documents/${docId}/`, data, "PATCH"),
  deleteAdminStudentDocument: (studentId: string, docId: string) =>
    apiFetch<void>(`/admin/students/${studentId}/documents/${docId}/`, { method: "DELETE" }),
  getAdminGrades: () => apiList<unknown>("/admin/grades/"),
  createAdminGrade: (data: unknown) =>
    apiFetch<unknown>("/admin/grades/", { method: "POST", body: JSON.stringify(data) }),
  updateAdminGrade: (id: string, data: unknown) =>
    apiFetch<unknown>(`/admin/grades/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteAdminGrade: (id: string) =>
    apiFetch<void>(`/admin/grades/${id}/`, { method: "DELETE" }),
  reorderAdminGrades: (order: string[]) =>
    apiFetch<unknown>("/admin/grades/reorder/", {
      method: "POST",
      body: JSON.stringify({ order }),
    }),
  getAcademicContext: () => apiFetch<unknown>("/academic-context/"),
  getAdminAcademicYears: () => apiList<unknown>("/admin/academic-years/"),
  createAdminAcademicYear: (data: unknown) =>
    apiFetch<unknown>("/admin/academic-years/", { method: "POST", body: JSON.stringify(data) }),
  updateAdminAcademicYear: (id: string, data: unknown) =>
    apiFetch<unknown>(`/admin/academic-years/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteAdminAcademicYear: (id: string) =>
    apiFetch<void>(`/admin/academic-years/${id}/`, { method: "DELETE" }),
  setAdminAcademicYearActive: (id: string) =>
    apiFetch<unknown>(`/admin/academic-years/${id}/set-active/`, { method: "POST" }),
  setAdminAcademicCurrentTerm: (yearId: string, termId: string) =>
    apiFetch<unknown>(`/admin/academic-years/${yearId}/set-current-term/`, {
      method: "POST",
      body: JSON.stringify({ termId }),
    }),
  updateAdminGradePromotionPolicy: (gradeId: string, data: unknown) =>
    apiFetch<unknown>(`/admin/grades/${gradeId}/promotion-policy/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  getAdminPromotionPreview: (yearId: string, decisions?: Array<{ studentId: string; action: string }>) =>
    decisions?.length
      ? apiFetch<unknown>(`/admin/academic-years/${yearId}/promotion-preview/`, {
          method: "POST",
          body: JSON.stringify({ decisions }),
        })
      : apiFetch<unknown>(`/admin/academic-years/${yearId}/promotion-preview/`),
  executeAdminYearRollover: (
    yearId: string,
    data: { decisions?: Array<{ studentId: string; action: string }>; newYearName?: string }
  ) =>
    apiFetch<unknown>(`/admin/academic-years/${yearId}/execute-rollover/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAdminTermEndPreview: (yearId: string, termId?: string) =>
    apiFetch<unknown>(
      termId
        ? `/admin/academic-years/${yearId}/term-end-preview/?termId=${encodeURIComponent(termId)}`
        : `/admin/academic-years/${yearId}/term-end-preview/`
    ),
  executeAdminTermEnd: (yearId: string, data?: { termId?: string; publishCertificates?: boolean }) =>
    apiFetch<unknown>(`/admin/academic-years/${yearId}/execute-term-end/`, {
      method: "POST",
      body: JSON.stringify(data ?? {}),
    }),
  getAdminCertificateConfig: (yearId: string) =>
    apiFetch<unknown>(`/admin/academic-years/${yearId}/certificate-config/`),
  updateAdminCertificateConfig: (yearId: string, data: unknown) =>
    apiFetch<unknown>(`/admin/academic-years/${yearId}/certificate-config/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  publishAdminCertificates: (yearId: string, data?: { termId?: string }) =>
    apiFetch<unknown>(`/admin/academic-years/${yearId}/publish-certificates/`, {
      method: "POST",
      body: JSON.stringify(data ?? {}),
    }),
  unpublishAdminCertificates: (yearId: string) =>
    apiFetch<unknown>(`/admin/academic-years/${yearId}/unpublish-certificates/`, {
      method: "POST",
    }),
  getAdminCertificatePreview: (yearId: string, draft?: Record<string, unknown>) =>
    draft
      ? apiFetch<unknown>(`/admin/academic-years/${yearId}/certificate-preview/`, {
          method: "POST",
          body: JSON.stringify(draft),
        })
      : apiFetch<unknown>(`/admin/academic-years/${yearId}/certificate-preview/`),
  getAdminClasses: () => apiList<unknown>("/admin/classes/"),
  createAdminClass: (data: unknown) =>
    apiFetch<unknown>("/admin/classes/", { method: "POST", body: JSON.stringify(data) }),
  deleteAdminClass: (id: string) =>
    apiFetch<void>(`/admin/classes/${id}/`, { method: "DELETE" }),
  getAdminClassDetail: (id: string) => apiFetch<unknown>(`/admin/classes/${id}/detail/`),
  updateAdminClassHomeroom: (id: string, homeroomTeacherId: string | null) =>
    apiFetch<unknown>(`/admin/classes/${id}/detail/`, {
      method: "PATCH",
      body: JSON.stringify({ homeroomTeacherId }),
    }),
  getAdminSubjects: () => apiList<unknown>("/admin/subjects/"),
  createAdminSubject: (data: unknown) =>
    apiFetch<unknown>("/admin/subjects/", { method: "POST", body: JSON.stringify(data) }),
  updateAdminSubject: (id: string, data: { name?: string; classIds?: number[] }) =>
    apiFetch<unknown>(`/admin/subjects/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  assignSubjectTeacher: (subjectId: string, teacherId: string, classIds?: string[]) =>
    apiFetch<unknown>(`/admin/subjects/${subjectId}/assign-teacher/`, {
      method: "POST",
      body: JSON.stringify({
        teacherId,
        ...(classIds?.length ? { classIds: classIds.map(Number) } : {}),
      }),
    }),
  syncSubjectSections: (
    subjectId: string,
    sections: Array<{ classId: string; teacherId: string | null }>
  ) =>
    apiFetch<unknown>(`/admin/subjects/${subjectId}/sync-sections/`, {
      method: "POST",
      body: JSON.stringify({
        sections: sections.map((row) => ({
          classId: Number(row.classId),
          teacherId: row.teacherId ? Number(row.teacherId) : null,
        })),
      }),
    }),
  deleteAdminSubject: (id: string) =>
    apiFetch<void>(`/admin/subjects/${id}/`, { method: "DELETE" }),
  getAdminSchedules: (type?: "exam" | "class") =>
    apiList<unknown>(type ? `/admin/schedules/?type=${type}` : "/admin/schedules/"),
  createAdminSchedule: (data: unknown) =>
    apiFetch<unknown>("/admin/schedules/", { method: "POST", body: JSON.stringify(data) }),
  updateAdminSchedule: (id: string, data: unknown) =>
    apiFetch<unknown>(`/admin/schedules/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteAdminSchedule: (id: string) =>
    apiFetch<void>(`/admin/schedules/${id}/`, { method: "DELETE" }),
  getAdminTeachers: () => apiList<unknown>("/admin/teachers/"),
  createAdminTeacher: (data: FormData | Record<string, unknown>) =>
    data instanceof FormData
      ? apiFormFetch<unknown>("/admin/teachers/", data, "POST")
      : apiFetch<unknown>("/admin/teachers/", { method: "POST", body: JSON.stringify(data) }),
  updateAdminTeacher: (id: string, data: FormData | Record<string, unknown>) =>
    data instanceof FormData
      ? apiFormFetch<unknown>(`/admin/teachers/${id}/`, data, "PATCH")
      : apiFetch<unknown>(`/admin/teachers/${id}/`, {
          method: "PATCH",
          body: JSON.stringify(data),
        }),
  resetAdminTeacherPassword: (id: string) =>
    apiFetch<unknown>(`/admin/teachers/${id}/reset-password/`, { method: "POST" }),
  deleteAdminTeacher: (id: string) =>
    apiFetch<void>(`/admin/teachers/${id}/`, { method: "DELETE" }),
  getAdminUsers: () => apiList<unknown>("/auth/users/"),
  createAdminUser: (data: unknown) =>
    apiFetch<unknown>("/auth/users/", { method: "POST", body: JSON.stringify(data) }),
  updateAdminUser: (id: string, data: unknown) =>
    apiFetch<unknown>(`/auth/users/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteAdminUser: (id: string) =>
    apiFetch<void>(`/auth/users/${id}/`, { method: "DELETE" }),
  resetAdminUserPassword: (id: string) =>
    apiFetch<unknown>(`/auth/users/${id}/reset-password/`, { method: "POST" }),
  getAdminFinance: () => apiList<unknown>("/admin/finance/payments/"),
  updateAdminPayment: (id: string, data: { status?: string; amount?: number }) =>
    apiFetch<unknown>(`/admin/finance/payments/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteAdminManualPayment: (id: string) =>
    apiFetch<void>(`/admin/finance/payments/${id}/`, { method: "DELETE" }),
  recordAdminManualPayment: (data: { studentId: string; amount: number; note?: string }) =>
    apiFetch<unknown>("/admin/finance/payments/manual/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAdminManualPayments: () => apiList<unknown>("/admin/finance/payments/manual/"),
  getAdminFeePlans: () => apiList<unknown>("/admin/finance/plans/"),
  createAdminFeePlan: (data: unknown) =>
    apiFetch<unknown>("/admin/finance/plans/", { method: "POST", body: JSON.stringify(data) }),
  updateAdminFeePlan: (id: string, data: unknown) =>
    apiFetch<unknown>(`/admin/finance/plans/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteAdminFeePlan: (id: string) =>
    apiFetch<void>(`/admin/finance/plans/${id}/`, { method: "DELETE" }),
  grantStudentFeeAccess: (studentId: string, days: number) =>
    apiFetch<{ accessOverrideUntil: string }>(`/admin/students/${studentId}/fee-access/`, {
      method: "POST",
      body: JSON.stringify({ days }),
    }),
  getAdminNews: () => apiList<unknown>("/admin/content/news/"),
  getAdminNewsItem: (id: string) => apiFetch<unknown>(`/admin/content/news/${id}/`),
  createAdminNews: (data: FormData | Record<string, unknown>) =>
    data instanceof FormData
      ? apiFormFetch<unknown>("/admin/content/news/", data, "POST")
      : apiFetch<unknown>("/admin/content/news/", {
          method: "POST",
          body: JSON.stringify(data),
        }),
  updateAdminNews: (id: string, data: unknown) =>
    apiFetch<unknown>(`/admin/content/news/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  updateAdminNewsImage: (id: string, formData: FormData) =>
    apiFormFetch<unknown>(`/admin/content/news/${id}/`, formData, "PATCH"),
  deleteAdminNews: (id: string) =>
    apiFetch<void>(`/admin/content/news/${id}/`, { method: "DELETE" }),

  getTeacherProfile: () => apiFetch<unknown>("/teacher/profile/"),
  getTeacherSchedules: () => apiList<unknown>("/teacher/schedules/"),
  getTeacherClasses: () => apiList<unknown>("/teacher/classes/"),
  getTeacherClassStudents: (classId: string) =>
    apiList<unknown>(`/teacher/classes/${classId}/`),
  updateTeacherGradebook: (classId: string, entries: unknown[]) =>
    apiList<unknown>(`/teacher/classes/${classId}/`, {
      method: "PATCH",
      body: JSON.stringify(entries),
    }),
  getTeacherHomework: (classId?: string) =>
    apiList<unknown>(classId ? `/teacher/homework/?classId=${classId}` : "/teacher/homework/"),
  createTeacherHomework: (formData: FormData) =>
    apiFormFetch<unknown>("/teacher/homework/", formData, "POST"),
  updateTeacherHomework: (id: string, formData: FormData) =>
    apiFormFetch<unknown>(`/teacher/homework/${id}/`, formData, "PATCH"),
  deleteTeacherHomework: (id: string, group = false) =>
    apiFetch<void>(group ? `/teacher/homework/${id}/?group=true` : `/teacher/homework/${id}/`, {
      method: "DELETE",
    }),
  getTeacherAssessments: () => apiFetch<unknown[]>("/teacher/assessments/"),
  getTeacherGradeScheme: (classIds: string[], subject?: string) => {
    const params = new URLSearchParams();
    for (const id of classIds) params.append("classIds", id);
    if (subject) params.set("subject", subject);
    const query = params.toString();
    return apiFetch<unknown>(`/teacher/grade-schemes/${query ? `?${query}` : ""}`);
  },
  saveTeacherGradeScheme: (data: {
    classIds: string[];
    subjects: string[];
    maxScore: number;
    components: unknown[];
  }) =>
    apiFetch<unknown>("/teacher/grade-schemes/", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  saveTeacherGradeSchemeEntries: (data: {
    classIds: string[];
    subjects: string[];
    activeSubject?: string;
    entries: unknown[];
  }) =>
    apiFetch<unknown>("/teacher/grade-schemes/", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  getTeacherAlerts: () => apiList<unknown>("/teacher/alerts/"),
  markTeacherAlertRead: (alertKey: string) =>
    apiFetch<{ ok: boolean }>("/teacher/alerts/read/", {
      method: "POST",
      body: JSON.stringify({ alertKey }),
    }),
  gradeTeacherHomeworkSubmission: (
    homeworkId: string,
    submissionId: string,
    data: { score?: number | null; teacherNote?: string; maxScore?: number }
  ) =>
    apiFetch<unknown>(`/teacher/homework/${homeworkId}/submissions/${submissionId}/grade/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  getTeacherQuizzes: (classId?: string) =>
    apiList<unknown>(classId ? `/teacher/quizzes/?classId=${classId}` : "/teacher/quizzes/"),
  createTeacherQuiz: (data: unknown) =>
    apiFetch<unknown>("/teacher/quizzes/", { method: "POST", body: JSON.stringify(data) }),
  updateTeacherQuiz: (id: string, data: unknown) =>
    apiFetch<unknown>(`/teacher/quizzes/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTeacherQuiz: (id: string, group = false) =>
    apiFetch<void>(group ? `/teacher/quizzes/${id}/?group=true` : `/teacher/quizzes/${id}/`, {
      method: "DELETE",
    }),
  getTeacherQuizGradingBundle: (quizId: string) =>
    apiFetch<unknown>(`/teacher/quizzes/${quizId}/grading-bundle/`),
  gradeTeacherQuizSubmission: (
    quizId: string,
    submissionId: string,
    data: { manualScores?: Record<string, number | null>; teacherNote?: string }
  ) =>
    apiFetch<unknown>(`/teacher/quizzes/${quizId}/submissions/${submissionId}/grade/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  getTeacherAnnouncements: (classId?: string) =>
    apiList<unknown>(classId ? `/teacher/announcements/?classId=${classId}` : "/teacher/announcements/"),
  createTeacherAnnouncement: (data: unknown) =>
    apiFetch<unknown>("/teacher/announcements/", { method: "POST", body: JSON.stringify(data) }),
  updateTeacherAnnouncement: (id: string, data: unknown) =>
    apiFetch<unknown>(`/teacher/announcements/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTeacherAnnouncement: (id: string, group = false) =>
    apiFetch<void>(group ? `/teacher/announcements/${id}/?group=true` : `/teacher/announcements/${id}/`, {
      method: "DELETE",
    }),
  getTeacherMaterials: (classId?: string) =>
    apiList<unknown>(classId ? `/teacher/materials/?classId=${classId}` : "/teacher/materials/"),
  createTeacherMaterial: (formData: FormData) =>
    apiFormFetch<unknown>("/teacher/materials/", formData, "POST"),
  updateTeacherMaterial: (id: string, formData: FormData) =>
    apiFormFetch<unknown>(`/teacher/materials/${id}/`, formData, "PATCH"),
  deleteTeacherMaterial: (id: string, group = false) =>
    apiFetch<void>(group ? `/teacher/materials/${id}/?group=true` : `/teacher/materials/${id}/`, {
      method: "DELETE",
    }),

  getParentAlerts: () => apiList<unknown>("/parent/alerts/"),
  dismissParentAlert: (alertId: string) =>
    apiFetch<{ ok: boolean }>("/parent/alerts/dismiss/", {
      method: "POST",
      body: JSON.stringify({ alertId }),
    }),
  getParentChild: () => apiFetch<unknown>("/parent/child/"),
  getParentStudent: () => apiFetch<unknown>("/parent/student/"),
  getParentSchedules: (type?: "exam" | "class") =>
    apiList<unknown>(type ? `/parent/schedules/?type=${type}` : "/parent/schedules/"),
  getParentGrades: () => apiList<unknown>("/parent/grades/"),
  getParentGradesNotification: () =>
    apiFetch<{ hasNew: boolean; count: number }>("/parent/grades/notification/"),
  getParentCertificates: () => apiFetch<unknown>("/parent/certificates/"),
  getParentAssessments: () => apiList<unknown>("/parent/assessments/"),
  getParentFees: () =>
    apiFetch<{ student: unknown; notices: unknown[]; feeStatus: unknown }>("/parent/fees/"),
  submitParentPayment: (data: FormData) =>
    apiFormFetch<unknown>("/parent/fees/", data, "POST"),
  getParentHomework: () => apiList<unknown>("/parent/homework/"),
  getParentHomeworkDetail: (id: string) => apiFetch<unknown>(`/parent/homework/${id}/`),
  getParentHomeworkBySubject: () => apiFetch<unknown[]>("/parent/homework/by-subject/"),
  getParentSubjects: () => apiList<unknown>("/parent/subjects/"),
  getParentSubjectDetail: (subject: string) =>
    apiFetch<unknown>(`/parent/subjects/${encodeURIComponent(subject)}/`),
  getParentQuizzes: () => apiList<unknown>("/parent/quizzes/"),
  getParentQuizReview: (quizId: string) =>
    apiFetch<{ quiz: unknown; submission: unknown }>(`/parent/quizzes/${quizId}/review/`),
  submitParentHomework: (formData: FormData) =>
    apiFormFetch<unknown>("/parent/homework/", formData, "POST"),
  submitParentQuiz: (formData: FormData) =>
    apiFormFetch<unknown>("/parent/quizzes/", formData, "POST"),
  getParentSubmissions: () =>
    apiFetch<{ homework: unknown[]; quizzes: unknown[] }>("/parent/submissions/"),
};
