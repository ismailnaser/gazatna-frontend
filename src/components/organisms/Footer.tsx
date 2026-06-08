import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { publicNavLinks } from "@/data/navigation";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1a1a1a] text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-[#0d6b4f]" />
              <span className="text-lg font-bold text-white">مدرسة غَزتنا</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              منصة تعليمية رقمية تجمع بين التراث الفلسطيني والتقنية الحديثة.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">روابط سريعة</h3>
            <ul className="space-y-2">
              {publicNavLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 transition-colors hover:text-[#0d6b4f]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  className="text-sm text-gray-300 transition-colors hover:text-[#0d6b4f]"
                >
                  تسجيل الدخول
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">تواصل معنا</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-[#0d6b4f]" />
                <span>غزة، فلسطين</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[#0d6b4f]" />
                <span dir="ltr">+970 599 000 000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[#0d6b4f]" />
                <span>info@ghazatna.edu.ps</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-700 pt-6 text-center text-xs text-gray-500">
          © {year} مدرسة غَزتنا. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
