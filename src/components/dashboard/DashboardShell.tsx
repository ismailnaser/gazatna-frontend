"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardLoadingState } from "./DashboardLoadingState";
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
  const fallbackRole = areaFallbackRole(area);

  useEffect(() => {
    if (!loading && (!user || !canAccess(user.role, area))) {
      router.replace("/login");
    }
  }, [user, loading, area, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <DashboardHeader />
        <div className="flex flex-1">
          <DashboardSidebar role={user?.role ?? fallbackRole} />
          <main className="flex-1 overflow-auto p-4 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:pt-6 md:pb-6 lg:p-8">
            <DashboardLoadingState
              message="جاري تحميل حسابك..."
              hint="نتحقق من جلسة الدخول ونجهّز لوحة التحكم"
            />
          </main>
        </div>
        <MobileNav role={user?.role ?? fallbackRole} />
      </div>
    );
  }

  if (!user || !canAccess(user.role, area)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <DashboardLoadingState
          message="جاري التحويل..."
          hint="يتم توجيهك إلى صفحة الدخول"
          className="w-full max-w-md"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar role={user.role} />
        <main className="flex-1 overflow-auto p-4 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:pt-6 md:pb-6 lg:p-8">
          {children}
        </main>
      </div>
      <MobileNav role={user.role} />
    </div>
  );
}
