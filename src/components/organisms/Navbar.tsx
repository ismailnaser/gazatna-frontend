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
import { getDashboardPath } from "@/lib/auth";
import { cn } from "@/lib/utils";

const headerLinks = publicNavLinks.filter((link) => link.href !== "/register");

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);
  const authHref = isLoggedIn ? getDashboardPath(user!.role) : "/login";
  const authLabel = isLoggedIn ? "لوحة التحكم" : "دخول";
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
        "fixed inset-x-0 top-0 z-50 rounded-b-[1.75rem] border-b-[3px] border-brand-yellow bg-[#fff8ec]/95 transition-shadow duration-150",
        scrolled && "shadow-[-4px_6px_0_0_rgba(249,180,40,0.35)] backdrop-blur-md"
      )}
    >
      <nav className="flex h-16 items-center gap-3 px-3 sm:px-5 lg:h-[4.25rem] lg:px-6">
        <div className="flex min-w-0 shrink-0 items-center">
          <Logo variant="full" />
        </div>

        <ul className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
          {headerLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  prefetch={false}
                  className={cn(
                    "font-display inline-flex rounded-full px-3 py-1.5 text-sm font-extrabold transition",
                    active
                      ? "bg-brand-yellow text-p-black"
                      : "text-p-black/70 hover:bg-white hover:text-brand-blue"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ms-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href={authHref}
            prefetch={false}
            className="hidden items-center gap-1.5 px-2 py-1.5 text-sm font-extrabold text-p-black/70 hover:text-brand-blue lg:flex"
          >
            <AuthIcon className="h-4 w-4" />
            {authLabel}
          </Link>
          <Link
            href={authHref}
            prefetch={false}
            aria-label={authLabel}
            className="flex h-9 w-9 items-center justify-center rounded-full text-p-black/75 hover:bg-white hover:text-brand-blue lg:hidden"
          >
            <AuthIcon className="h-5 w-5" />
          </Link>

          <Button
            href="/register"
            variant="primary"
            className="rounded-full px-3 py-2 text-xs sm:px-4 sm:text-sm"
          >
            سجّل الآن
          </Button>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-yellow text-p-black lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <PwaInstallButton iconOnly />
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-brand-yellow/40 bg-[#fff8ec] lg:hidden"
          >
            <ul className="flex flex-col gap-1 px-3 py-3">
              {publicNavLinks.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      prefetch={false}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "font-display flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-extrabold",
                        active ? "bg-brand-yellow text-p-black" : "text-p-black/80 hover:bg-white"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
