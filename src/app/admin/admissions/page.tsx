"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { PageHeader } from "@/components/molecules/PageHeader";
import { api } from "@/lib/api";
import { Check, Save } from "lucide-react";

type Admission = {
  id: string;
  studentName: string;
  birthDate: string | null;
  grade: string;
  parentName: string;
  phone: string;
  email: string;
  notes: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedStudentId: string | null;
};

export default function AdminAdmissionsPage() {
  const [items, setItems] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [approveTarget, setApproveTarget] = useState<Admission | null>(null);
  const [studentNumber, setStudentNumber] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [section, setSection] = useState("");
  const [approving, setApproving] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = (await api.getAdminAdmissions()) as unknown[];
      setItems(res as Admission[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحميل الطلبات");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const pending = useMemo(() => items.filter((i) => i.status === "pending"), [items]);
  const approved = useMemo(() => items.filter((i) => i.status === "approved"), [items]);

  async function approve() {
    if (!approveTarget) return;
    setApproving(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.approveAdminAdmission(approveTarget.id, {
        studentNumber: studentNumber || undefined,
        gradeLevel: gradeLevel || undefined,
        section: section || undefined,
      });
      const row = res as Record<string, unknown>;
      const sid = row.studentId ? String(row.studentId) : null;
      setItems((prev) =>
        prev.map((a) =>
          a.id === approveTarget.id
            ? { ...a, status: "approved", approvedStudentId: sid }
            : a
        )
      );
      setSuccess("تم اعتماد الطلب وإنشاء طالب.");
      setApproveTarget(null);
      setStudentNumber("");
      setGradeLevel("");
      setSection("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر اعتماد الطلب");
    } finally {
      setApproving(false);
    }
  }

  return (
    <div>
      <PageHeader title="طلبات القبول والتسجيل" description="طلبات جديدة من فورم التسجيل في الموقع" />

      {success && (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      )}
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={load} disabled={loading}>
          {loading ? "جاري التحميل..." : "تحديث"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-bold text-p-black">قيد المراجعة ({pending.length})</h3>
          {pending.length === 0 ? (
            <p className="text-sm text-neutral-500">لا توجد طلبات جديدة.</p>
          ) : (
            <div className="space-y-3">
              {pending.map((a) => (
                <div key={a.id} className="rounded-xl border border-neutral-100 p-4">
                  <p className="font-semibold text-p-black">{a.studentName}</p>
                  <p className="mt-1 text-sm text-p-black/60">
                    ولي الأمر: {a.parentName} — {a.phone}
                  </p>
                  <p className="mt-1 text-xs text-p-black/50">
                    المرحلة: {a.grade} {a.birthDate ? `— ميلاد: ${a.birthDate}` : ""}
                  </p>
                  {a.notes && (
                    <p className="mt-2 text-xs text-p-black/60">ملاحظات: {a.notes}</p>
                  )}
                  <div className="mt-3">
                    <Button type="button" onClick={() => setApproveTarget(a)} className="text-xs">
                      <Check className="h-4 w-4" />
                      اعتماد
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="mb-4 font-bold text-p-black">معتمدة ({approved.length})</h3>
          {approved.length === 0 ? (
            <p className="text-sm text-neutral-500">لا توجد طلبات معتمدة بعد.</p>
          ) : (
            <div className="space-y-3">
              {approved.slice(0, 20).map((a) => (
                <div key={a.id} className="rounded-xl border border-neutral-100 p-4">
                  <p className="font-semibold text-p-black">{a.studentName}</p>
                  <p className="mt-1 text-xs text-p-black/50">
                    تم إنشاء طالب: {a.approvedStudentId ?? "-"}
                  </p>
                </div>
              ))}
              {approved.length > 20 && (
                <p className="text-xs text-neutral-500">عرض 20 فقط.</p>
              )}
            </div>
          )}
        </Card>
      </div>

      {approveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6">
            <h3 className="text-lg font-bold text-p-black">اعتماد الطلب</h3>
            <p className="mt-1 text-sm text-p-black/60">{approveTarget.studentName}</p>

            <div className="mt-4 space-y-3">
              <Input
                label="رقم الطالب (اختياري)"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                placeholder="اتركه فارغاً لتوليد رقم تلقائي"
              />
              <Input
                label="المرحلة/الصف (اختياري)"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                placeholder={`الافتراضي: ${approveTarget.grade}`}
              />
              <Input
                label="الشعبة (اختياري)"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="مثال: A"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setApproveTarget(null)}>
                إلغاء
              </Button>
              <Button type="button" onClick={approve} disabled={approving}>
                <Save className="h-4 w-4" />
                {approving ? "جاري الاعتماد..." : "اعتماد وإنشاء طالب"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

