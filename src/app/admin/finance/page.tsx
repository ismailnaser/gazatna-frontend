"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { NumberFieldWithKeypad } from "@/components/teacher/NumberFieldWithKeypad";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { ImagePreviewModal } from "@/components/molecules/ImagePreviewModal";
import { PageHeader } from "@/components/molecules/PageHeader";
import { AdminFeePlanFormPanel } from "@/components/admin/AdminFeePlanFormPanel";
import { AdminFeePlansTable } from "@/components/admin/AdminFeePlansTable";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { StudentSearchSelect } from "@/components/molecules/StudentSearchSelect";
import { api } from "@/lib/api";
import type { PaymentStatus } from "@/types";
import {
  mapFeePlan,
  mapFinanceNotice,
  mapManualPaymentLog,
  type FeePlan,
  type FinanceNotice,
  type ManualPaymentLog,
} from "@/types/finance";
import type { Grade } from "@/types/teacher";
import type { AcademicYear } from "@/types/academic";
import { mapAcademicYear } from "@/types/academic";
import {
  createDefaultFeePlanForm,
  feePlanToForm,
  formatPlanPayload,
  validateFeePlanForm,
  type FeePlanFormState,
} from "@/lib/feePlanForm";
import { Check, ClipboardList, Image, Plus, RotateCcw, Unlock, Wallet, X } from "lucide-react";

type Tab = "payments" | "manual" | "plans" | "access";

