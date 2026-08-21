"use client";

import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { NumberFieldWithKeypad } from "@/components/teacher/NumberFieldWithKeypad";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { StudentSearchSelect } from "@/components/molecules/StudentSearchSelect";
import { api } from "@/lib/api";
import { Unlock } from "lucide-react";

type StudentOption = {
  id: string;
  name: string;
  grade: string;
  studentNumber: string;
  nationalId?: string;
};

export default function AdminFinanceAccessPage() {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [accessStudentId, setAccessStudentId] = useState("");
  const [accessDays, setAccessDays] = useState("1");
  const [grantingAccess, setGrantingAccess] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    api
      .getAdminStudents()
      .then((data) => {
        setStudents(
          (data as Array<Record<string, unknown>>).map((s) => ({
            id: String(s.id),
            name: String(s.name),
            grade: String(s.grade ?? ""),
            studentNumber: String(s.studentNumber ?? ""),
            nationalId: s.nationalId ? String(s.nationalId) : undefined,
          }))
        );
      })
      .catch(() => setError("تعذر تحميل قائمة الطلاب"))
      .finally(() => setLoading(false));
  }, []);

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
    <WorkspacePage
      title="فتح الوصول"
      description="يسمح لطالب غير مسدّد بالدخول لفترة محددة ثم يُغلق تلقائياً."
      breadcrumbs={[{ label: "المالية", href: "/admin/finance" }, { label: "فتح الوصول" }]}
      loading={loading}
      loadingMessage="جاري تحميل الطلاب..."
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

      <Card className="max-w-lg">
        <h3 className="mb-2 flex items-center gap-2 font-bold text-p-black">
          <Unlock className="h-5 w-5 text-brand-blue" />
          فتح مؤقت
        </h3>
        <form onSubmit={grantAccess} className="space-y-4">
          <StudentSearchSelect students={students} value={accessStudentId} onChange={setAccessStudentId} />
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
    </WorkspacePage>
  );
}
