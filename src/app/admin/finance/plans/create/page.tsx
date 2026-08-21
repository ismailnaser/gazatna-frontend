"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { AdminFeePlanFormPanel } from "@/components/admin/AdminFeePlanFormPanel";
import { PageBusy, PageHeader } from "@/components/molecules/PageHeader";
import { useSchool } from "@/context/SchoolContext";
import { api } from "@/lib/api";
import {
  createDefaultFeePlanForm,
  formatPlanPayload,
  validateFeePlanForm,
  type FeePlanFormState,
} from "@/lib/feePlanForm";
import { mapFeePlan, type FeePlan } from "@/types/finance";
import type { Grade } from "@/types/teacher";
import type { AcademicYear } from "@/types/academic";
import { mapAcademicYear } from "@/types/academic";
import { ArrowRight } from "lucide-react";

export default function AdminFeePlanCreatePage() {
  const router = useRouter();
  const { grades: schoolGrades } = useSchool();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [plans, setPlans] = useState<FeePlan[]>([]);
  const [planForm, setPlanForm] = useState<FeePlanFormState>(() => createDefaultFeePlanForm([]));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [plansData, yearsData] = await Promise.all([
          api.getAdminFeePlans(),
          api.getAdminAcademicYears(),
        ]);
        if (cancelled) return;
        const years = (yearsData as Array<Record<string, unknown>>).map(mapAcademicYear);
        setAcademicYears(years);
        setPlans((plansData as Array<Record<string, unknown>>).map(mapFeePlan));
        setPlanForm(createDefaultFeePlanForm(years));
        if (schoolGrades.length) {
          setGrades(schoolGrades);
        } else {
          try {
            const gradeRows = await api.getAdminGrades();
            if (!cancelled) {
              setGrades(
                (gradeRows as Array<Record<string, unknown>>).map((g) => ({
                  id: String(g.id),
                  name: String(g.name ?? ""),
                  sectionsCount: Number(g.sectionsCount ?? 0),
                  sortOrder: Number(g.sortOrder ?? 0),
                }))
              );
            }
          } catch {
            /* plans still usable without grade labels */
          }
        }
      } catch {
        if (!cancelled) setError("تعذر تحميل بيانات خطط الرسوم");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [schoolGrades]);

  const gradeOptions = useMemo(
    () => grades.map((g) => ({ value: g.id, label: g.name })),
    [grades]
  );

  async function savePlan(e: React.FormEvent) {
    e.preventDefault();
    const validationMessage = validateFeePlanForm(planForm, academicYears, plans);
    if (validationMessage) {
      setValidationError(validationMessage);
      return;
    }
    setSaving(true);
    setError("");
    setValidationError("");
    try {
      await api.createAdminFeePlan(formatPlanPayload(planForm));
      router.push("/admin/finance/plans");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ خطة الرسوم");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <PageBusy title="خطة رسوم جديدة" description="إنشاء خطة أقساط للمراحل الدراسية" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader title="خطة رسوم جديدة" description="إنشاء خطة أقساط للمراحل الدراسية" />
        <Button href="/admin/finance/plans" variant="outline" className="gap-2">
          <ArrowRight className="h-4 w-4" />
          العودة للمالية
        </Button>
      </div>

      {error ? (
        <Alert variant="error">{error}</Alert>
      ) : null}

      <Card className="p-4 sm:p-5">
        <AdminFeePlanFormPanel
          form={planForm}
          onChange={setPlanForm}
          gradeOptions={gradeOptions}
          plans={plans}
          academicYears={academicYears}
          saving={saving}
          validationError={validationError}
          onSubmit={savePlan}
          onCancel={() => router.push("/admin/finance/plans")}
        />
      </Card>
    </div>
  );
}
