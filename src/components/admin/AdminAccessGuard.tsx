"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { canAccessAdminPath, isAdminRole } from "@/lib/adminRoles";

export function AdminAccessGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user || !isAdminRole(user.role)) return;
    if (!canAccessAdminPath(user.role, pathname)) {
      router.replace("/admin");
    }
  }, [user, loading, pathname, router]);

  if (loading || !user || !isAdminRole(user.role)) {
    return null;
  }

  if (!canAccessAdminPath(user.role, pathname)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-neutral-500">
        جاري التحويل...
      </div>
    );
  }

  return <>{children}</>;
}
