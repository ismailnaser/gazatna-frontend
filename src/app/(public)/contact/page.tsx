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
    { icon: MapPin, text: contact.address },
    { icon: Phone, text: contact.phone, href: `tel:${contact.phone.replace(/[^\d+]/g, "")}` },
    { icon: Mail, text: contact.email, href: `mailto:${contact.email}` },
  ];

  return (
    <PublicPage title="تواصل معنا" description="نحن هنا للإجابة على استفساراتكم.">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {contactItems.map(({ icon: Icon, text, href }) => (
            <div key={text} className="flex items-center gap-3 text-p-black/60">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-p-green/10">
                <Icon className="h-5 w-5 text-p-green" />
              </span>
              {href ? (
                <a
                  href={href}
                  className="text-p-black/70 transition-colors hover:text-brand-blue"
                  dir={text.startsWith("+") ? "ltr" : undefined}
                >
                  {text}
                </a>
              ) : (
                <span dir={text.startsWith("+") ? "ltr" : undefined}>{text}</span>
              )}
            </div>
          ))}
        </div>

        {sent ? (
          <Alert variant="success">تم إرسال رسالتك بنجاح. سنعود إليك قريباً.</Alert>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm"
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
