"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useParentGradesNotification } from "@/hooks/useParentGradesNotification";
import { useParentStudent } from "@/hooks/useParentStudent";
import { AppLoadingScreen } from "@/components/molecules/AppLoadingScreen";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { MobileNav } from "./MobileNav";
import { isAdminRole } from "@/lib/adminRoles";
import type { UserRole } from "@/types";

type DashboardArea = "admin" | "teacher" | "parent";

function canAccess(userRole: UserRole, area: DashboardArea): boolean {
  if (area === "admin") return isAdminRole(userRole);
  return userRole === area;
}

function areaFallbackRole(area: DashboardArea): UserRole {
  if (area === "admin") return "admin";
  return area;
}

export function DashboardShell({
  area,
  children,
}: {
  area: DashboardArea;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const fallbackRole = areaFallbackRole(area);
  const newGradesCount = useParentGradesNotification(user?.role ?? fallbackRole, pathname);
  const { student } = useParentStudent(area === "parent");

  useEffect(() => {
    if (!loading && (!user || !canAccess(user.role, area))) {
      router.replace("/login");
    }
  }, [user, loading, area, router]);

  if (loading && !user) {
    return <AppLoadingScreen />;
  }

  if (!user || !canAccess(user.role, area)) {
    return <AppLoadingScreen />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <DashboardHeader displayName={area === "parent" ? student?.name : undefined} />
      <div className="flex min-h-0 flex-1">
        <DashboardSidebar role={user.role} newGradesCount={newGradesCount} />
        <main className="min-w-0 flex-1 overflow-auto bg-white p-4 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:pt-6 md:pb-8 lg:px-8 lg:pt-8">
          {children}
        </main>
      </div>
      <MobileNav role={user.role} newGradesCount={newGradesCount} />
    </div>
  );
}
