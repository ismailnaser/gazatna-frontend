"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearDeferredInstallPrompt,
  getDeferredInstallPrompt,
  waitForInstallPrompt,
} from "@/lib/pwaInstallPrompt";

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosDevice() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isLikelyInstallableBrowser() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return false;

  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("electron")) return false;

  return /chrome|crios|edg|opr/.test(ua) && !/iphone|ipad|ipod/.test(ua);
}

export function usePwaInstall() {
  const [hasNativePrompt, setHasNativePrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIsInstalled(isStandaloneMode());
    setIsIOS(isIosDevice());
    setHasNativePrompt(Boolean(getDeferredInstallPrompt()));
    setReady(true);

    const onInstallReady = () => setHasNativePrompt(true);
    const onAppInstalled = () => {
      setIsInstalled(true);
      setHasNativePrompt(false);
      clearDeferredInstallPrompt();
    };

    window.addEventListener("ghazatna-pwa-install-ready", onInstallReady);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("ghazatna-pwa-install-ready", onInstallReady);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const canShow = ready && !isInstalled;
  const showIosHint = isIOS && !hasNativePrompt;

  const install = useCallback(async () => {
    if (isInstalled) return false;

    let prompt =
      getDeferredInstallPrompt() ??
      (typeof window !== "undefined" ? window.__ghazatnaDeferredInstall ?? null : null);

    if (!prompt && isLikelyInstallableBrowser()) {
      setInstalling(true);
      prompt = await waitForInstallPrompt(800);
    }

    if (!prompt) return false;

    setInstalling(true);
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;

      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setHasNativePrompt(false);
        clearDeferredInstallPrompt();
        return true;
      }

      return false;
    } finally {
      setInstalling(false);
    }
  }, [isInstalled]);

  return {
    canShow,
    showIosHint,
    isInstalled,
    installing,
    install,
  };
}
