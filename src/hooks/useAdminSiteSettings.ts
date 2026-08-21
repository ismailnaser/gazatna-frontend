"use client";

import { useCallback, useEffect, useState } from "react";
import { api, peekCachedGet } from "@/lib/api";
import {
  normalizeSiteSettings,
  type SiteSettings,
} from "@/lib/adminSiteSettings";

export function useAdminSiteSettings() {
  const cached = peekCachedGet<SiteSettings>("/admin/site-settings/");
  const [settings, setSettings] = useState<SiteSettings | null>(
    cached ? normalizeSiteSettings(cached) : null
  );
  const [loading, setLoading] = useState(!cached);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [pendingHeroImage, setPendingHeroImage] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [removeHeroImage, setRemoveHeroImage] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .getAdminSiteSettings()
      .then((settingsRes) => {
        if (cancelled) return;
        setSettings(normalizeSiteSettings(settingsRes as SiteSettings));
      })
      .catch(() => {
        if (!cancelled) setError("تعذر تحميل الإعدادات");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (heroImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(heroImagePreview);
      }
    };
  }, [heroImagePreview]);

  const save = useCallback(async () => {
    if (!settings) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      let updated: SiteSettings;
      if (pendingHeroImage || removeHeroImage) {
        const fd = new FormData();
        fd.append("hero", JSON.stringify(settings.hero));
        fd.append("about", JSON.stringify(settings.about));
        fd.append("contact", JSON.stringify(settings.contact));
        fd.append("registration", JSON.stringify(settings.registration));
        fd.append("programs", JSON.stringify(settings.programs ?? []));
        if (pendingHeroImage) fd.append("heroImage", pendingHeroImage);
        if (removeHeroImage) fd.append("removeHeroImage", "true");
        updated = (await api.updateAdminSiteSettings(fd)) as SiteSettings;
      } else {
        updated = (await api.updateAdminSiteSettings(settings)) as SiteSettings;
      }
      setSettings(normalizeSiteSettings(updated));
      setPendingHeroImage(null);
      setRemoveHeroImage(false);
      if (heroImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(heroImagePreview);
      }
      setHeroImagePreview(null);
      setSuccess("تم حفظ الإعدادات بنجاح.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  }, [settings, pendingHeroImage, removeHeroImage, heroImagePreview]);

  return {
    settings,
    setSettings,
    loading,
    saving,
    success,
    error,
    setError,
    save,
    pendingHeroImage,
    setPendingHeroImage,
    heroImagePreview,
    setHeroImagePreview,
    removeHeroImage,
    setRemoveHeroImage,
  };
}
