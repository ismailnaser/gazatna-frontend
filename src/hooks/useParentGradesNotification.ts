"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { UserRole } from "@/types";

export function useParentGradesNotification(role: UserRole, pathname: string) {
  const [newGradesCount, setNewGradesCount] = useState(0);
  const onGradesPage =
    pathname === "/parent/grades" || pathname.startsWith("/parent/grades/");

  useEffect(() => {
    if (role !== "parent") {
      setNewGradesCount(0);
      return;
    }

    if (onGradesPage) {
      setNewGradesCount(0);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      api
        .getParentGradesNotification()
        .then((res) => {
          if (cancelled) return;
          const count = Number(res.count ?? 0);
          setNewGradesCount(Number.isFinite(count) && count > 0 ? count : 0);
        })
        .catch(() => {
          if (!cancelled) setNewGradesCount(0);
        });
    }, 600);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [role, onGradesPage]);

  return newGradesCount;
}
