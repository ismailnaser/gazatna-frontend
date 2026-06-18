import type { ContactMessage } from "@/types/contact";

export function contactInitial(name: string) {
  return name.trim().charAt(0) || "؟";
}

export function contactMailtoLink(message: ContactMessage) {
  if (!message.email?.trim()) return null;
  const subject = `رد: رسالة من ${message.name}`;
  const body = `\n\n---\nالرسالة الأصلية:\n${message.message}`;
  return `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function contactTelLink(phone?: string | null) {
  const cleaned = phone?.trim();
  if (!cleaned) return null;
  return `tel:${cleaned.replace(/[^\d+]/g, "")}`;
}
