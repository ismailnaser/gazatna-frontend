import type { AuthUser, UserRole } from "@/types";

const STORAGE_KEY = "ghazatna_auth";

const demoUsers: Record<string, AuthUser> = {
  "admin@ghazatna.edu.ps": { id: "u1", name: "محمد الإداري", email: "admin@ghazatna.edu.ps", role: "admin" },
  "teacher@ghazatna.edu.ps": { id: "u2", name: "أحمد المعلم", email: "teacher@ghazatna.edu.ps", role: "teacher" },
  "parent@ghazatna.edu.ps": { id: "u3", name: "خالد ولي الأمر", email: "parent@ghazatna.edu.ps", role: "parent" },
};

export function login(email: string, _password: string): AuthUser | null {
  const user = demoUsers[email.toLowerCase()];
  if (!user) return null;
  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
  return user;
}

export function logout() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getDashboardPath(role: UserRole): string {
  return `/${role}`;
}
