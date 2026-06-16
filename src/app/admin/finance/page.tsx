"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { MultiSelect } from "@/components/atoms/MultiSelect";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { StudentSearchSelect } from "@/components/molecules/StudentSearchSelect";
import { api } from "@/lib/api";
import type { PaymentStatus } from "@/types";
import {
  mapFeePlan,
  mapFinanceNotice,
  type FeeInstallmentItem,
  type FeePlan,
  type FinanceNotice,
} from "@/types/finance";
import type { Grade } from "@/types/teacher";
import { Check, Image, Pencil, Plus, Save, Trash2, Unlock, X } from "lucide-react";

type Tab = "payments" | "plans" | "access";


function buildInstallments(count: number, total: number, existing: FeeInstallmentItem[] = []) {
  const per = Math.ceil(total / count);
  const today = new Date();
  const rows: FeeInstallmentItem[] = [];

  for (let i = 0; i < count; i++) {
    const prev = existing[i];
    // Only pre-fill dates for the first installment; the rest default to empty (to be set later)
    let startDate = prev?.startDate ?? "";
    let endDate = prev?.endDate ?? "";

    if (!startDate && !endDate && i === 0) {
      // First installment gets a sensible default
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      startDate = start.toISOString().slice(0, 10);
      endDate = end.toISOString().slice(0, 10);
    }

    // Last installment absorbs the remainder (total minus sum of previous)
    const amount = prev?.amount ?? (i === count - 1 ? total - per * (count - 1) : per);

    rows.push({
      order: i + 1,
      amount,
      startDate,
      endDate,
    });
  }
  return rows;
}

