"use client";

import { GraduationCap, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { roleLabels } from "@/data/navigation";

export function DashboardHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <GraduationCap className="h-7 w-7 text-p-green" />
        <span className="hidden font-bold text-p-green sm:inline">مدرسة غَزتنا</span>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="text-end">
            <p className="text-sm font-semibold text-p-black">{user.name}</p>
            <p className="text-xs text-p-black/50">{roleLabels[user.role]}</p>
          </div>
        )}
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-p-black/60 hover:bg-neutral-100"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">خروج</span>
        </button>
      </div>
    </header>
  );
}
