import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";
import { navLinks } from "@/data/home";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="تواصل"
      className="border-t border-slate-200 bg-slate-900 text-slate-300"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold">مدرسة غزتنا</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              منصة تعليمية رقمية لخدمة طلابنا وأولياء أمورنا في غزة وما بعدها.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">روابط سريعة</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-teal-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div id="التسجيل">
            <h3 className="mb-4 text-sm font-semibold text-white">تواصل معنا</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-teal-400" />
                <span>غزة، فلسطين</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-teal-400" />
                <span dir="ltr">+970 599 000 000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-teal-400" />
                <span>info@ghazatna.edu.ps</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {year} مدرسة غزتنا. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
