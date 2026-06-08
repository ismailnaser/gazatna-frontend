"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { MobileNav } from "./MobileNav";
import type { UserRole } from "@/types";

export function DashboardShell({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== role)) {
      router.replace("/login");
    }
  }, [user, loading, role, router]);

  if (loading || !user || user.role !== role) {
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
        <DashboardSidebar role={role} />
        <main className="flex-1 overflow-auto p-4 pb-20 sm:p-6 md:pb-6 lg:p-8">
          {children}
        </main>
      </div>
      <MobileNav role={role} />
    </div>
  );
}
