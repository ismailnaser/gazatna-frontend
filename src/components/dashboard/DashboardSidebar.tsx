"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getDashboardNav, groupDashboardNav } from "@/data/navigation";
import { api } from "@/lib/api";
import { countPendingTeacherAlerts } from "@/lib/teacherAlerts";
import { cn } from "@/lib/utils";
import { isAdminRole } from "@/lib/adminRoles";
import type { UserRole, TeacherAlert } from "@/types";

/** One finance-badge analytics fetch per browser tab lifetime. */
let adminFinanceBadgeFetched = false;

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-extrabold transition-transform hover:-translate-y-0.5",
        active
          ? "bg-brand-yellow text-p-black shadow-[-2px_2px_0_0_rgba(234,102,34,0.4)]"
          : "text-p-black/70 hover:bg-brand-blue/10 hover:text-brand-blue"
      )}
    >
      <Icon className="h-4.5 w-4.5 h-5 w-5 shrink-0" />
      <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <span className="truncate">{label}</span>
        {badge && badge > 0 ? (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand-orange px-1.5 py-0.5 text-[10px] font-bold text-white">
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export function DashboardSidebar({
  role,
  newGradesCount = 0,
}: {
  role: UserRole;
  newGradesCount?: number;
}) {
  const pathname = usePathname();
  const items = getDashboardNav(role);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [pendingSubmissions, setPendingSubmissions] = useState(0);

  const uniqueItems = items.filter(
    (item, index, arr) => arr.findIndex((i) => i.href === item.href) === index
  );

  const basePath = isAdminRole(role) ? "/admin" : `/${role}`;
  const grouped = useMemo(() => groupDashboardNav(uniqueItems), [uniqueItems]);

  useEffect(() => {
    if (!isAdminRole(role)) return;
    if (adminFinanceBadgeFetched) return;
    const timer = window.setTimeout(() => {
      if (adminFinanceBadgeFetched) return;
      adminFinanceBadgeFetched = true;
      api
        .getAdminAnalytics({ section: "badge" })
        .then((res) => {
          const row = res as Record<string, unknown>;
          const count = Number(row.pendingPayments ?? 0);
          setPendingPayments(Number.isFinite(count) ? count : 0);
        })
        .catch(() => setPendingPayments(0));
    }, 2800);
    return () => window.clearTimeout(timer);
  }, [role]);

  useEffect(() => {
    if (role !== "teacher") return;
    const timer = window.setTimeout(() => {
      api
        .getTeacherAlerts()
        .then((data) => {
          setPendingSubmissions(countPendingTeacherAlerts(data as TeacherAlert[]));
        })
        .catch(() => setPendingSubmissions(0));
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [role]);

  function badgeFor(href: string) {
    if (isAdminRole(role) && href === "/admin/finance") return pendingPayments;
    if (role === "teacher" && href === "/teacher/grade-entry") return pendingSubmissions;
    if (role === "parent" && href === "/parent/grades") return newGradesCount;
    return 0;
  }

  function isActive(href: string) {
    return pathname === href || (href !== basePath && pathname.startsWith(href));
  }

  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 overflow-y-auto border-s-2 border-brand-yellow/50 bg-[#fff8ec] md:block">
      <nav className="flex flex-col gap-1 p-3">
        {grouped
          ? grouped.map((group) => (
              <div key={group.id} className="mb-3">
                <p className="px-3 pb-1.5 pt-2 text-[11px] font-bold tracking-wide text-p-black/45">
                  {group.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.href + item.label}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      active={isActive(item.href)}
                      badge={badgeFor(item.href)}
                    />
                  ))}
                </div>
              </div>
            ))
          : uniqueItems.map((item) => (
              <NavLink
                key={item.href + item.label}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(item.href)}
                badge={badgeFor(item.href)}
              />
            ))}
      </nav>
    </aside>
  );
}
