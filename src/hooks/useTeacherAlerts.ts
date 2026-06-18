"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { TeacherAlert } from "@/types";

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
    refresh();
    const interval = setInterval(refresh, 60_000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  return { alerts, loading, refresh };
}
