"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getDashboardNav } from "@/data/navigation";
import { api } from "@/lib/api";
import { countPendingTeacherAlerts } from "@/lib/teacherAlerts";
import { cn } from "@/lib/utils";
import { isAdminRole } from "@/lib/adminRoles";
import type { UserRole, TeacherAlert } from "@/types";

export function DashboardSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = getDashboardNav(role);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [pendingSubmissions, setPendingSubmissions] = useState(0);

  const uniqueItems = items.filter(
    (item, index, arr) => arr.findIndex((i) => i.href === item.href) === index
  );

  const basePath = isAdminRole(role) ? "/admin" : `/${role}`;

  useEffect(() => {
    if (!isAdminRole(role)) return;
    api
      .getAdminAnalytics()
      .then((res) => {
        const row = res as Record<string, unknown>;
        const count = Number(row.pendingPayments ?? 0);
        setPendingPayments(Number.isFinite(count) ? count : 0);
      })
      .catch(() => setPendingPayments(0));
  }, [role, pathname]);

  useEffect(() => {
    if (role !== "teacher") return;
    api
      .getTeacherAlerts()
      .then((data) => {
        setPendingSubmissions(countPendingTeacherAlerts(data as TeacherAlert[]));
      })
      .catch(() => setPendingSubmissions(0));
  }, [role, pathname]);

  return (
    <aside className="hidden w-56 shrink-0 border-s border-neutral-200 bg-white md:block">
      <nav className="flex flex-col gap-1 p-4">
        {uniqueItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== basePath && pathname.startsWith(item.href));
          const Icon = item.icon;
          const showFinanceBadge = isAdminRole(role) && item.href === "/admin/finance" && pendingPayments > 0;
          const showTeacherBadge =
            role === "teacher" && item.href === "/teacher/grade-entry" && pendingSubmissions > 0;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-p-green/10 text-p-green"
                  : "text-p-black/60 hover:bg-neutral-50 hover:text-p-black"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="flex flex-1 items-center justify-between gap-2">
                <span>{item.label}</span>
                {showFinanceBadge && (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-p-red px-2 py-0.5 text-xs font-bold text-white">
                    {pendingPayments}
                  </span>
                )}
                {showTeacherBadge && (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                    {pendingSubmissions}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
