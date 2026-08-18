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
import {
  AUTH_STORAGE_KEYS,
  ensureAuthSync,
  hasStoredAuthTokens,
  pathNeedsAuthSession,
  requestSessionFromPeers,
  subscribeAuthSync,
} from "@/lib/authStorage";
import type { AuthUser } from "@/types";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function parseStoredUser(raw: string | null): AuthUser | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    ensureAuthSync();

    const hydrate = async () => {
      let stored = getStoredAuthUser();
      if (!stored && !hasStoredAuthTokens() && pathNeedsAuthSession(window.location.pathname)) {
        await requestSessionFromPeers(250);
        stored = getStoredAuthUser();
      }
      if (cancelled) return;

      stored = getStoredAuthUser();
      if (stored) {
        setUser(stored);
        setLoading(false);
        void fetchCurrentUser().then((fresh) => {
          if (cancelled) return;
          if (fresh) setUser(fresh);
        });
        return;
      }

      if (hasStoredAuthTokens()) {
        const fresh = await fetchCurrentUser();
        if (cancelled) return;
        setUser(fresh);
        setLoading(false);
        return;
      }

      setLoading(false);
    };

    void hydrate();

    const unsubscribe = subscribeAuthSync((userJson) => {
      const next = parseStoredUser(userJson);
      setUser(next);
      if (next) {
        setLoading(false);
        return;
      }
      if (pathNeedsAuthSession(window.location.pathname) && window.location.pathname !== "/login") {
        router.replace("/login");
      }
    });

    const onStorage = (event: StorageEvent) => {
      if (event.key && !AUTH_STORAGE_KEYS.includes(event.key as (typeof AUTH_STORAGE_KEYS)[number])) {
        return;
      }
      const stored = getStoredAuthUser();
      setUser(stored);
      if (stored) {
        setLoading(false);
        return;
      }
      if (pathNeedsAuthSession(window.location.pathname) && window.location.pathname !== "/login") {
        router.replace("/login");
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, [router]);

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
