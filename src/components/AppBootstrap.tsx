"use client";

import { AppLoadingScreen } from "@/components/molecules/AppLoadingScreen";
import { useAuth } from "@/context/AuthContext";

export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return <AppLoadingScreen />;
  }

  return <>{children}</>;
}
