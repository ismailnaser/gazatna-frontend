"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { api } from "@/lib/api";
import { Check, CreditCard, Unlock } from "lucide-react";

type NotificationType = "fees_blocked" | "students_inactive";

type BlockedStudent = {
  id: string;
  name: string;
  studentNumber: string;
  grade: string;
  section: string;
  requiredAmount: number;
  installmentOrder?: number;
  installmentAmount?: number;
  installmentRemaining?: number;
  message: string;
  totalFees: number;
  paidFees: number;
  currentInstallment: {
    order: number;
    amount: number;
    remaining?: number;
    endDate: string | null;
  } | null;
};

function installmentDue(s: BlockedStudent): number {
  const remaining = s.installmentRemaining ?? s.currentInstallment?.remaining;
  if (remaining != null && remaining > 0) return remaining;
  const instAmount = s.installmentAmount ?? s.currentInstallment?.amount;
  if (instAmount != null && instAmount > 0 && s.requiredAmount >= s.totalFees) return instAmount;
  return s.requiredAmount;
}

function installmentOrder(s: BlockedStudent): number {
  return s.installmentOrder ?? s.currentInstallment?.order ?? 1;
}

function blockedNotice(s: BlockedStudent): string {
  const order = installmentOrder(s);
  const due = installmentDue(s);
  const orderLabel = order === 1 ? "الأولى" : `رقم ${order}`;
  return `يجب دفع مبلغ الدفعة ${orderLabel} فقط (${due} ₪) لاستئناف الوصول — وليس المبلغ الكلي (${s.totalFees} ₪).`;
}

type InactiveStudent = {
  id: string;
  name: string;
  studentNumber: string;
  grade: string;
  section: string;
  createdAt: string;
};

const META: Record<
  NotificationType,
  { title: string; description: string; backHref: string }
> = {
  fees_blocked: {
    title: "طلاب محجوبون بسبب الرسوم",
    description: "قائمة الطلاب الذين لا يمكنهم استخدام المنصة حتى إكمال الدفعة المستحقة",
    backHref: "/admin",
  },
  students_inactive: {
    title: "طلاب غير نشطين",
    description: "طلاب بانتظار تفعيل الحساب من الإدارة",
    backHref: "/admin",
  },
};

export default function AdminNotificationsPage() {
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as NotificationType | null) ?? "fees_blocked";

  const [blocked, setBlocked] = useState<BlockedStudent[]>([]);
  const [inactive, setInactive] = useState<InactiveStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const meta = META[type] ?? META.fees_blocked;

  useEffect(() => {
    setLoading(true);
    setError("");
    const loader =
      type === "students_inactive"
        ? api.getAdminInactiveStudents().then((res) => setInactive(res as InactiveStudent[]))
        : api.getAdminBlockedStudents().then((res) => setBlocked(res as BlockedStudent[]));

    loader
      .catch((e) => {
        setError(e instanceof Error ? e.message : "تعذر تحميل التفاصيل");
        setBlocked([]);
        setInactive([]);
      })
      .finally(() => setLoading(false));
  }, [type]);

  const count = useMemo(
    () => (type === "students_inactive" ? inactive.length : blocked.length),
    [type, inactive.length, blocked.length]
  );

  async function activateStudent(id: string) {
    setActivatingId(id);
    setError("");
    setSuccess("");
    try {
      await api.updateAdminStudent(id, { is_active: true });
      setInactive((prev) => prev.filter((s) => s.id !== id));
      setSuccess("تم تفعيل الطالب بنجاح.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تفعيل الطالب");
    } finally {
      setActivatingId(null);
    }
  }

  return (
    <div>
      <PageHeader title={meta.title} description={meta.description} />

      <div className="mb-4">
        <Link href={meta.backHref} className="text-sm font-semibold text-p-green hover:underline">
          ← العودة للوحة الإدارة
        </Link>
      </div>

      {success && <Alert variant="success" className="mb-4">{success}</Alert>}
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      <Card>
        <p className="mb-4 text-sm text-p-black/60">
          العدد: <span className="font-bold text-p-black">{count}</span>
        </p>

        {loading ? (
          <p className="text-sm text-neutral-500">جاري التحميل...</p>
        ) : type === "fees_blocked" ? (
          blocked.length === 0 ? (
            <p className="text-sm text-neutral-500">لا يوجد طلاب محجوبون حالياً.</p>
          ) : (
            <div className="space-y-3">
              {blocked.map((s) => (
                <div key={s.id} className="rounded-xl border border-neutral-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-p-black">{s.name}</p>
                      <p className="mt-1 text-sm text-p-black/60">
                        رقم الطالب: {s.studentNumber} — {s.grade}
                        {s.section ? ` / ${s.section}` : ""}
                      </p>
                    </div>
                    <div className="text-end text-sm">
                      <p className="font-bold text-p-red">
                        الدفعة {installmentOrder(s)}: {installmentDue(s)} ₪ مطلوبة لفك الحجب
                      </p>
                      <p className="text-p-black/50">
                        مدفوع {s.paidFees} ₪ — إجمالي الرسوم السنوية {s.totalFees} ₪
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    {blockedNotice(s)}
                  </p>
                  {s.currentInstallment && (
                    <p className="mt-2 text-xs text-p-black/50">
                      الدفعة الحالية: {s.currentInstallment.order} — {s.currentInstallment.amount} ₪
                      {s.currentInstallment.endDate ? ` — آخر موعد: ${s.currentInstallment.endDate}` : ""}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button href="/admin/finance" variant="outline" className="text-xs">
                      <CreditCard className="h-4 w-4" />
                      إدارة المالية
                    </Button>
                    <Button href={`/admin/students`} variant="outline" className="text-xs">
                      <Unlock className="h-4 w-4" />
                      صفحة الطلاب
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : inactive.length === 0 ? (
          <p className="text-sm text-neutral-500">لا يوجد طلاب غير نشطين حالياً.</p>
        ) : (
          <div className="space-y-3">
            {inactive.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-100 p-4">
                <div>
                  <p className="font-semibold text-p-black">{s.name}</p>
                  <p className="mt-1 text-sm text-p-black/60">
                    رقم الطالب: {s.studentNumber} — {s.grade}
                    {s.section ? ` / ${s.section}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-p-black/40">
                    تاريخ التسجيل: {new Date(s.createdAt).toLocaleDateString("ar")}
                  </p>
                </div>
                <Button
                  type="button"
                  className="text-xs"
                  disabled={activatingId === s.id}
                  onClick={() => activateStudent(s.id)}
                >
                  <Check className="h-4 w-4" />
                  {activatingId === s.id ? "جاري التفعيل..." : "تفعيل الطالب"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
