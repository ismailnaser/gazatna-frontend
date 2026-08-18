import { api, clearTokens, getStoredUser, setStoredUser, setTokens } from "@/lib/api";
import { isAdminRole } from "@/lib/adminRoles";
import type { AuthUser, UserRole } from "@/types";

export async function login(username: string, password: string): Promise<AuthUser | null> {
  try {
    const data = await api.login(username, password);
    const user = data.user as AuthUser;
    setTokens(data.access, data.refresh);
    setStoredUser(user);
    return user;
  } catch {
    return null;
  }
}

export function logout() {
  clearTokens();
}

export function getStoredAuthUser(): AuthUser | null {
  return getStoredUser<AuthUser>();
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const user = (await api.me()) as AuthUser;
    setStoredUser(user);
    return user;
  } catch {
    return getStoredAuthUser();
  }
}

export function getDashboardPath(role: UserRole): string {
  if (isAdminRole(role)) return "/admin";
  return `/${role}`;
}
