"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { UserRole } from "@/types";

export function useParentGradesNotification(role: UserRole, pathname: string) {
  const [newGradesCount, setNewGradesCount] = useState(0);

  useEffect(() => {
    if (role !== "parent") {
      setNewGradesCount(0);
      return;
    }

    if (pathname === "/parent/grades" || pathname.startsWith("/parent/grades/")) {
      setNewGradesCount(0);
      return;
    }

    api
      .getParentGradesNotification()
      .then((res) => {
        const count = Number(res.count ?? 0);
        setNewGradesCount(Number.isFinite(count) && count > 0 ? count : 0);
      })
      .catch(() => setNewGradesCount(0));
  }, [role, pathname]);

  return newGradesCount;
}