export default function AdminFinancePage() {
  const [tab, setTab] = useState<Tab>("payments");
  const [notices, setNotices] = useState<FinanceNotice[]>([]);
  const [plans, setPlans] = useState<FeePlan[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [planValidationError, setPlanValidationError] = useState("");
  const [students, setStudents] = useState<
    Array<{ id: string; name: string; grade: string; studentNumber: string; nationalId?: string }>
  >([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [approveTarget, setApproveTarget] = useState<FinanceNotice | null>(null);
  const [approveAmount, setApproveAmount] = useState("");
  const [approving, setApproving] = useState(false);
  const [undoTarget, setUndoTarget] = useState<{
    id: string;
    studentName: string;
    amount: number;
    kind: "notice" | "manual";
  } | null>(null);
  const [undoing, setUndoing] = useState(false);

  const [planForm, setPlanForm] = useState<FeePlanFormState>(() => createDefaultFeePlanForm([]));
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [deletePlanTarget, setDeletePlanTarget] = useState<FeePlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState(false);

  const [accessStudentId, setAccessStudentId] = useState("");
  const [accessDays, setAccessDays] = useState("1");
  const [grantingAccess, setGrantingAccess] = useState(false);
  const [manualStudentId, setManualStudentId] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [recordingManual, setRecordingManual] = useState(false);
  const [manualLogs, setManualLogs] = useState<ManualPaymentLog[]>([]);
  const [loadingManualLogs, setLoadingManualLogs] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const planFormRef = useRef<HTMLDivElement>(null);

  async function loadManualLogs() {
    setLoadingManualLogs(true);
    try {
      const data = await api.getAdminManualPayments();
      setManualLogs((data as Array<Record<string, unknown>>).map(mapManualPaymentLog));
    } catch {
      setManualLogs([]);
    } finally {
      setLoadingManualLogs(false);
    }
  }

  useEffect(() => {
    Promise.all([
      api.getAdminFinance().then((data) =>
        setNotices((data as Array<Record<string, unknown>>).map(mapFinanceNotice))
      ),
      api.getAdminFeePlans().then((data) =>
        setPlans((data as Array<Record<string, unknown>>).map(mapFeePlan))
      ),
      api.getAdminGrades().then((data) => setGrades(data as Grade[])),
      api.getAdminAcademicYears().then((data) =>
        setAcademicYears(
          (data as Array<Record<string, unknown>>).map(mapAcademicYear)
        )
      ),
      api.getAdminStudents().then((data) =>
        setStudents(
          (data as Array<Record<string, unknown>>).map((s) => ({
            id: String(s.id),
            name: String(s.name),
            grade: String(s.grade ?? ""),
            studentNumber: String(s.studentNumber ?? ""),
            nationalId: s.nationalId ? String(s.nationalId) : undefined,
          }))
        )
      ),
    ]).catch(() => setError("تعذر تحميل بيانات المالية"));
    loadManualLogs();
  }, []);

  useEffect(() => {
    if (tab === "manual") {
      loadManualLogs();
    }
  }, [tab]);

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
      const refreshed = await api.getAdminFinance();
      setNotices((refreshed as Array<Record<string, unknown>>).map(mapFinanceNotice));
      setApproveTarget(null);
      setSuccess("تم اعتماد الدفعة وخصم المبلغ من رصيد الطالب.");
    } catch {
      setError("تعذر اعتماد الدفعة");
    } finally {
      setApproving(false);
    }
  }

  async function confirmUndoApproval() {
    if (!undoTarget) return;
    setUndoing(true);
    setError("");
    const { id, studentName, amount, kind } = undoTarget;
    try {
      if (kind === "manual") {
        await api.deleteAdminManualPayment(id);
        setManualLogs((prev) => prev.filter((row) => row.id !== id));
        const refreshed = await api.getAdminFinance();
        setNotices((refreshed as Array<Record<string, unknown>>).map(mapFinanceNotice));
      } else {
        await api.updateAdminPayment(id, { status: "pending" });
        const refreshed = await api.getAdminFinance();
        setNotices((refreshed as Array<Record<string, unknown>>).map(mapFinanceNotice));
      }
      setUndoTarget(null);
      setSuccess(
        kind === "manual"
          ? `تم إلغاء الدفعة اليدوية لـ ${studentName} وإرجاع ${amount} ₪ إلى الرصيد.`
          : `تم التراجع عن اعتماد دفعة ${studentName} وإرجاع ${amount} ₪ إلى الرصيد.`
      );
    } catch {
      setError(kind === "manual" ? "تعذر إلغاء الدفعة اليدوية" : "تعذر التراجع عن اعتماد الدفعة");
      if (kind === "manual") {
        await loadManualLogs();
      }
    } finally {
      setUndoing(false);
    }
  }

  function openCreatePlan() {
    setPlanForm(createDefaultFeePlanForm(academicYears));
    setShowPlanForm(true);
    setError("");
    setPlanValidationError("");
    setTimeout(() => planFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function openEditPlan(plan: FeePlan) {
    setPlanForm(feePlanToForm(plan, academicYears));
    setShowPlanForm(true);
    setError("");
    setPlanValidationError("");
    setTimeout(() => planFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function closePlanForm() {
    setShowPlanForm(false);
    setPlanForm(createDefaultFeePlanForm(academicYears));
    setPlanValidationError("");
  }

  async function savePlan(e: React.FormEvent) {
    e.preventDefault();
    const validationMessage = validateFeePlanForm(planForm, academicYears, plans);
    if (validationMessage) {
      setPlanValidationError(validationMessage);
      return;
    }

    setSavingPlan(true);
    setError("");
    setPlanValidationError("");
    const payload = formatPlanPayload(planForm);
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
      closePlanForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ خطة الرسوم");
    } finally {
      setSavingPlan(false);
    }
  }

  async function confirmDeletePlan() {
    if (!deletePlanTarget) return;
    setDeletingPlan(true);
    setError("");
    try {
      await api.deleteAdminFeePlan(deletePlanTarget.id);
      setPlans((prev) => prev.filter((p) => p.id !== deletePlanTarget.id));
      if (planForm.id === deletePlanTarget.id) {
        closePlanForm();
      }
      setDeletePlanTarget(null);
      setSuccess(`تم حذف خطة ${deletePlanTarget.name}.`);
    } catch {
      setError("تعذر حذف خطة الرسوم");
    } finally {
      setDeletingPlan(false);
    }
  }

  const coveredGradesCount = useMemo(() => {
    const unique = new Set<string>();
    for (const plan of plans) {
      for (const grade of plan.gradeNames) unique.add(grade);
    }
    return unique.size;
  }, [plans]);

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

  async function recordManualPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!manualStudentId) {
      setError("يرجى اختيار طالب من نتائج البحث");
      return;
    }
    const amount = Number(manualAmount);
    if (!amount || amount <= 0) {
      setError("أدخل مبلغاً صحيحاً أكبر من صفر");
      return;
    }

    setRecordingManual(true);
    setError("");
    setSuccess("");
    try {
      const result = (await api.recordAdminManualPayment({
        studentId: manualStudentId,
        amount,
        note: manualNote.trim() || undefined,
      })) as Record<string, unknown>;
      const notice = mapFinanceNotice({
        ...result,
        status: "approved",
        reviewedByName: result.reviewedByName ?? null,
      });
      setNotices((prev) => [notice, ...prev]);
      const balance = result.balance as { paid?: number; remaining?: number } | undefined;
      setSuccess(
        balance
          ? `تم تسجيل الدفع وخصم ${amount} ₪ من رصيد الطالب. المتبقي: ${balance.remaining ?? 0} ₪`
          : `تم تسجيل الدفع وخصم ${amount} ₪ من رصيد الطالب.`
      );
      setManualStudentId("");
      setManualAmount("");
      setManualNote("");
      await loadManualLogs();
    } catch {
      setError("تعذر تسجيل الدفع اليدوي");
    } finally {
      setRecordingManual(false);
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
          { id: "manual" as Tab, label: "تسجيل دفع يدوي" },
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
                <th className="px-4 py-3 text-start font-semibold">اعتمدها</th>
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
                      <button
                        type="button"
                        onClick={() =>
                          setReceiptPreview({
                            url: n.receiptUrl!,
                            title: `إشعار دفع — ${n.studentName}`,
                          })
                        }
                        className="flex items-center gap-1 text-p-green hover:underline"
                      >
                        <Image className="h-4 w-4" />
                        عرض
                      </button>
                    ) : n.source === "manual" ? (
                      <span className="text-p-black/60">يدوي</span>
                    ) : (
                      <span className="text-p-black/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={n.status} />
                  </td>
                  <td className="px-4 py-3 text-p-black/70">
                    {n.status === "approved" ? n.reviewedByName || "—" : "—"}
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
                    {n.status === "approved" && (
                      <Button
                        variant="outline"
                        className="px-2 py-1 text-xs text-amber-700 hover:text-amber-800"
                        onClick={() => {
                          setUndoTarget({ id: n.id, studentName: n.studentName, amount: n.amount, kind: "notice" });
                          setError("");
                          setSuccess("");
                        }}
                      >
                        <RotateCcw className="h-3 w-3" />
                        تراجع
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "manual" && (
        <div className="space-y-6">
          <Card className="max-w-lg">
            <h3 className="mb-2 flex items-center gap-2 font-bold text-p-black">
              <Wallet className="h-5 w-5 text-p-green" />
              تسجيل دفع يدوي
            </h3>
            <p className="mb-4 text-sm text-p-black/60">
              للطلاب الذين دفعوا خارج المنصة (نقداً أو تحويل مباشر). ابحث بالاسم أو رقم الطالب أو رقم الهوية، حدد المبلغ،
              وسيُخصم تلقائياً من رصيده.
            </p>
            <form onSubmit={recordManualPayment} className="space-y-4">
              <StudentSearchSelect
                students={students}
                value={manualStudentId}
                onChange={setManualStudentId}
                placeholder="ابحث بالاسم أو رقم الطالب أو رقم الهوية..."
              />
              <NumberFieldWithKeypad
                fieldId="manualAmount"
                label="المبلغ المدفوع (₪)"
                value={manualAmount}
                onChange={setManualAmount}
                min={0.01}
                max={999999}
                allowDecimal
                maxDecimalPlaces={2}
                required
              />
              <Input
                label="ملاحظة (اختياري)"
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                placeholder="مثال: دفع نقدي في المدرسة"
              />
              <Button type="submit" disabled={recordingManual} className="w-full">
                {recordingManual ? "جاري التسجيل..." : "تسجيل الدفع وخصم من الرصيد"}
              </Button>
            </form>
          </Card>

          <Card className="overflow-x-auto p-0">
            <div className="border-b border-neutral-100 px-5 py-4">
              <h3 className="font-bold text-p-black">سجل الدفعات اليدوية</h3>
              <p className="mt-1 text-sm text-p-black/50">
                جميع الدفعات المسجّلة يدوياً من الإدارة مع اسم المستخدم الذي اعتمدها
              </p>
            </div>
            {loadingManualLogs ? (
              <p className="px-5 py-8 text-sm text-neutral-500">جاري تحميل السجل...</p>
            ) : manualLogs.length === 0 ? (
              <p className="px-5 py-8 text-sm text-neutral-500">لا توجد دفعات يدوية مسجّلة بعد.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-p-cream text-p-black/60">
                    <th className="px-4 py-3 text-start font-semibold">الطالب</th>
                    <th className="px-4 py-3 text-start font-semibold">رقم الطالب</th>
                    <th className="px-4 py-3 text-start font-semibold">المبلغ</th>
                    <th className="px-4 py-3 text-start font-semibold">التاريخ</th>
                    <th className="px-4 py-3 text-start font-semibold">اعتمدها</th>
                    <th className="px-4 py-3 text-start font-semibold">ملاحظة</th>
                    <th className="px-4 py-3 text-start font-semibold">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {manualLogs.map((row) => (
                    <tr key={row.id} className="border-b border-neutral-50">
                      <td className="px-4 py-3 font-medium text-p-black">{row.studentName}</td>
                      <td className="px-4 py-3 text-p-black/70" dir="ltr">
                        {row.studentNumber || "—"}
                      </td>
                      <td className="px-4 py-3">{row.amount} ₪</td>
                      <td className="px-4 py-3">{row.date}</td>
                      <td className="px-4 py-3 font-medium text-p-black">{row.reviewedByName}</td>
                      <td className="px-4 py-3 text-p-black/60">{row.note || "—"}</td>
                      <td className="px-4 py-3">
                        <Button
                          variant="outline"
                          className="px-2 py-1 text-xs text-amber-700 hover:text-amber-800"
                          onClick={() => {
                            setUndoTarget({
                              id: row.id,
                              studentName: row.studentName,
                              amount: row.amount,
                              kind: "manual",
                            });
                            setError("");
                            setSuccess("");
                          }}
                        >
                          <RotateCcw className="h-3 w-3" />
                          تراجع
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}

      {tab === "plans" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-brand-blue/15 bg-brand-blue/5 px-4 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-blue shadow-sm">
                <ClipboardList className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-p-black/50">خطط مسجّلة</p>
                <p className="text-lg font-bold text-p-black">{plans.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-p-green/15 bg-p-green/5 px-4 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-p-green shadow-sm">
                <Wallet className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-p-black/50">مراحل مغطاة</p>
                <p className="text-lg font-bold text-p-black">{coveredGradesCount}</p>
              </div>
            </div>
          </div>

          <Card className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-p-black">خطط الرسوم</h3>
                <p className="mt-1 text-sm text-p-black/55">
                  أنشئ خطة جديدة أو عدّل خطة موجودة من الجدول أدناه.
                </p>
              </div>
              {!showPlanForm ? (
                <Button type="button" onClick={openCreatePlan}>
                  <Plus className="h-4 w-4" />
                  خطة جديدة
                </Button>
              ) : null}
            </div>
          </Card>

          {showPlanForm ? (
            <div ref={planFormRef}>
              <Card className="p-4 sm:p-5">
                <AdminFeePlanFormPanel
                  form={planForm}
                  onChange={setPlanForm}
                  gradeOptions={gradeOptions}
                  plans={plans}
                  academicYears={academicYears}
                  saving={savingPlan}
                  validationError={planValidationError}
                  onSubmit={savePlan}
                  onCancel={closePlanForm}
                />
              </Card>
            </div>
          ) : null}

          <Card className="p-4 sm:p-5">
            <h3 className="mb-4 font-bold text-p-black">الخطط المسجّلة</h3>
            <AdminFeePlansTable
              plans={plans}
              activePlanId={showPlanForm ? planForm.id : undefined}
              onCreate={openCreatePlan}
              onEdit={openEditPlan}
              onDelete={(plan) => {
                setError("");
                setDeletePlanTarget(plan);
              }}
            />
          </Card>

          <ConfirmDialog
            open={Boolean(deletePlanTarget)}
            title="تأكيد حذف خطة الرسوم"
            description={
              deletePlanTarget ? (
                <>
                  هل أنت متأكد من حذف خطة{" "}
                  <span className="font-semibold">{deletePlanTarget.name}</span>؟ لا يمكن التراجع عن
                  هذا الإجراء.
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
            <NumberFieldWithKeypad
              fieldId="financeAccessDays"
              label="مدة الفتح (بالأيام)"
              value={accessDays}
              onChange={setAccessDays}
              min={1}
              max={30}
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
              <NumberFieldWithKeypad
                fieldId="approveAmount"
                label="المبلغ الذي سيُخصم من الرصيد (₪)"
                value={approveAmount}
                onChange={setApproveAmount}
                min={0}
                max={999999}
                allowDecimal
                maxDecimalPlaces={2}
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

      {undoTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => !undoing && setUndoTarget(null)}
        >
          <Card className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-p-black">
              {undoTarget.kind === "manual" ? "التراجع عن الدفعة اليدوية" : "التراجع عن اعتماد الدفعة"}
            </h3>
            <p className="mt-2 text-sm text-p-black/70">
              الطالب: <strong>{undoTarget.studentName}</strong>
            </p>
            <p className="mt-1 text-sm text-p-black/70">
              المبلغ: <strong>{undoTarget.amount} ₪</strong>
            </p>
            <p className="mt-3 text-sm text-amber-800">
              {undoTarget.kind === "manual"
                ? "سيُعاد المبلغ إلى رصيد الطالب وتُحذف الدفعة من السجل."
                : "سيُعاد المبلغ إلى رصيد الطالب وتعود حالة الإشعار إلى «قيد المراجعة»."}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setUndoTarget(null)} disabled={undoing}>
                إلغاء
              </Button>
              <Button variant="danger" onClick={confirmUndoApproval} disabled={undoing}>
                {undoing ? "جاري التراجع..." : "تأكيد التراجع"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <ImagePreviewModal
        open={Boolean(receiptPreview)}
        src={receiptPreview?.url ?? null}
        title={receiptPreview?.title}
        onClose={() => setReceiptPreview(null)}
      />
    </div>
  );
}
