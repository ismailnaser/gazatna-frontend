"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDashboardNav } from "@/data/navigation";
import { cn } from "@/lib/utils";
import { isAdminRole } from "@/lib/adminRoles";
import type { UserRole } from "@/types";

export function DashboardSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = getDashboardNav(role);

  const uniqueItems = items.filter(
    (item, index, arr) => arr.findIndex((i) => i.href === item.href) === index
  );

  const basePath = isAdminRole(role) ? "/admin" : `/${role}`;

  return (
    <aside className="hidden w-56 shrink-0 border-s border-neutral-200 bg-white md:block">
      <nav className="flex flex-col gap-1 p-4">
        {uniqueItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== basePath && pathname.startsWith(item.href));
          const Icon = item.icon;
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
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
