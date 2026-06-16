"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { api } from "@/lib/api";
import { mapFeeStatus, type FeeStatus } from "@/types/finance";
import { CreditCard, Lock } from "lucide-react";

export function ParentFeeGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [feeStatus, setFeeStatus] = useState<FeeStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getParentFees()
      .then((data) => setFeeStatus(mapFeeStatus(data.feeStatus as Record<string, unknown>)))
      .catch(() => setFeeStatus(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  const onFeesPage = pathname === "/parent/fees" || pathname.startsWith("/parent/fees/");

  if (loading) {
    return <>{children}</>;
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
