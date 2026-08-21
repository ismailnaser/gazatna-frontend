"use client";

import { useEffect, useState } from "react";
import { Heart, Mail, MapPin, Phone, Sparkles, Star } from "lucide-react";
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
    <footer className="relative overflow-hidden bg-[#fff4d6] text-p-black">
      <svg
        className="absolute inset-x-0 top-0 h-10 w-full text-white"
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          fill="currentColor"
          d="M0 24C180 48 360 0 540 24C720 48 900 0 1080 24C1260 48 1380 8 1440 24V0H0Z"
        />
      </svg>

      <span className="absolute start-6 top-12 hidden h-10 w-10 items-center justify-center rounded-full bg-brand-yellow text-p-black sm:flex">
        <Star className="h-5 w-5 fill-current" />
      </span>
      <span className="absolute end-8 top-16 hidden h-10 w-10 items-center justify-center rounded-full bg-brand-blue text-white md:flex">
        <Sparkles className="h-5 w-5" />
      </span>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Logo variant="full" href={undefined} />
            <p className="mt-4 text-sm font-semibold leading-relaxed text-p-black/80">
              {contact.footerTagline}
            </p>
          </div>

          <div>
            <h3 className="font-display mb-4 text-lg font-extrabold text-brand-blue">
              روابط سريعة
            </h3>
            <ul className="flex flex-wrap gap-2">
              {publicNavLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    className="font-display inline-flex rounded-full border-2 border-black/5 bg-white px-3 py-1.5 text-sm font-extrabold text-p-black/80 transition hover:-translate-y-0.5 hover:border-brand-yellow hover:text-brand-blue"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  prefetch={false}
                  className="font-display inline-flex rounded-full border-2 border-black/5 bg-white px-3 py-1.5 text-sm font-extrabold text-p-black/80 transition hover:-translate-y-0.5 hover:border-brand-yellow hover:text-brand-blue"
                >
                  تسجيل الدخول
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display mb-4 text-lg font-extrabold text-brand-orange">
              تواصل معنا
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-3 rounded-2xl border-2 border-black/5 bg-white px-3 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-p-black">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="font-semibold">{contact.address}</span>
              </li>
              <li className="flex items-center gap-3 rounded-2xl border-2 border-black/5 bg-white px-3 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white">
                  <Phone className="h-4 w-4" />
                </span>
                <span className="font-semibold" dir="ltr">
                  {contact.phone}
                </span>
              </li>
              <li className="flex items-center gap-3 rounded-2xl border-2 border-black/5 bg-white px-3 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white">
                  <Mail className="h-4 w-4" />
                </span>
                <span className="font-semibold">{contact.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 border-t-2 border-dashed border-brand-orange/30 pt-6 text-center text-xs font-bold text-p-black/70">
          <Heart className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />
          © {year} مدرسة غَزتنا. جميع الحقوق محفوظة.
          <Star className="h-3.5 w-3.5 fill-brand-yellow text-brand-yellow" />
        </div>
      </div>
    </footer>
  );
}
