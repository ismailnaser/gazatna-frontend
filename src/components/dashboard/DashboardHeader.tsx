"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/atoms/Logo";
import { PwaInstallButton } from "@/components/molecules/PwaInstallButton";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { roleLabels } from "@/data/navigation";

export function DashboardHeader({ displayName }: { displayName?: string } = {}) {
  const { user, logout } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const name = displayName?.trim() || user?.name;

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 rounded-b-[1.5rem] border-b-[3px] border-brand-yellow bg-[#fff8ec] px-3 shadow-[-3px_4px_0_0_rgba(249,180,40,0.28)] sm:px-5">
        <div className="flex min-w-0 shrink-0 items-center">
          <Logo variant="full" />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <PwaInstallButton iconOnly />
          {user && (
            <div className="rounded-full border-2 border-black/5 bg-white px-3 py-1 text-end">
              <p className="text-sm font-extrabold text-p-black">{name}</p>
              <p className="text-[11px] font-bold text-brand-blue">{roleLabels[user.role]}</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setConfirmLogout(true)}
            className="flex items-center gap-2 rounded-full bg-brand-orange/10 px-3 py-2 text-sm font-extrabold text-brand-orange hover:bg-brand-orange/20"
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
