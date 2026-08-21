"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { NumberFieldWithKeypad } from "@/components/teacher/NumberFieldWithKeypad";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { ImagePreviewModal } from "@/components/molecules/ImagePreviewModal";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { EmptyState } from "@/components/molecules/EmptyState";
import { api, peekCachedList } from "@/lib/api";
import type { PaymentStatus } from "@/types";
import { mapFinanceNotice, type FinanceNotice } from "@/types/finance";
import { Check, Image, RotateCcw, X } from "lucide-react";

export default function AdminFinancePaymentsPage() {
  const cached = peekCachedList<Record<string, unknown>>("/admin/finance/payments/");
  const [notices, setNotices] = useState<FinanceNotice[]>(
    cached ? cached.map((row) => mapFinanceNotice(row)) : []
  );
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [approveTarget, setApproveTarget] = useState<FinanceNotice | null>(null);
  const [approveAmount, setApproveAmount] = useState("");
  const [approving, setApproving] = useState(false);
  const [undoTarget, setUndoTarget] = useState<FinanceNotice | null>(null);
  const [undoing, setUndoing] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getAdminFinance()
      .then((data) => {
        if (cancelled) return;
        setNotices((data as Array<Record<string, unknown>>).map(mapFinanceNotice));
      })
      .catch(() => {
        if (!cancelled) setError("تعذر تحميل إشعارات الدفع");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function rejectNotice(id: string) {
    await api.updateAdminPayment(id, { status: "rejected" });
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "rejected" as PaymentStatus } : n))
    );
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

  async function confirmUndo() {
    if (!undoTarget) return;
    setUndoing(true);
    setError("");
    try {
      await api.updateAdminPayment(undoTarget.id, { status: "pending" });
      const refreshed = await api.getAdminFinance();
      setNotices((refreshed as Array<Record<string, unknown>>).map(mapFinanceNotice));
      setUndoTarget(null);
      setSuccess(`تم التراجع عن اعتماد دفعة ${undoTarget.studentName}.`);
    } catch {
      setError("تعذر التراجع عن اعتماد الدفعة");
    } finally {
      setUndoing(false);
    }
  }

  return (
    <WorkspacePage
      title="إشعارات الدفع"
      description="اعتماد أو رفض الإيصالات المرفوعة من أولياء الأمور."
      breadcrumbs={[
        { label: "المالية", href: "/admin/finance" },
        { label: "إشعارات الدفع" },
      ]}
      loading={loading}
      loadingMessage="جاري تحميل الإشعارات..."
    >
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      ) : null}

      {notices.length === 0 ? (
        <EmptyState title="لا توجد إشعارات دفع" description="ستظهر هنا عند رفع ولي الأمر إيصالاً." />
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-p-black/60">
                  <th className="px-4 py-3 text-start text-xs font-semibold">الطالب</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold">المبلغ المُعلن</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold">المبلغ المُعتمد</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold">التاريخ</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold">الإشعار</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold">الحالة</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold">اعتمدها</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {notices.map((n) => (
                  <tr key={n.id} className="border-b border-neutral-100 hover:bg-neutral-50/80">
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
                          className="flex items-center gap-1 font-semibold text-brand-blue hover:underline"
                        >
                          <Image className="h-4 w-4" />
                          عرض
                        </button>
                      ) : n.source === "manual" ? (
                        <span className="text-p-black/70">يدوي</span>
                      ) : (
                        <span className="text-p-black/50">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={n.status} />
                    </td>
                    <td className="px-4 py-3 text-p-black/70">
                      {n.status === "approved" ? n.reviewedByName || "—" : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {n.status === "pending" ? (
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
                          <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => rejectNotice(n.id)}>
                            <X className="h-3 w-3" />
                            رفض
                          </Button>
                        </div>
                      ) : null}
                      {n.status === "approved" ? (
                        <Button
                          variant="outline"
                          className="px-2 py-1 text-xs"
                          onClick={() => setUndoTarget(n)}
                        >
                          <RotateCcw className="h-3 w-3" />
                          تراجع
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {approveTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setApproveTarget(null)}
        >
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-p-black">تأكيد اعتماد الدفعة</h3>
            <p className="mt-2 text-sm text-p-black/70">
              الطالب: <strong>{approveTarget.studentName}</strong>
            </p>
            <p className="mt-1 text-sm text-p-black/70">
              المبلغ المُعلن: <strong>{approveTarget.declaredAmount} ₪</strong>
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
      ) : null}

      {undoTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => !undoing && setUndoTarget(null)}
        >
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-p-black">التراجع عن اعتماد الدفعة</h3>
            <p className="mt-2 text-sm text-p-black/70">
              سيُعاد {undoTarget.amount} ₪ إلى رصيد {undoTarget.studentName}.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setUndoTarget(null)} disabled={undoing}>
                إلغاء
              </Button>
              <Button variant="danger" onClick={confirmUndo} disabled={undoing}>
                {undoing ? "جاري التراجع..." : "تأكيد التراجع"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      <ImagePreviewModal
        open={Boolean(receiptPreview)}
        src={receiptPreview?.url ?? null}
        title={receiptPreview?.title}
        onClose={() => setReceiptPreview(null)}
      />
    </WorkspacePage>
  );
}
