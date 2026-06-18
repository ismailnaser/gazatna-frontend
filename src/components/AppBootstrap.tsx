"use client";

import { useEffect, useState } from "react";
import { AppLoadingScreen } from "@/components/molecules/AppLoadingScreen";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import { isAdminRole } from "@/lib/adminRoles";

export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { loading: schoolLoading } = useSchool();
  const needsSchoolData =
    user?.role === "teacher" || Boolean(user?.role && isAdminRole(user.role));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!authLoading && (!needsSchoolData || !schoolLoading)) {
      setReady(true);
    } else {
      setReady(false);
    }
  }, [authLoading, schoolLoading, needsSchoolData]);

  if (!ready) {
    return <AppLoadingScreen />;
  }

  return <>{children}</>;
}
