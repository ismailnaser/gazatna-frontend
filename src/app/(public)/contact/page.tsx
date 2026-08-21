"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { PublicPage } from "@/components/molecules/PublicPage";
import { api } from "@/lib/api";
import { Mail, MapPin, Phone } from "lucide-react";

type ContactSettings = { address: string; phone: string; email: string };
const DEFAULT: ContactSettings = {
  address: "غزة، فلسطين",
  phone: "+970 599 000 000",
  email: "info@ghazatna.edu.ps",
};

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [contact, setContact] = useState<ContactSettings>(DEFAULT);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getSiteSettings()
      .then((res) => {
        const s = res as { contact?: Partial<ContactSettings> };
        if (s.contact) setContact({ ...DEFAULT, ...s.contact });
      })
      .catch(() => {});
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    if (!name || !message) {
      setError("يرجى تعبئة الاسم والرسالة");
      return;
    }
    if (!email && !phone) {
      setError("يرجى إدخال البريد الإلكتروني أو رقم الهاتف (أحدهما على الأقل)");
      return;
    }

    setSending(true);
    api
      .submitContactMessage({ name, email, phone, message })
      .then(() => setSent(true))
      .catch((err) => setError(err instanceof Error ? err.message : "تعذر إرسال الرسالة"))
      .finally(() => setSending(false));
  }

  const contactItems = [
    { icon: MapPin, text: contact.address, tone: "bg-brand-yellow text-p-black" },
    { icon: Phone, text: contact.phone, href: `tel:${contact.phone.replace(/[^\d+]/g, "")}`, tone: "bg-brand-blue text-white" },
    { icon: Mail, text: contact.email, href: `mailto:${contact.email}`, tone: "bg-brand-orange text-white" },
  ];

  return (
    <PublicPage title="تواصل معنا" description="نحن هنا للإجابة على استفساراتكم.">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {contactItems.map(({ icon: Icon, text, href, tone }) => (
            <div
              key={text}
              className="flex items-center gap-3 rounded-[1.4rem] border-[3px] border-black/10 bg-white px-4 py-3 shadow-[-4px_5px_0_0_rgba(66,76,243,0.1)]"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-full ${tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              {href ? (
                <a
                  href={href}
                  className="font-semibold text-p-black/80 transition-colors hover:text-brand-blue"
                  dir={text.startsWith("+") ? "ltr" : undefined}
                >
                  {text}
                </a>
              ) : (
                <span className="font-semibold" dir={text.startsWith("+") ? "ltr" : undefined}>{text}</span>
              )}
            </div>
          ))}
        </div>

        {sent ? (
          <Alert variant="success">تم إرسال رسالتك بنجاح. سنعود إليك قريباً.</Alert>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-[2rem_1rem_2rem_1.2rem] border-[3px] border-brand-blue/20 bg-white p-6 shadow-[-7px_8px_0_0_rgba(66,76,243,0.16)]"
          >
            {error && <Alert variant="error">{error}</Alert>}
            <Input label="الاسم" name="name" required />
            <Input
              label="البريد الإلكتروني"
              name="email"
              type="email"
              placeholder="اختياري إذا أدخلت رقم الهاتف"
            />
            <Input
              label="رقم الهاتف"
              name="phone"
              type="tel"
              placeholder="اختياري إذا أدخلت البريد الإلكتروني"
              dir="ltr"
              className="text-start"
            />
            <p className="-mt-2 text-xs text-p-black/45">
              يكفي إدخال البريد الإلكتروني أو رقم الهاتف — أحدهما على الأقل.
            </p>
            <Textarea label="الرسالة" name="message" required />
            <Button type="submit" className="w-full" disabled={sending}>
              {sending ? "جاري الإرسال..." : "إرسال"}
            </Button>
          </form>
        )}
      </div>
    </PublicPage>
  );
}
