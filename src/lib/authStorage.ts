export const TOKEN_KEY = "ghazatna_access";
export const REFRESH_KEY = "ghazatna_refresh";
export const USER_KEY = "ghazatna_auth";
export const AUTH_STORAGE_KEYS = [TOKEN_KEY, REFRESH_KEY, USER_KEY] as const;

const CHANNEL_NAME = "ghazatna-auth";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;
const COOKIE_MAX_BYTES = 3500;

type SessionPayload = {
  type: "session";
  access: string;
  refresh: string;
  user: string;
};

type AuthChannelMessage = { type: "request" } | { type: "logout" } | SessionPayload;

type AuthSyncListener = (userJson: string | null) => void;

const listeners = new Set<AuthSyncListener>();
let channel: BroadcastChannel | null | undefined;

function canUseDom() {
  return typeof window !== "undefined";
}

function cookieDomain(): string | undefined {
  const host = window.location.hostname.toLowerCase();
  if (host === "gzs.edu.ps" || host === "www.gzs.edu.ps") {
    return "gzs.edu.ps";
  }
  return undefined;
}

function writeCookie(name: string, value: string) {
  try {
    const encoded = encodeURIComponent(value);
    if (encoded.length > COOKIE_MAX_BYTES) return;
    const domain = cookieDomain();
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    const domainPart = domain ? `; Domain=${domain}` : "";
    document.cookie = `${name}=${encoded}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}${domainPart}`;
  } catch {
    /* ignore quota / blocked cookies */
  }
}

function readCookie(name: string): string | null {
  try {
    const prefix = `${name}=`;
    for (const part of document.cookie.split("; ")) {
      if (part.startsWith(prefix)) {
        return decodeURIComponent(part.slice(prefix.length));
      }
    }
  } catch {
    return null;
  }
  return null;
}

function clearCookie(name: string) {
  try {
    const domain = cookieDomain();
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    const expired = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
    document.cookie = expired;
    if (domain) {
      document.cookie = `${expired}; Domain=${domain}`;
    }
  } catch {
    /* ignore */
  }
}

function storageGet(store: Storage, key: string): string | null {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(store: Storage, key: string, value: string) {
  try {
    store.setItem(key, value);
  } catch {
    /* ignore quota */
  }
}

function storageRemove(store: Storage, key: string) {
  try {
    store.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function hasStoredAuthTokens() {
  return Boolean(authGet(TOKEN_KEY));
}

export function authGet(key: string): string | null {
  if (!canUseDom()) return null;

  const local = storageGet(window.localStorage, key);
  if (local) return local;

  const session = storageGet(window.sessionStorage, key);
  if (session) {
    storageSet(window.localStorage, key, session);
    writeCookie(key, session);
    return session;
  }

  const cookie = readCookie(key);
  if (cookie) {
    storageSet(window.localStorage, key, cookie);
    storageSet(window.sessionStorage, key, cookie);
    return cookie;
  }

  return null;
}

export function authSet(key: string, value: string) {
  if (!canUseDom()) return;
  storageSet(window.localStorage, key, value);
  storageSet(window.sessionStorage, key, value);
  writeCookie(key, value);
}

export function authRemove(key: string) {
  if (!canUseDom()) return;
  storageRemove(window.localStorage, key);
  storageRemove(window.sessionStorage, key);
  clearCookie(key);
}

function currentSessionPayload(): SessionPayload | null {
  const access = authGet(TOKEN_KEY);
  const refresh = authGet(REFRESH_KEY);
  const user = authGet(USER_KEY);
  if (!access || !refresh || !user) return null;
  return { type: "session", access, refresh, user };
}

function applySessionSilent(payload: SessionPayload) {
  authSet(TOKEN_KEY, payload.access);
  authSet(REFRESH_KEY, payload.refresh);
  authSet(USER_KEY, payload.user);
}

function clearAuthSilent() {
  authRemove(TOKEN_KEY);
  authRemove(REFRESH_KEY);
  authRemove(USER_KEY);
}

function notify(userJson: string | null) {
  listeners.forEach((listener) => listener(userJson));
}

function onChannelMessage(event: MessageEvent<AuthChannelMessage>) {
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "request") {
    const payload = currentSessionPayload();
    if (payload) getChannel()?.postMessage(payload);
    return;
  }

  if (data.type === "logout") {
    clearAuthSilent();
    notify(null);
    return;
  }

  if (data.type === "session") {
    applySessionSilent(data);
    notify(data.user);
  }
}

function getChannel(): BroadcastChannel | null {
  if (!canUseDom()) return null;
  if (channel !== undefined) return channel;
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener("message", onChannelMessage);
  } catch {
    channel = null;
  }
  return channel;
}

export function ensureAuthSync() {
  getChannel();
}

export function syncAuthToPeers() {
  const payload = currentSessionPayload();
  if (!payload) return;
  getChannel()?.postMessage(payload);
}

export function broadcastAuthLogout() {
  getChannel()?.postMessage({ type: "logout" });
}

export function subscribeAuthSync(listener: AuthSyncListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function requestSessionFromPeers(timeoutMs = 500): Promise<boolean> {
  if (!canUseDom()) return Promise.resolve(false);
  if (currentSessionPayload()) return Promise.resolve(true);

  const ch = getChannel();
  if (!ch) return Promise.resolve(false);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      ch.removeEventListener("message", onMessage);
      resolve(ok);
    };

    const onMessage = (event: MessageEvent<AuthChannelMessage>) => {
      if (event.data?.type === "session") {
        applySessionSilent(event.data);
        finish(true);
      }
    };

    const timer = window.setTimeout(() => finish(!!currentSessionPayload()), timeoutMs);
    ch.addEventListener("message", onMessage);
    ch.postMessage({ type: "request" });
  });
}

export function pathNeedsAuthSession(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/parent")
  );
}
