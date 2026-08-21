"use client";

import { useEffect, useState } from "react";
import { api, peekCachedGet } from "@/lib/api";
import type { Student } from "@/types";

export function useParentStudent(enabled = true) {
  const cached = enabled ? peekCachedGet<Student>("/parent/student/") : null;
  const [student, setStudent] = useState<Student | null>(cached);
  const [loading, setLoading] = useState(enabled && !cached);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    api
      .getParentStudent()
      .then((row) => {
        if (!cancelled) setStudent(row as Student);
      })
      .catch(() => {
        if (!cancelled && !cached) setStudent(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { student, loading };
}
