"use client";

import { usePathname } from "next/navigation";
import { AppLoadingScreen } from "@/components/molecules/AppLoadingScreen";
import { useAuth } from "@/context/AuthContext";
import { pathNeedsAuthSession } from "@/lib/authStorage";

export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();

  if (!pathNeedsAuthSession(pathname)) {
    return <>{children}</>;
  }

  if (authLoading && !user) {
    return <AppLoadingScreen />;
  }

  return <>{children}</>;
}
