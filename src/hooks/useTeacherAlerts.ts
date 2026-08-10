"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { TeacherAlert } from "@/types";

/** Cap focus refetch so a struggling backend is not stampeded. */
const FOCUS_REFETCH_MIN_MS = 60_000;

/**
 * Teacher alerts: load once on mount, refresh on window focus (throttled).
 * No background polling — repeated /teacher/alerts/ calls were stressing the server.
 */
export function useTeacherAlerts() {
  const [alerts, setAlerts] = useState<TeacherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const lastFetchAtRef = useRef(0);
  const inFlightRef = useRef(false);

  const refresh = useCallback(async (opts?: { force?: boolean }) => {
    const force = opts?.force === true;
    const now = Date.now();
    if (inFlightRef.current) return;
    if (!force && lastFetchAtRef.current > 0 && now - lastFetchAtRef.current < FOCUS_REFETCH_MIN_MS) {
      return;
    }
    inFlightRef.current = true;
    lastFetchAtRef.current = now;
    try {
      const data = (await api.getTeacherAlerts()) as TeacherAlert[];
      setAlerts(data);
    } catch {
      setAlerts([]);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh({ force: true });
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  return {
    alerts,
    loading,
    refresh: () => refresh({ force: true }),
  };
}
