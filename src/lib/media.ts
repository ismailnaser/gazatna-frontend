const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export function mediaOrigin(): string {
  return API_BASE.replace(/\/api\/?$/, "");
}

export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const origin = mediaOrigin();
  return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
}

export function isImageAttachment(url?: string | null, name?: string | null): boolean {
  const probe = (name || url || "").toLowerCase();
  return /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(probe);
}

export function attachmentLabel(url?: string | null, name?: string | null): string {
  if (name) return name;
  if (!url) return "مرفق";
  const parts = url.split("/");
  return decodeURIComponent(parts[parts.length - 1] || "مرفق");
}
