"use client";

import { useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { PageHeader } from "@/components/molecules/PageHeader";
import { roleLabels } from "@/data/navigation";
import { mockUsers } from "@/data/mock";
import type { SystemUser, UserRole } from "@/types";
import { Plus, Trash2 } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([...mockUsers]);
  const [showForm, setShowForm] = useState(false);

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const user: SystemUser = {
      id: `u${Date.now()}`,
      name: form.get("name") as string,
      email: form.get("email") as string,
      role: form.get("role") as UserRole,
      status: "active",
    };
    setUsers((prev) => [user, ...prev]);
    setShowForm(false);
    e.currentTarget.reset();
  }

  function handleDelete(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="إدارة المستخدمين"
          description="إنشاء وتعديل حسابات الطلاب والمعلمين والإدارة"
        />
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          حساب جديد
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
            <Input label="الاسم" name="name" required />
            <Input label="البريد الإلكتروني" name="email" type="email" required />
            <Select
              label="الدور"
              name="role"
              options={[
                { value: "admin", label: "مدير" },
                { value: "teacher", label: "معلم" },
                { value: "parent", label: "ولي أمر" },
              ]}
            />
            <Input label="كلمة المرور" name="password" type="password" required />
            <div className="sm:col-span-2">
              <Button type="submit">إنشاء الحساب</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-p-cream text-p-black/60">
              <th className="px-4 py-3 text-start font-semibold">الاسم</th>
              <th className="px-4 py-3 text-start font-semibold">البريد</th>
              <th className="px-4 py-3 text-start font-semibold">الدور</th>
              <th className="px-4 py-3 text-start font-semibold">الحالة</th>
              <th className="px-4 py-3 text-start font-semibold">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-neutral-50">
                <td className="px-4 py-3 font-medium text-p-black">{u.name}</td>
                <td className="px-4 py-3" dir="ltr">
                  {u.email}
                </td>
                <td className="px-4 py-3">{roleLabels[u.role]}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.status === "active" ? "success" : "default"}>
                    {u.status === "active" ? "نشط" : "معطّل"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="outline" className="px-3 py-1.5 text-xs">
                      تعديل
                    </Button>
                    <Button
                      variant="danger"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => handleDelete(u.id)}
                    >
                      <Trash2 className="h-3 w-3" />
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