export default function AdminFinancePage() {
  const [tab, setTab] = useState<Tab>("payments");
  const [notices, setNotices] = useState<FinanceNotice[]>([]);
  const [plans, setPlans] = useState<FeePlan[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<
    Array<{ id: string; name: string; grade: string; studentNumber: string }>
  >([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [approveTarget, setApproveTarget] = useState<FinanceNotice | null>(null);
  const [approveAmount, setApproveAmount] = useState("");
  const [approving, setApproving] = useState(false);

  const [planForm, setPlanForm] = useState({
    id: "",
    name: "",
    totalAmount: "2500",
    installmentsCount: "3",
    gradeIds: [] as string[],
    installments: buildInstallments(3, 2500),
  });
  const [savingPlan, setSavingPlan] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [accessStudentId, setAccessStudentId] = useState("");
  const [accessDays, setAccessDays] = useState("1");
  const [grantingAccess, setGrantingAccess] = useState(false);
  const planFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      api.getAdminFinance().then((data) =>
        setNotices((data as Array<Record<string, unknown>>).map(mapFinanceNotice))
      ),
      api.getAdminFeePlans().then((data) =>
        setPlans((data as Array<Record<string, unknown>>).map(mapFeePlan))
      ),
      api.getAdminGrades().then((data) => setGrades(data as Grade[])),
      api.getAdminStudents().then((data) =>
        setStudents(
          (data as Array<Record<string, unknown>>).map((s) => ({
            id: String(s.id),
            name: String(s.name),
            grade: String(s.grade ?? ""),
            studentNumber: String(s.studentNumber ?? ""),
          }))
        )
      ),
    ]).catch(() => setError("تعذر تحميل بيانات المالية"));
  }, []);

  const gradeOptions = useMemo(
    () => grades.map((g) => ({ value: g.id, label: g.name })),
    [grades]
  );

  async function rejectNotice(id: string) {
    await api.updateAdminPayment(id, { status: "rejected" });
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, status: "rejected" as PaymentStatus } : n)));
  }

  async function confirmApprove() {
    if (!approveTarget) return;
    setApproving(true);
    setError("");
    try {
      await api.updateAdminPayment(approveTarget.id, {
        status: "approved",
        amount: Number(approveAmount),
      });
      setNotices((prev) =>
        prev.map((n) =>
          n.id === approveTarget.id
            ? { ...n, status: "approved" as PaymentStatus, amount: Number(approveAmount) }
            : n
        )
      );
      setApproveTarget(null);
      setSuccess("تم اعتماد الدفعة وخصم المبلغ من رصيد الطالب.");
    } catch {
      setError("تعذر اعتماد الدفعة");
    } finally {
      setApproving(false);
    }
  }

  function startEditPlan(plan?: FeePlan) {
    if (plan) {
      setPlanForm({
        id: plan.id,
        name: plan.name,
        totalAmount: String(plan.totalAmount),
        installmentsCount: String(plan.installmentsCount),
        gradeIds: plan.gradeIds,
        installments: plan.installments.map((row) => ({ ...row })),
      });
    } else {
      setPlanForm({
        id: "",
        name: "",
        totalAmount: "2500",
        installmentsCount: "3",
        gradeIds: [],
        installments: buildInstallments(3, 2500),
      });
    }
    setTab("plans");
    setTimeout(() => planFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }


  function updateInstallmentCount(count: number) {
    const total = Number(planForm.totalAmount) || 0;
    if (count < 1) return;
    const per = Math.ceil(total / count);
    const today = new Date();
    setPlanForm((prev) => {
      const newInstallments: FeeInstallmentItem[] = [];
      for (let i = 0; i < count; i++) {
        const existing = prev.installments[i];
        let startDate = existing?.startDate ?? "";
        let endDate = existing?.endDate ?? "";
        if (!startDate && !endDate && i === 0) {
          const start = new Date(today.getFullYear(), today.getMonth(), 1);
          const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          startDate = start.toISOString().slice(0, 10);
          endDate = end.toISOString().slice(0, 10);
        }
        const amount = i === count - 1 ? total - per * (count - 1) : per;
        newInstallments.push({ order: i + 1, amount, startDate, endDate });
      }
      return { ...prev, installmentsCount: String(count), installments: newInstallments };
    });
  }

  async function savePlan(e: React.FormEvent) {
    e.preventDefault();
    setSavingPlan(true);
    setError("");
    const payload = {
      name: planForm.name.trim(),
      totalAmount: Number(planForm.totalAmount),
      installmentsCount: Number(planForm.installmentsCount),
      isActive: true,
      gradeIds: planForm.gradeIds.map(Number),
      installments: planForm.installments.map((row) => ({
        order: row.order,
        amount: Number(row.amount),
        startDate: row.startDate || null,
        endDate: row.endDate || null,
      })),
    };
    try {
      if (planForm.id) {
        const updated = await api.updateAdminFeePlan(planForm.id, payload);
        const mapped = mapFeePlan(updated as Record<string, unknown>);
        setPlans((prev) => prev.map((p) => (p.id === mapped.id ? mapped : p)));
      } else {
        const created = await api.createAdminFeePlan(payload);
        const mapped = mapFeePlan(created as Record<string, unknown>);
        setPlans((prev) => [mapped, ...prev]);
      }
      setSuccess("تم حفظ خطة الرسوم وتطبيقها على الطلاب في المراحل المحددة.");
      startEditPlan();
    } catch {
      setError("تعذر حفظ خطة الرسوم");
    } finally {
      setSavingPlan(false);
    }
  }

  async function deletePlan(id: string) {
    await api.deleteAdminFeePlan(id);
    setPlans((prev) => prev.filter((p) => p.id !== id));
    setConfirmDeleteId(null);
  }

  async function grantAccess(e: React.FormEvent) {
    e.preventDefault();
    if (!accessStudentId) {
      setError("يرجى اختيار طالب من نتائج البحث");
      return;
    }
    setGrantingAccess(true);
    setError("");
    try {
      const result = await api.grantStudentFeeAccess(accessStudentId, Number(accessDays));
      setSuccess(`تم فتح الوصول للطالب حتى ${new Date(result.accessOverrideUntil).toLocaleString("ar")}`);
    } catch {
      setError("تعذر فتح الوصول للطالب");
    } finally {
      setGrantingAccess(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="إدارة المالية"
        description="خطط الأقساط، مراجعة الإشعارات، وفتح الوصول المؤقت"
      />

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { id: "payments" as Tab, label: "إشعارات الدفع" },
          { id: "plans" as Tab, label: "خطط الرسوم" },
          { id: "access" as Tab, label: "فتح الوصول" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === item.id ? "bg-p-green text-white" : "bg-neutral-100 text-p-black/70 hover:bg-neutral-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "payments" && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-p-cream text-p-black/60">
                <th className="px-4 py-3 text-start font-semibold">الطالب</th>
                <th className="px-4 py-3 text-start font-semibold">المبلغ المُعلن</th>
                <th className="px-4 py-3 text-start font-semibold">المبلغ المُعتمد</th>
                <th className="px-4 py-3 text-start font-semibold">التاريخ</th>
                <th className="px-4 py-3 text-start font-semibold">الإشعار</th>
                <th className="px-4 py-3 text-start font-semibold">الحالة</th>
                <th className="px-4 py-3 text-start font-semibold">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((n) => (
                <tr key={n.id} className="border-b border-neutral-50">
                  <td className="px-4 py-3 font-medium text-p-black">{n.studentName}</td>
                  <td className="px-4 py-3">{n.declaredAmount} ₪</td>
                  <td className="px-4 py-3">{n.amount} ₪</td>
                  <td className="px-4 py-3">{n.date}</td>
                  <td className="px-4 py-3">
                    {n.receiptUrl ? (
                      <a
                        href={n.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-p-green hover:underline"
                      >
                        <Image className="h-4 w-4" />
                        عرض
                      </a>
                    ) : (
                      <span className="text-p-black/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={n.status} />
                  </td>
                  <td className="px-4 py-3">
                    {n.status === "pending" && (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          className="px-2 py-1 text-xs"
                          onClick={() => {
                            setApproveTarget(n);
                            setApproveAmount(String(n.declaredAmount));
                          }}
                        >
                          <Check className="h-3 w-3" />
                          موافقة
                        </Button>
                        <Button
                          variant="danger"
                          className="px-2 py-1 text-xs"
                          onClick={() => rejectNotice(n.id)}
                        >
                          <X className="h-3 w-3" />
                          رفض
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "plans" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-p-black">خطط الرسوم الحالية</h3>
              <Button variant="outline" className="text-xs" onClick={() => startEditPlan()}>
                <Plus className="h-4 w-4" />
                خطة جديدة
              </Button>
            </div>
            <div className="space-y-3">
              {plans.length === 0 ? (
                <p className="text-sm text-neutral-500">لا توجد خطط رسوم بعد.</p>
              ) : (
                plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`rounded-xl border p-4 transition-colors ${
                      planForm.id === plan.id
                        ? "border-p-green bg-p-green/5"
                        : "border-neutral-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-p-black">{plan.name}</p>
                        <p className="mt-1 text-sm text-p-black/60">
                          {plan.totalAmount} ₪ — {plan.installmentsCount} دفعات
                        </p>
                        <p className="mt-1 text-xs text-p-black/50">
                          المراحل: {plan.gradeNames.join("، ") || "—"}
                        </p>
                        {plan.installments.length > 0 && (
                          <ul className="mt-3 space-y-1 border-t border-neutral-100 pt-3">
                            {plan.installments.map((inst) => (
                              <li key={inst.order} className="text-xs text-p-black/60">
                                دفعة {inst.order}: {inst.amount} ₪ — {inst.startDate} → {inst.endDate}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <Button
                          variant="outline"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => startEditPlan(plan)}
                        >
                          <Pencil className="h-3 w-3" />
                          تعديل الخطة
                        </Button>
                        {confirmDeleteId === plan.id ? (
                          <div className="flex gap-1">
                            <Button
                              variant="danger"
                              className="px-3 py-1.5 text-xs"
                              onClick={() => deletePlan(plan.id)}
                            >
                              <Check className="h-3 w-3" />
                              تأكيد
                            </Button>
                            <Button
                              variant="outline"
                              className="px-3 py-1.5 text-xs"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="danger"
                            className="px-3 py-1.5 text-xs"
                            onClick={() => setConfirmDeleteId(plan.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                            حذف
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <div ref={planFormRef}>
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-p-black">
                {planForm.id ? "تعديل خطة الرسوم" : "إنشاء خطة رسوم"}
              </h3>
              {planForm.id && (
                <Button type="button" variant="outline" className="text-xs" onClick={() => startEditPlan()}>
                  إلغاء التعديل
                </Button>
              )}
            </div>
            <form onSubmit={savePlan} className="space-y-4">
              <Input
                label="اسم الخطة"
                value={planForm.name}
                onChange={(e) => setPlanForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
              <Input
                label="إجمالي القسط (₪)"
                type="number"
                min="1"
                value={planForm.totalAmount}
                onChange={(e) => {
                  const total = Number(e.target.value) || 0;
                  const count = Number(planForm.installmentsCount) || 1;
                  const per = Math.ceil(total / count);
                  setPlanForm((p) => ({
                    ...p,
                    totalAmount: e.target.value,
                    installments: p.installments.map((row, i) => ({
                      ...row,
                      amount: i === count - 1 ? total - per * (count - 1) : per,
                    })),
                  }));
                }}
                required
              />
              <MultiSelect
                label="المراحل الدراسية"
                options={gradeOptions}
                value={planForm.gradeIds}
                onChange={(gradeIds) => setPlanForm((p) => ({ ...p, gradeIds }))}
                countLabel="مراحل"
                placeholder="اختر مرحلة أو أكثر"
              />
              <Input
                label="عدد الدفعات"
                type="number"
                min="1"
                max="12"
                value={planForm.installmentsCount}
                onChange={(e) => updateInstallmentCount(Number(e.target.value) || 1)}
                required
              />
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-p-black">جدول الدفعات</p>
                  <p className="mt-1 text-xs text-p-black/50">
                    حدد مبلغ كل دفعة. يمكن تحديد تواريخها الآن أو تركها فارغة وتحديدها لاحقاً حسب سير الفصل الدراسي.
                  </p>
                </div>
                {planForm.installments.map((row, index) => {
                  const isScheduled = Boolean(row.startDate && row.endDate);
                  return (
                    <div
                      key={row.order}
                      className={`rounded-lg border p-3 ${isScheduled ? "border-neutral-100" : "border-dashed border-neutral-300 bg-neutral-50/50"}`}
                    >
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-p-black">دفعة {row.order}</p>
                        {!isScheduled && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                            سيُحدَّد موعدها لاحقاً
                          </span>
                        )}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Input
                          label="المبلغ (₪)"
                          type="number"
                          min="0"
                          value={String(row.amount)}
                          onChange={(e) => {
                            const installments = [...planForm.installments];
                            installments[index] = { ...row, amount: Number(e.target.value) };
                            setPlanForm((p) => ({ ...p, installments }));
                          }}
                        />
                        <Input
                          label={`بداية الدفع ${!isScheduled && index > 0 ? "(اختياري)" : ""}`}
                          type="date"
                          value={row.startDate ?? ""}
                          onChange={(e) => {
                            const installments = [...planForm.installments];
                            installments[index] = { ...row, startDate: e.target.value };
                            setPlanForm((p) => ({ ...p, installments }));
                          }}
                        />
                        <Input
                          label={`آخر موعد للدفع ${!isScheduled && index > 0 ? "(اختياري)" : ""}`}
                          type="date"
                          value={row.endDate ?? ""}
                          onChange={(e) => {
                            const installments = [...planForm.installments];
                            installments[index] = { ...row, endDate: e.target.value };
                            setPlanForm((p) => ({ ...p, installments }));
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button type="submit" disabled={savingPlan} className="w-full">
                <Save className="h-4 w-4" />
                {savingPlan ? "جاري الحفظ..." : planForm.id ? "حفظ التعديلات" : "حفظ الخطة"}
              </Button>
            </form>
          </Card>
          </div>
        </div>
      )}

      {tab === "access" && (
        <Card className="max-w-lg">
          <h3 className="mb-2 flex items-center gap-2 font-bold text-p-black">
            <Unlock className="h-5 w-5 text-p-green" />
            فتح الوصول مؤقتاً
          </h3>
          <p className="mb-4 text-sm text-p-black/60">
            يسمح للطالب غير المسدّد بالدخول إلى المنصة لفترة محددة، ثم يُغلق الوصول تلقائياً.
          </p>
          <form onSubmit={grantAccess} className="space-y-4">
            <StudentSearchSelect
              students={students}
              value={accessStudentId}
              onChange={setAccessStudentId}
            />
            <Input
              label="مدة الفتح (بالأيام)"
              type="number"
              min="1"
              max="30"
              value={accessDays}
              onChange={(e) => setAccessDays(e.target.value)}
              required
            />
            <Button type="submit" disabled={grantingAccess} className="w-full">
              {grantingAccess ? "جاري التفعيل..." : "فتح الوصول"}
            </Button>
          </form>
        </Card>
      )}

      {approveTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setApproveTarget(null)}
        >
          <Card className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-p-black">تأكيد اعتماد الدفعة</h3>
            <p className="mt-2 text-sm text-p-black/70">
              الطالب: <strong>{approveTarget.studentName}</strong>
            </p>
            <p className="mt-1 text-sm text-p-black/70">
              المبلغ المُعلن من ولي الأمر: <strong>{approveTarget.declaredAmount} ₪</strong>
            </p>
            <div className="mt-4">
              <Input
                label="المبلغ الذي سيُخصم من الرصيد (₪)"
                type="number"
                min="0"
                step="0.01"
                value={approveAmount}
                onChange={(e) => setApproveAmount(e.target.value)}
              />
              <p className="mt-2 text-xs text-p-black/50">
                عدّل المبلغ إذا كان المبلغ المحوّل يختلف عما أدخله ولي الأمر.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setApproveTarget(null)} disabled={approving}>
                إلغاء
              </Button>
              <Button onClick={confirmApprove} disabled={approving}>
                {approving ? "جاري الاعتماد..." : "تأكيد الاعتماد"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
