"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { contactInitial, contactMailtoLink, contactTelLink } from "@/lib/contactMessage";
import { formatMetaDate } from "@/lib/dateDisplay";
import type { ContactMessage } from "@/types/contact";
import { ExpandableText } from "@/components/molecules/ExpandableText";
import { Archive, Mail, Phone } from "lucide-react";

type AdminContactMessageCardProps = {
  message: ContactMessage;
  archived?: boolean;
  archiving?: boolean;
  onArchive?: (id: string) => void;
};

export function AdminContactMessageCard({
  message,
  archived = false,
  archiving = false,
  onArchive,
}: AdminContactMessageCardProps) {
  const mailto = contactMailtoLink(message);
  const tel = contactTelLink(message.phone);
  const { date, time } = formatMetaDate(message.createdAt);

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all hover:border-brand-blue/15 hover:shadow-md">
      <div className="flex items-start gap-3 border-b border-neutral-50 bg-neutral-50/60 px-4 py-3 sm:px-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-blue/10 text-base font-bold text-brand-blue">
          {contactInitial(message.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-bold text-p-black">{message.name}</p>
            <Badge variant={archived ? "default" : "success"}>{archived ? "مؤرشف" : "جديد"}</Badge>
          </div>
          <p className="mt-1 text-xs text-p-black/45">
            {date}
            {time ? ` — ${time}` : ""}
          </p>
        </div>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {message.email ? (
            <div className="flex w-full items-start gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5 sm:min-w-0 sm:flex-1">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
              <span className="break-all text-sm leading-relaxed text-p-black/70" dir="ltr">
                {message.email}
              </span>
            </div>
          ) : null}
          {message.phone ? (
            <div className="flex w-full items-start gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5 sm:min-w-0 sm:flex-1">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-p-green" />
              <span className="text-sm leading-relaxed text-p-black/70" dir="ltr">
                {message.phone}
              </span>
            </div>
          ) : null}
        </div>

        <ExpandableText
          maxLines={4}
          className="rounded-xl bg-neutral-50 px-4 py-3 text-sm text-p-black/75"
        >
          {message.message}
        </ExpandableText>

        <div className="flex flex-wrap gap-2 border-t border-neutral-50 pt-3">
          {mailto ? (
            <Button href={mailto} className="h-9 flex-1 text-xs">
              <Mail className="h-3.5 w-3.5" />
              إرسال بريد
            </Button>
          ) : null}
          {tel ? (
            <Button href={tel} variant="outline" className="h-9 flex-1 text-xs">
              <Phone className="h-3.5 w-3.5" />
              اتصال
            </Button>
          ) : null}
          {!archived && onArchive ? (
            <Button
              type="button"
              variant="outline"
              className="h-9 text-xs"
              disabled={archiving}
              onClick={() => onArchive(message.id)}
            >
              <Archive className="h-3.5 w-3.5" />
              {archiving ? "جاري الأرشفة..." : "أرشفة"}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
