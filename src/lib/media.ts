// Media files live on the Django origin.
// - Local: NEXT_PUBLIC_API_URL=/api → use /media (Next rewrites to backend)
// - Production subdomain: NEXT_PUBLIC_API_URL=https://django.../api → use that host
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export function mediaOrigin(): string {
  return API_BASE.replace(/\/api\/?$/, "");
}

function joinOrigin(origin: string, path: string): string {
  if (!origin) return path;
  if (origin.startsWith("http://") || origin.startsWith("https://")) {
    return `${origin.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  }
  return path;
}

export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  const origin = mediaOrigin();

  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const parsed = new URL(url);
      if (parsed.pathname.startsWith("/media/")) {
        const path = `${parsed.pathname}${parsed.search}`;
        // Point to Django origin when API is absolute (django.gzs.edu.ps).
        return joinOrigin(origin, path);
      }
    } catch {
      return url;
    }
    return url;
  }

  if (url.startsWith("/media/")) return joinOrigin(origin, url);
  if (url.startsWith("media/")) return joinOrigin(origin, `/${url}`);

  return joinOrigin(origin, url.startsWith("/") ? url : `/${url}`);
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
