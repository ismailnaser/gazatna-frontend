"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDashboardNav } from "@/data/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

export function MobileNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = getDashboardNav(role).filter(
    (item, index, arr) => arr.findIndex((i) => i.href === item.href) === index
  );

  return (
    <nav className="fixed bottom-0 start-0 end-0 z-40 flex border-t border-neutral-200 bg-white md:hidden">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href + item.label}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium",
              active ? "text-p-green" : "text-p-black/50"
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
