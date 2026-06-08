"use client";

import { useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { mockGrades, mockStudent } from "@/data/mock";
import { Download, Lock } from "lucide-react";

export default function ParentGradesPage() {
  const [student] = useState(mockStudent);
  const grades = mockGrades;

  function handlePdfExport() {
    alert("تم إنشاء كشف العلامات بصيغة PDF (عرض تجريبي — بدون Backend)");
  }

  if (!student.feesPaid) {
    return (
      <div>
        <PageHeader title="النتائج" description="سجل درجات الطالب" />
        <Alert variant="warning">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <p>عذراً، يرجى تسديد الرسوم لعرض العلامات.</p>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeader title="النتائج" description="سجل درجات الطالب للفصل الحالي" />
        <Button onClick={handlePdfExport} className="shrink-0">
          <Download className="h-4 w-4" />
          تحميل الشهادة
        </Button>
      </div>

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
    </div>
  );
}
