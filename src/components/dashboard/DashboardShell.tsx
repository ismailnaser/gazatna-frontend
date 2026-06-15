"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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

export function DashboardShell({
  area,
  children,
}: {
  area: DashboardArea;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !canAccess(user.role, area))) {
      router.replace("/login");
    }
  }, [user, loading, area, router]);

  if (loading || !user || !canAccess(user.role, area)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-p-black/50">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar role={user.role} />
        <main className="flex-1 overflow-auto p-4 pb-20 sm:p-6 md:pb-6 lg:p-8">
          {children}
        </main>
      </div>
      <MobileNav role={user.role} />
    </div>
  );
}
