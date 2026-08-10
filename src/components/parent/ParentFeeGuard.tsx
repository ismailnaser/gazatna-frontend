"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { api } from "@/lib/api";
import { mapFeeStatus, type FeeStatus } from "@/types/finance";
import { CreditCard, Lock } from "lucide-react";

/** Cap focus refetch so a dying backend is not hammered into NPROC collapse. */
const FOCUS_REFETCH_MIN_MS = 60_000;

export function ParentFeeGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [feeStatus, setFeeStatus] = useState<FeeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const prevOnFeesRef = useRef(false);
  const lastFetchAtRef = useRef(0);
  const inFlightRef = useRef(false);

  const onFeesPage = pathname === "/parent/fees" || pathname.startsWith("/parent/fees/");

  const loadStatus = useCallback(async (opts?: { force?: boolean }) => {
    const force = opts?.force === true;
    const now = Date.now();
    if (inFlightRef.current) return;
    if (!force && lastFetchAtRef.current > 0 && now - lastFetchAtRef.current < FOCUS_REFETCH_MIN_MS) {
      return;
    }
    inFlightRef.current = true;
    lastFetchAtRef.current = now;
    try {
      const data = await api.getParentFees();
      setFeeStatus(mapFeeStatus(data.feeStatus as Record<string, unknown>));
      setLoadError(false);
    } catch {
      setFeeStatus(null);
      setLoadError(true);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus({ force: true });
    const onFocus = () => {
      void loadStatus();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadStatus]);

  useEffect(() => {
    if (prevOnFeesRef.current && !onFeesPage) {
      void loadStatus({ force: true });
    }
    prevOnFeesRef.current = onFeesPage;
  }, [onFeesPage, loadStatus]);

  if (loading) {
    return <p className="py-16 text-center text-sm text-p-black/50">جاري التحقق من حالة الرسوم...</p>;
  }

  if (loadError && !onFeesPage) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h2 className="text-xl font-bold text-p-black">تعذر التحقق من الرسوم</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-p-black/70">
          لا يمكن فتح باقي الصفحات قبل التأكد من حالة الرسوم. حاول مرة أخرى أو راجع صفحة المالية.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={() => void loadStatus({ force: true })}>
            إعادة المحاولة
          </Button>
          <Button href="/parent/fees" variant="outline">
            <CreditCard className="h-4 w-4" />
            صفحة المالية
          </Button>
        </div>
      </div>
    );
  }

  if (feeStatus?.blocked && !onFeesPage) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <Lock className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-p-black">الوصول مقيّد</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-p-black/70">
          {feeStatus.message || `يجب دفع مبلغ الدفعة الأولى (${feeStatus.requiredAmount} ₪) لاستئناف الوصول — وليس المبلغ الكلي.`}
        </p>
        <Button href="/parent/fees" className="mt-6">
          <CreditCard className="h-4 w-4" />
          الذهاب إلى صفحة المالية
        </Button>
        <Link href="/parent/fees" className="mt-3 text-sm font-semibold text-p-green hover:underline">
          رفع إشعار دفع
        </Link>
      </div>
    );
  }

  if (feeStatus?.blocked && onFeesPage) {
    return (
      <>
        <Alert variant="warning" className="mb-6">
          {feeStatus.message || `يجب دفع مبلغ الدفعة الحالية (${feeStatus.requiredAmount} ₪) لاستئناف الوصول.`}
        </Alert>
        {children}
      </>
    );
  }

  return <>{children}</>;
}
