"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchCurrentUser,
  getDashboardPath,
  getStoredAuthUser,
  login as authLogin,
  logout as authLogout,
} from "@/lib/auth";
import type { AuthUser } from "@/types";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredAuthUser();
    if (stored) {
      setUser(stored);
      fetchCurrentUser().then((fresh) => {
        if (fresh) setUser(fresh);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await authLogin(username, password);
      if (!result) return false;
      setUser(result);
      router.replace(getDashboardPath(result.role));
      return true;
    },
    [router]
  );

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
