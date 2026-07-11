// Keep media URLs same-origin; Next rewrites `/media/*` to backend.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export function mediaOrigin(): string {
  // When API_BASE is `/api`, origin is empty (same host).
  return API_BASE.replace(/\/api\/?$/, "");
}

export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  const origin = mediaOrigin();

  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const parsed = new URL(url);
      if (parsed.pathname.startsWith("/media/")) {
        return `${parsed.pathname}${parsed.search}`;
      }
    } catch {
      return url;
    }
    return url;
  }

  if (url.startsWith("/media/")) return url;
  if (url.startsWith("media/")) return `/${url}`;

  return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
}

export async function downloadMediaFile(url: string, filename: string): Promise<void> {
  const resolved = resolveMediaUrl(url);
  if (!resolved) return;

  try {
    const response = await fetch(resolved);
    if (!response.ok) throw new Error("download failed");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename || "download";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    const anchor = document.createElement("a");
    anchor.href = resolved;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
}

export function isImageAttachment(url?: string | null, name?: string | null): boolean {
  const imagePattern = /\.(jpe?g|png|gif|webp|bmp|svg)(\?.*)?$/i;
  return [name, url].some((value) => value && imagePattern.test(value.toLowerCase()));
}

export function isPdfAttachment(url?: string | null, name?: string | null): boolean {
  const pdfPattern = /\.pdf(\?.*)?$/i;
  return [name, url].some((value) => value && pdfPattern.test(value.toLowerCase()));
}

export function attachmentLabel(url?: string | null, name?: string | null): string {
  if (name) return name;
  if (!url) return "مرفق";
  const parts = url.split("/");
  return decodeURIComponent(parts[parts.length - 1] || "مرفق");
}
