const memory = new Map<string, { data: unknown; expires: number }>();

const PUBLIC_TTL_MS = 5 * 60 * 1000;
const AUTH_TTL_MS = 2 * 60 * 1000;

const CACHEABLE_PREFIXES = [
  "/content/",
  "/staff/teachers",
  "/site-settings",
  "/academic-context/",
  "/admin/analytics",
];

function cacheTtlFor(path: string): number {
  if (path.startsWith("/admin/analytics") || path.startsWith("/academic-context")) {
    return AUTH_TTL_MS;
  }
  return PUBLIC_TTL_MS;
}

export function isCacheableGet(path: string, method: string): boolean {
  if (method !== "GET") return false;
  return CACHEABLE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(prefix) || path.startsWith(prefix.replace(/\/$/, ""))
  );
}

export function getCacheKey(path: string, method: string): string {
  return `${method}:${path}`;
}

export function readApiCache<T>(key: string): T | null {
  const entry = memory.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    memory.delete(key);
    return null;
  }
  return entry.data as T;
}

export function writeApiCache(key: string, data: unknown, ttlMs: number = PUBLIC_TTL_MS): void {
  memory.set(key, { data, expires: Date.now() + ttlMs });
}

export function invalidateApiCache(prefix?: string): void {
  if (!prefix) {
    memory.clear();
    return;
  }
  for (const key of memory.keys()) {
    if (key.includes(prefix)) {
      memory.delete(key);
    }
  }
}

export function getCacheTtl(path: string): number {
  return cacheTtlFor(path);
}
