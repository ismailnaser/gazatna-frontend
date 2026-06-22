"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogIn, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PwaInstallButton } from "@/components/molecules/PwaInstallButton";
import { Button } from "@/components/atoms/Button";
import { Logo } from "@/components/atoms/Logo";
import { useAuth } from "@/context/AuthContext";
import { publicNavLinks } from "@/data/navigation";
import { getDashboardPath, getStoredAuthUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const sessionUser = user ?? (loading ? getStoredAuthUser() : null);
  const isLoggedIn = Boolean(sessionUser);
  const authHref = isLoggedIn ? getDashboardPath(sessionUser!.role) : "/login";
  const authLabel = isLoggedIn ? "لوحة التحكم" : "تسجيل الدخول";
  const AuthIcon = isLoggedIn ? LayoutDashboard : LogIn;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-150",
        scrolled ? "bg-white shadow-sm" : "bg-transparent"
      )}
    >
      <nav className="mx-auto grid h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 sm:gap-4 sm:px-6 lg:h-[4.5rem] lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Logo variant="full" />
        </div>

        <div className="hidden items-center justify-center gap-5 lg:flex">
          <ul className="flex items-center">
            {publicNavLinks.map((link, i) => (
              <li key={link.href} className="flex items-center">
                {i > 0 && (
                  <span className="mx-3 text-brand-black/20" aria-hidden>
                    |
                  </span>
                )}
                <Link
                  href={link.href}
                  className={cn(
                    "text-sm font-semibold transition-colors",
                    pathname === link.href
                      ? "text-brand-blue"
                      : "text-brand-black/80 hover:text-brand-blue"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <PwaInstallButton />
        </div>

        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-3">
          <Link
            href={authHref}
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-brand-black/80 transition-colors hover:text-brand-blue lg:flex"
          >
            <AuthIcon className="h-4 w-4" />
            {authLabel}
          </Link>
          <Link
            href={authHref}
            aria-label={authLabel}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-black/80 transition-colors hover:bg-black/5 hover:text-brand-blue lg:hidden"
          >
            <AuthIcon className="h-5 w-5" />
          </Link>

          <Button
            href="/register"
            variant="primary"
            className="rounded-full px-3 py-2 text-xs shadow-md sm:px-5 sm:py-2.5 sm:text-sm lg:px-6"
          >
            سجّل الآن
          </Button>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-black hover:bg-black/5 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-brand-black/10 bg-white lg:hidden"
          >
            <ul className="flex flex-col gap-1 px-4 py-3">
              {publicNavLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-black/80 hover:text-brand-blue"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="px-3 py-2">
                <PwaInstallButton className="w-full [&>button]:w-full" />
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
