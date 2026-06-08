"use client";

import { useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { PublicPage } from "@/components/molecules/PublicPage";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <PublicPage title="تواصل معنا" description="نحن هنا للإجابة على استفساراتكم.">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {[
            { icon: MapPin, text: "غزة، فلسطين" },
            { icon: Phone, text: "+970 599 000 000" },
            { icon: Mail, text: "info@ghazatna.edu.ps" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-p-black/60">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-p-green/10">
                <Icon className="h-5 w-5 text-p-green" />
              </span>
              <span dir={text.startsWith("+") ? "ltr" : undefined}>{text}</span>
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
            <Input label="الاسم" required />
            <Input label="البريد الإلكتروني" type="email" required />
            <Textarea label="الرسالة" required />
            <Button type="submit" className="w-full">
              إرسال
            </Button>
          </form>
        )}
      </div>
    </PublicPage>
  );
}
