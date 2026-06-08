"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { mockAdminStudents } from "@/data/mock";
import type { AdminStudent } from "@/types";
import { FileText, Plus, X } from "lucide-react";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState(mockAdminStudents);
  const [showForm, setShowForm] = useState(false);
  const [viewDocs, setViewDocs] = useState<string[] | null>(null);

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newStudent: AdminStudent = {
      id: `s${Date.now()}`,
      name: form.get("name") as string,
      grade: form.get("grade") as string,
      paymentStatus: "pending",
      documents: ["شهادة ميلاد"],
    };
    setStudents((prev) => [newStudent, ...prev]);
    setShowForm(false);
    e.currentTarget.reset();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeader title="إدارة الطلاب" description="الأرشيف الرقمي لسجلات الطلاب" />
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          إضافة طالب
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-p-black">طالب جديد</h3>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="h-5 w-5 text-p-black/40" />
            </button>
          </div>
          <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
            <Input label="اسم الطالب" name="name" required />
            <Select
              label="الصف"
              name="grade"
              options={[
                { value: "الصف التاسع", label: "الصف التاسع" },
                { value: "الصف العاشر", label: "الصف العاشر" },
                { value: "الصف الحادي عشر", label: "الصف الحادي عشر" },
              ]}
            />
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-p-black/80">
                الوثائق (شهادة ميلاد، هوية)
              </label>
              <input type="file" multiple className="text-sm" />
            </div>
            <Button type="submit">حفظ</Button>
          </form>
        </Card>
      )}

      {viewDocs && (
        <Card className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-bold text-p-black">الوثائق المرفقة</h3>
            <button type="button" onClick={() => setViewDocs(null)}>
              <X className="h-5 w-5 text-p-black/40" />
            </button>
          </div>
          <ul className="space-y-1 text-sm text-p-black/60">
            {viewDocs.map((d) => (
              <li key={d} className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-p-green" />
                {d}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-p-cream text-p-black/60">
              <th className="px-4 py-3 text-start font-semibold">الاسم</th>
              <th className="px-4 py-3 text-start font-semibold">الصف</th>
              <th className="px-4 py-3 text-start font-semibold">حالة الدفع</th>
              <th className="px-4 py-3 text-start font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-neutral-50">
                <td className="px-4 py-3 font-medium text-p-black">{s.name}</td>
                <td className="px-4 py-3">{s.grade}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.paymentStatus} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="outline" className="px-3 py-1.5 text-xs">
                      تعديل
                    </Button>
                    <Button
                      variant="ghost"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => setViewDocs(s.documents)}
                    >
                      الوثائق
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
