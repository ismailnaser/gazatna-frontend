"use client";

import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap, LogIn, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { publicNavLinks } from "@/data/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <GraduationCap className="h-8 w-8 text-[#064e3b]" strokeWidth={1.5} />
          <span className="text-xl font-bold tracking-tight text-[#064e3b] sm:text-2xl">
            مدرسة غَزتنا
          </span>
        </Link>

        <ul className="hidden items-center lg:flex">
          {publicNavLinks.map((link, i) => (
            <li key={link.href} className="flex items-center">
              {i > 0 && (
                <span className="mx-3 text-neutral-300" aria-hidden>
                  |
                </span>
              )}
              <Link
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-[#064e3b]"
                    : "text-neutral-800 hover:text-[#064e3b]"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-neutral-800 transition-colors hover:bg-[#064e3b]/10 hover:text-[#064e3b]"
          >
            <LogIn className="h-4 w-4" />
            تسجيل الدخول
          </Link>
          <Button href="/register" variant="accent" className="rounded-lg px-6">
            سجّل الآن
          </Button>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-800 hover:bg-neutral-100 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-neutral-100 lg:hidden"
          >
            <ul className="flex flex-col gap-1 px-4 py-3">
              {publicNavLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-800 hover:bg-[#064e3b]/10 hover:text-[#064e3b]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="flex gap-2 pt-2">
                <Button href="/login" variant="outline" className="flex-1">
                  تسجيل الدخول
                </Button>
                <Button href="/register" variant="accent" className="flex-1">
                  سجّل الآن
                </Button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
