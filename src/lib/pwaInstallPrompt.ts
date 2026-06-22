export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    __ghazatnaDeferredInstall?: BeforeInstallPromptEvent | null;
  }
}

const INSTALL_READY_EVENT = "ghazatna-pwa-install-ready";

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const waiters = new Set<(event: BeforeInstallPromptEvent) => void>();
let listenerAttached = false;

function syncFromWindow() {
  if (typeof window === "undefined") return;
  if (window.__ghazatnaDeferredInstall) {
    deferredPrompt = window.__ghazatnaDeferredInstall;
  }
}

function attachInstallListener() {
  if (listenerAttached || typeof window === "undefined") return;
  listenerAttached = true;
  syncFromWindow();

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    window.__ghazatnaDeferredInstall = deferredPrompt;
    waiters.forEach((resolve) => resolve(deferredPrompt!));
    waiters.clear();
    window.dispatchEvent(new Event(INSTALL_READY_EVENT));
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    window.__ghazatnaDeferredInstall = null;
  });

  window.addEventListener(INSTALL_READY_EVENT, () => {
    syncFromWindow();
  });
}

export function initPwaInstallPrompt() {
  attachInstallListener();
  return deferredPrompt;
}

export function getDeferredInstallPrompt() {
  attachInstallListener();
  syncFromWindow();
  return deferredPrompt;
}

export function waitForInstallPrompt(timeoutMs = 4000): Promise<BeforeInstallPromptEvent | null> {
  attachInstallListener();

  if (deferredPrompt) {
    return Promise.resolve(deferredPrompt);
  }

  return new Promise((resolve) => {
    let settled = false;

    const finish = (event: BeforeInstallPromptEvent | null) => {
      if (settled) return;
      settled = true;
      window.removeEventListener(INSTALL_READY_EVENT, onReady);
      waiters.delete(onPrompt);
      clearTimeout(timer);
      resolve(event);
    };

    const onPrompt = (event: BeforeInstallPromptEvent) => finish(event);
    const onReady = () => finish(deferredPrompt);

    waiters.add(onPrompt);
    window.addEventListener(INSTALL_READY_EVENT, onReady);

    const timer = window.setTimeout(() => finish(null), timeoutMs);
  });
}

export function clearDeferredInstallPrompt() {
  deferredPrompt = null;
  if (typeof window !== "undefined") {
    window.__ghazatnaDeferredInstall = null;
  }
}
