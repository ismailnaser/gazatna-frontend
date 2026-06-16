"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { api } from "@/lib/api";
import type { Grade, Student } from "@/types";
import { mapFeeStatus } from "@/types/finance";
import { Download, Lock } from "lucide-react";

export default function ParentGradesPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  const [blocked, setBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState("");

  useEffect(() => {
    Promise.all([
      api.getParentStudent().then((s) => setStudent(s as Student)).catch(() => setStudent(null)),
      api.getParentGrades().then((g) => setGrades(g as Grade[])).catch(() => setGrades([])),
      api.getParentFees().then((data) => {
        const status = mapFeeStatus(data.feeStatus as Record<string, unknown>);
        setBlocked(Boolean(status?.blocked));
        setBlockMessage(status?.message ?? "");
      }).catch(() => {
        setBlocked(false);
        setBlockMessage("");
      }),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  if (!student) {
    return (
      <Card className="text-center text-neutral-500">
        لا يوجد طالب مرتبط بحسابك.
      </Card>
    );
  }

  if (blocked) {
    return (
      <div>
        <PageHeader title="النتائج" description="سجل درجات الطالب" />
        <Alert variant="warning">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <p>{blockMessage || "عذراً، يرجى تسديد القسط المستحق لعرض العلامات."}</p>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeader title="النتائج" description="سجل درجات الطالب للفصل الحالي" />
        <Button onClick={() => alert("ميزة التحميل قيد التطوير")} className="shrink-0">
          <Download className="h-4 w-4" />
          تحميل الشهادة
        </Button>
      </div>

      {grades.length === 0 ? (
        <Card className="text-center text-neutral-500">لا توجد درجات مسجّلة بعد.</Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-p-cream text-p-black/60">
                <th className="px-4 py-3 text-start font-semibold">المادة</th>
                <th className="px-4 py-3 text-start font-semibold">الدرجة</th>
                <th className="px-4 py-3 text-start font-semibold">ملاحظات المعلم</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.id} className="border-b border-neutral-50">
                  <td className="px-4 py-3 font-medium text-p-black">{g.subject}</td>
                  <td className="px-4 py-3 text-p-green">
                    {g.score}/{g.maxScore}
                  </td>
                  <td className="px-4 py-3 text-p-black/50">{g.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
