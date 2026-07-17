"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/atoms/Logo";
import { PwaInstallButton } from "@/components/molecules/PwaInstallButton";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { roleLabels } from "@/data/navigation";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 sm:px-6">
        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <Logo variant="full" />
        </div>

        <div className="flex min-w-0 flex-1 justify-center">
          <PwaInstallButton compact />
        </div>

        <div className="flex shrink-0 items-center gap-4">
          {user && (
            <div className="text-end">
              <p className="text-sm font-semibold text-p-black">{user.name}</p>
              <p className="text-xs text-p-black/50">{roleLabels[user.role]}</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setConfirmLogout(true)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-p-black/60 hover:bg-neutral-100"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </header>

      <ConfirmDialog
        open={confirmLogout}
        title="تأكيد تسجيل الخروج"
        description="هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟"
        confirmLabel="تسجيل الخروج"
        cancelLabel="إلغاء"
        onConfirm={() => {
          setConfirmLogout(false);
          logout();
        }}
        onCancel={() => setConfirmLogout(false)}
      />
    </>
  );
}
