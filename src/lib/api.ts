const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const TOKEN_KEY = "ghazatna_access";
const REFRESH_KEY = "ghazatna_refresh";
const USER_KEY = "ghazatna_auth";

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
  const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
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
          : "حدث خطأ في الاتصال بالخادم";
  const err = await res.json().catch(() => null);
  return formatApiError(err, fallback);
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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  let token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    throw new Error(await parseFailedResponse(res));
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
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
    return fetch(`${API_BASE}${path}`, {
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
  getPrograms: () => apiList<unknown>("/content/programs/"),
  getActivities: () => apiList<unknown>("/content/activities/"),
  getAlumni: () => apiList<unknown>("/content/alumni/"),
  getPolicies: () => apiList<unknown>("/content/policies/"),
  getAccreditations: () => apiList<unknown>("/content/accreditations/"),
  getSchoolValues: () => apiList<unknown>("/content/values/"),
  getTeachers: () => apiList<unknown>("/staff/teachers/"),
  getStats: () => apiList<unknown>("/content/stats/"),

  getAdminAnalytics: () => apiFetch<unknown>("/admin/analytics/"),
  getAdminStudents: () => apiList<unknown>("/admin/students/"),
  createAdminStudent: (data: unknown) =>
    apiFetch<unknown>("/admin/students/", { method: "POST", body: JSON.stringify(data) }),
  updateAdminStudent: (id: string, data: unknown) =>
    apiFetch<unknown>(`/admin/students/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  getAdminClasses: () => apiList<unknown>("/admin/classes/"),
  createAdminClass: (data: unknown) =>
    apiFetch<unknown>("/admin/classes/", { method: "POST", body: JSON.stringify(data) }),
  deleteAdminClass: (id: string) =>
    apiFetch<void>(`/admin/classes/${id}/`, { method: "DELETE" }),
  getAdminSubjects: () => apiList<unknown>("/admin/subjects/"),
  createAdminSubject: (data: unknown) =>
    apiFetch<unknown>("/admin/subjects/", { method: "POST", body: JSON.stringify(data) }),
  deleteAdminSubject: (id: string) =>
    apiFetch<void>(`/admin/subjects/${id}/`, { method: "DELETE" }),
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
  deleteAdminTeacher: (id: string) =>
    apiFetch<void>(`/admin/teachers/${id}/`, { method: "DELETE" }),
  getAdminUsers: () => apiList<unknown>("/auth/users/"),
  createAdminUser: (data: unknown) =>
    apiFetch<unknown>("/auth/users/", { method: "POST", body: JSON.stringify(data) }),
  updateAdminUser: (id: string, data: unknown) =>
    apiFetch<unknown>(`/auth/users/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteAdminUser: (id: string) =>
    apiFetch<void>(`/auth/users/${id}/`, { method: "DELETE" }),
  getAdminFinance: () => apiList<unknown>("/admin/finance/payments/"),
  updateAdminPayment: (id: string, status: string) =>
    apiFetch<unknown>(`/admin/finance/payments/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  getAdminNews: () => apiList<unknown>("/admin/content/news/"),
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
  createTeacherHomework: (data: unknown) =>
    apiFetch<unknown>("/teacher/homework/", { method: "POST", body: JSON.stringify(data) }),
  updateTeacherHomework: (id: string, data: unknown) =>
    apiFetch<unknown>(`/teacher/homework/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTeacherHomework: (id: string) =>
    apiFetch<void>(`/teacher/homework/${id}/`, { method: "DELETE" }),
  getTeacherQuizzes: (classId?: string) =>
    apiList<unknown>(classId ? `/teacher/quizzes/?classId=${classId}` : "/teacher/quizzes/"),
  createTeacherQuiz: (data: unknown) =>
    apiFetch<unknown>("/teacher/quizzes/", { method: "POST", body: JSON.stringify(data) }),
  updateTeacherQuiz: (id: string, data: unknown) =>
    apiFetch<unknown>(`/teacher/quizzes/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTeacherQuiz: (id: string) =>
    apiFetch<void>(`/teacher/quizzes/${id}/`, { method: "DELETE" }),

  getParentAlerts: () => apiList<unknown>("/parent/alerts/"),
  getParentChild: () => apiFetch<unknown>("/parent/child/"),
  getParentStudent: () => apiFetch<unknown>("/parent/student/"),
  getParentGrades: () => apiList<unknown>("/parent/grades/"),
  getParentFees: () => apiFetch<{ student: unknown; notices: unknown[] }>("/parent/fees/"),
  getParentHomework: () => apiList<unknown>("/parent/homework/"),
  getParentQuizzes: () => apiList<unknown>("/parent/quizzes/"),
  submitParentHomework: (homeworkId: string, content: string) =>
    apiFetch<unknown>("/parent/homework/", {
      method: "POST",
      body: JSON.stringify({ homeworkId, content }),
    }),
  submitParentQuiz: (data: unknown) =>
    apiFetch<unknown>("/parent/quizzes/", { method: "POST", body: JSON.stringify(data) }),
  getParentSubmissions: () =>
    apiFetch<{ homework: unknown[]; quizzes: unknown[] }>("/parent/submissions/"),
};
