"use client";

import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { NumberFieldWithKeypad } from "@/components/teacher/NumberFieldWithKeypad";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { EmptyState } from "@/components/molecules/EmptyState";
import { StudentSearchSelect } from "@/components/molecules/StudentSearchSelect";
import { api, peekCachedList } from "@/lib/api";
import { mapManualPaymentLog, type ManualPaymentLog } from "@/types/finance";
import { RotateCcw, Wallet } from "lucide-react";

type StudentOption = {
  id: string;
  name: string;
  grade: string;
  studentNumber: string;
  nationalId?: string;
};

export default function AdminFinanceManualPage() {
  const cachedLogs = peekCachedList<Record<string, unknown>>("/admin/finance/payments/manual/");
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [manualLogs, setManualLogs] = useState<ManualPaymentLog[]>(
    cachedLogs ? cachedLogs.map((row) => mapManualPaymentLog(row)) : []
  );
  const [loading, setLoading] = useState(!cachedLogs);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [manualStudentId, setManualStudentId] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [recordingManual, setRecordingManual] = useState(false);
  const [undoTarget, setUndoTarget] = useState<ManualPaymentLog | null>(null);
  const [undoing, setUndoing] = useState(false);
  const studentsLoadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (!studentsLoadedRef.current) {
          const data = await api.getAdminStudents();
          if (cancelled) return;
          studentsLoadedRef.current = true;
          setStudents(
            (data as Array<Record<string, unknown>>).map((s) => ({
              id: String(s.id),
              name: String(s.name),
              grade: String(s.grade ?? ""),
              studentNumber: String(s.studentNumber ?? ""),
              nationalId: s.nationalId ? String(s.nationalId) : undefined,
            }))
          );
        }
        const logs = await api.getAdminManualPayments();
        if (cancelled) return;
        setManualLogs((logs as Array<Record<string, unknown>>).map(mapManualPaymentLog));
      } catch {
        if (!cancelled) setError("تعذر تحميل الدفع اليدوي");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

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
      const balance = result.balance as { remaining?: number } | undefined;
      setSuccess(
        balance
          ? `تم تسجيل الدفع. المتبقي: ${balance.remaining ?? 0} ₪`
          : `تم تسجيل الدفع وخصم ${amount} ₪.`
      );
      setManualStudentId("");
      setManualAmount("");
      setManualNote("");
      const logs = await api.getAdminManualPayments();
      setManualLogs((logs as Array<Record<string, unknown>>).map(mapManualPaymentLog));
    } catch {
      setError("تعذر تسجيل الدفع اليدوي");
    } finally {
      setRecordingManual(false);
    }
  }

  async function confirmUndo() {
    if (!undoTarget) return;
    setUndoing(true);
    setError("");
    try {
      await api.deleteAdminManualPayment(undoTarget.id);
      setManualLogs((prev) => prev.filter((row) => row.id !== undoTarget.id));
      setSuccess(`تم إلغاء الدفعة اليدوية لـ ${undoTarget.studentName}.`);
      setUndoTarget(null);
    } catch {
      setError("تعذر إلغاء الدفعة اليدوية");
    } finally {
      setUndoing(false);
    }
  }

  return (
    <WorkspacePage
      title="دفع يدوي"
      description="للطلاب الذين دفعوا نقداً أو بتحويل خارج المنصة."
      breadcrumbs={[{ label: "المالية", href: "/admin/finance" }, { label: "دفع يدوي" }]}
      loading={loading}
      loadingMessage="جاري تحميل الدفع اليدوي..."
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,22rem)_1fr]">
        <Card>
          <h3 className="mb-2 flex items-center gap-2 font-bold text-p-black">
            <Wallet className="h-5 w-5 text-brand-blue" />
            تسجيل دفعة
          </h3>
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
              {recordingManual ? "جاري التسجيل..." : "تسجيل الدفع"}
            </Button>
          </form>
        </Card>

        {manualLogs.length === 0 ? (
          <EmptyState title="لا توجد دفعات يدوية" description="ستظهر هنا بعد أول تسجيل." />
        ) : (
          <Card padding="none">
            <div className="border-b border-neutral-200 px-5 py-4">
              <h3 className="font-bold text-p-black">سجل الدفعات</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-p-black/60">
                    <th className="px-4 py-3 text-start text-xs font-semibold">الطالب</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold">المبلغ</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold">التاريخ</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold">اعتمدها</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold">ملاحظة</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {manualLogs.map((row) => (
                    <tr key={row.id} className="border-b border-neutral-100 hover:bg-neutral-50/80">
                      <td className="px-4 py-3 font-medium">{row.studentName}</td>
                      <td className="px-4 py-3">{row.amount} ₪</td>
                      <td className="px-4 py-3">{row.date}</td>
                      <td className="px-4 py-3">{row.reviewedByName}</td>
                      <td className="px-4 py-3 text-p-black/70">{row.note || "—"}</td>
                      <td className="px-4 py-3">
                        <Button variant="outline" className="px-2 py-1 text-xs" onClick={() => setUndoTarget(row)}>
                          <RotateCcw className="h-3 w-3" />
                          تراجع
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {undoTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !undoing && setUndoTarget(null)}
        >
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">التراجع عن الدفعة اليدوية</h3>
            <p className="mt-2 text-sm text-p-black/70">
              سيُعاد {undoTarget.amount} ₪ إلى رصيد {undoTarget.studentName}.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setUndoTarget(null)} disabled={undoing}>
                إلغاء
              </Button>
              <Button variant="danger" onClick={confirmUndo} disabled={undoing}>
                {undoing ? "جاري التراجع..." : "تأكيد"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </WorkspacePage>
  );
}
