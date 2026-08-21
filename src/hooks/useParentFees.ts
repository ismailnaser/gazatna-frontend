"use client";

import { useCallback, useEffect, useState } from "react";
import { api, peekCachedGet } from "@/lib/api";
import type { PaymentNotice, PaymentStatus, Student } from "@/types";
import { mapFeeStatus, type FeeStatus } from "@/types/finance";

type ParentFeesPayload = {
  student: unknown;
  notices: unknown[];
  feeStatus: unknown;
};

function mapNotices(notices: unknown[]): PaymentNotice[] {
  return (notices as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    date: String(row.date),
    declaredAmount: Number(row.declaredAmount ?? row.amount),
    amount: Number(row.amount),
    status: row.status as PaymentStatus,
    note: row.note ? String(row.note) : undefined,
    receiptUrl: row.receiptUrl ? String(row.receiptUrl) : null,
  }));
}

export function useParentFees() {
  const cached = peekCachedGet<ParentFeesPayload>("/parent/fees/");
  const [student, setStudent] = useState<Student | null>(
    cached ? (cached.student as Student) : null
  );
  const [notices, setNotices] = useState<PaymentNotice[]>(
    cached ? mapNotices(cached.notices ?? []) : []
  );
  const [feeStatus, setFeeStatus] = useState<FeeStatus | null>(
    cached?.feeStatus ? mapFeeStatus(cached.feeStatus as Record<string, unknown>) : null
  );
  const [loading, setLoading] = useState(!cached);

  const loadFees = useCallback(async () => {
    const data = await api.getParentFees();
    setStudent(data.student as Student);
    setNotices(mapNotices((data.notices as unknown[]) ?? []));
    setFeeStatus(mapFeeStatus(data.feeStatus as Record<string, unknown>));
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadFees()
      .catch(() => {
        if (!cancelled && !cached) {
          setStudent(null);
          setNotices([]);
          setFeeStatus(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadFees]);

  return { student, notices, feeStatus, loading, reload: loadFees };
}
