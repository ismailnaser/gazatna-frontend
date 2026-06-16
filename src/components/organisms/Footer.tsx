"use client";

import { useEffect, useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/atoms/Logo";
import { publicNavLinks } from "@/data/navigation";
import { api } from "@/lib/api";

type ContactSettings = {
  address: string;
  phone: string;
  email: string;
  footerTagline: string;
};

const DEFAULT: ContactSettings = {
  address: "غزة، فلسطين",
  phone: "+970 599 000 000",
  email: "info@ghazatna.edu.ps",
  footerTagline: "منصة تعليمية رقمية تجمع بين التراث الفلسطيني والتقنية الحديثة.",
};

export function Footer() {
  const year = new Date().getFullYear();
  const [contact, setContact] = useState<ContactSettings>(DEFAULT);

  useEffect(() => {
    api
      .getSiteSettings()
      .then((res) => {
        const s = res as { contact?: Partial<ContactSettings> };
        if (s.contact) setContact({ ...DEFAULT, ...s.contact });
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="relative overflow-hidden text-neutral-950">
      <div
        className="absolute inset-0 bg-[url('/images/footer-bg.png')] bg-cover bg-bottom bg-no-repeat"
        aria-hidden
      />
      <div className="absolute inset-0 bg-[#fdf2d9]/75" aria-hidden />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Logo variant="full" href={undefined} />
            <p className="mt-4 text-sm leading-relaxed text-neutral-950">{contact.footerTagline}</p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-neutral-950">روابط سريعة</h3>
            <ul className="space-y-2">
              {publicNavLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-950 transition-colors hover:text-brand-blue"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  className="text-sm text-neutral-950 transition-colors hover:text-brand-blue"
                >
                  تسجيل الدخول
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-neutral-950">تواصل معنا</h3>
            <ul className="space-y-3 text-sm text-neutral-950">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-brand-blue" />
                <span>{contact.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-brand-blue" />
                <span dir="ltr">{contact.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-brand-blue" />
                <span>{contact.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-neutral-950/20 pt-6 text-center text-xs text-neutral-950">
          © {year} مدرسة غَزتنا. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
