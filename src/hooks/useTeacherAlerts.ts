"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { TeacherAlert } from "@/types";

/**
 * Teacher alerts: load once on mount, refresh on window focus.
 * No background polling — repeated /teacher/alerts/ calls were stressing the server.
 */
export function useTeacherAlerts() {
  const [alerts, setAlerts] = useState<TeacherAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = (await api.getTeacherAlerts()) as TeacherAlert[];
      setAlerts(data);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  return { alerts, loading, refresh };
}
