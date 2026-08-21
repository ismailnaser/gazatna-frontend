"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { AdminFeePlansTable } from "@/components/admin/AdminFeePlansTable";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { EmptyState } from "@/components/molecules/EmptyState";
import { api, peekCachedList } from "@/lib/api";
import { mapFeePlan, type FeePlan } from "@/types/finance";
import { ClipboardList, Plus, Wallet } from "lucide-react";

export default function AdminFinancePlansPage() {
  const router = useRouter();
  const cached = peekCachedList<Record<string, unknown>>("/admin/finance/plans/");
  const [plans, setPlans] = useState<FeePlan[]>(cached ? cached.map((row) => mapFeePlan(row)) : []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletePlanTarget, setDeletePlanTarget] = useState<FeePlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .getAdminFeePlans()
      .then((plansData) => {
        if (cancelled) return;
        setPlans((plansData as Array<Record<string, unknown>>).map(mapFeePlan));
      })
      .catch(() => {
        if (!cancelled) setError("تعذر تحميل خطط الرسوم");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const coveredGradesCount = useMemo(() => {
    const unique = new Set<string>();
    for (const plan of plans) {
      for (const grade of plan.gradeNames) unique.add(grade);
    }
    return unique.size;
  }, [plans]);

  async function confirmDeletePlan() {
    if (!deletePlanTarget) return;
    setDeletingPlan(true);
    setError("");
    try {
      await api.deleteAdminFeePlan(deletePlanTarget.id);
      setPlans((prev) => prev.filter((p) => p.id !== deletePlanTarget.id));
      setDeletePlanTarget(null);
      setSuccess(`تم حذف خطة ${deletePlanTarget.name}.`);
    } catch {
      setError("تعذر حذف خطة الرسوم");
    } finally {
      setDeletingPlan(false);
    }
  }

  return (
    <WorkspacePage
      title="خطط الرسوم"
      description="أنشئ خطة جديدة أو عدّل خطة موجودة."
      breadcrumbs={[{ label: "المالية", href: "/admin/finance" }, { label: "خطط الرسوم" }]}
      actions={
        <Button type="button" onClick={() => router.push("/admin/finance/plans/create")}>
          <Plus className="h-4 w-4" />
          خطة جديدة
        </Button>
      }
      loading={loading}
      loadingMessage="جاري تحميل الخطط..."
    >
      {error && !deletePlanTarget ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      ) : null}

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <Card className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
            <ClipboardList className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-p-black/65">خطط مسجّلة</p>
            <p className="text-lg font-bold">{plans.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Wallet className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-p-black/65">مراحل مغطاة</p>
            <p className="text-lg font-bold">{coveredGradesCount}</p>
          </div>
        </Card>
      </div>

      {plans.length === 0 ? (
        <EmptyState
          title="لا توجد خطط بعد"
          description="أضف خطة رسوم للمرحلة الدراسية."
          action={
            <Button type="button" onClick={() => router.push("/admin/finance/plans/create")}>
              خطة جديدة
            </Button>
          }
        />
      ) : (
        <Card>
          <AdminFeePlansTable
            plans={plans}
            onCreate={() => router.push("/admin/finance/plans/create")}
            onEdit={(plan) => router.push(`/admin/finance/plans/${plan.id}/edit`)}
            onDelete={(plan) => {
              setError("");
              setDeletePlanTarget(plan);
            }}
          />
        </Card>
      )}

      <ConfirmDialog
        open={Boolean(deletePlanTarget)}
        title="تأكيد حذف خطة الرسوم"
        description={
          deletePlanTarget ? (
            <>
              هل أنت متأكد من حذف خطة <span className="font-semibold">{deletePlanTarget.name}</span>؟
            </>
          ) : null
        }
        loading={deletingPlan}
        error={deletePlanTarget ? error : undefined}
        onCancel={() => {
          setError("");
          setDeletePlanTarget(null);
        }}
        onConfirm={confirmDeletePlan}
      />
    </WorkspacePage>
  );
}
