"use client";

import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { PageHeader } from "@/components/molecules/PageHeader";
import { roleLabels } from "@/data/navigation";
import { adminRoleOptions } from "@/lib/adminRoles";
import { api } from "@/lib/api";
import type { SystemUser } from "@/types";
import { Plus, Trash2, X } from "lucide-react";

const statusOptions = [
  { value: "active", label: "نشط" },
  { value: "inactive", label: "معطّل" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SystemUser | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const scrollToFormRef = useRef(false);

  useEffect(() => {
    api.getAdminUsers()
      .then((data) => setUsers(data as SystemUser[]))
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    if (!scrollToFormRef.current || !formRef.current) return;
    if (!editing && !showForm) return;
    formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    scrollToFormRef.current = false;
  }, [editing, showForm]);

  function openCreateForm() {
    setEditing(null);
    setShowForm(true);
    setError("");
  }

  function openEditForm(user: SystemUser) {
    setShowForm(false);
    setEditing(user);
    setError("");
    scrollToFormRef.current = true;
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setError("");
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    try {
      const created = (await api.createAdminUser({
        name: form.get("name"),
        username: form.get("username"),
        email: form.get("email"),
        role: form.get("role"),
        password: form.get("password"),
        status: "active",
      })) as SystemUser;
      setUsers((prev) => [created, ...prev]);
      closeForm();
      formEl.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إنشاء الحساب");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setError("");
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");

    try {
      const payload: Record<string, unknown> = {
        name: form.get("name"),
        username: form.get("username"),
        email: form.get("email"),
        role: form.get("role"),
        status: form.get("status"),
      };
      if (password) payload.password = password;

      const updated = (await api.updateAdminUser(editing.id, payload)) as SystemUser;
      setUsers((prev) => prev.map((u) => (u.id === editing.id ? updated : u)));
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تحديث الحساب");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    await api.deleteAdminUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (editing?.id === id) closeForm();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="إدارة المستخدمين"
          description="إنشاء حسابات الإدارة بأدوار مختلفة. حسابات المعلمين والطلاب تُنشأ تلقائياً."
        />
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4" />
          حساب إدارة جديد
        </Button>
      </div>

      <div ref={formRef}>
        {showForm && (
          <Card className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-p-black">حساب إدارة جديد</h3>
              <button type="button" onClick={closeForm}>
                <X className="h-5 w-5 text-p-black/40" />
              </button>
            </div>
            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}
            <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
              <Input label="الاسم" name="name" required />
              <Input label="اسم المستخدم" name="username" required dir="ltr" />
              <Input label="البريد الإلكتروني" name="email" type="email" required />
              <Select
                label="دور الإدارة"
                name="role"
                options={adminRoleOptions}
                defaultValue="admin_students"
              />
              <Input
                label="كلمة المرور"
                name="password"
                type="password"
                required
                className="sm:col-span-2"
              />
              <div className="sm:col-span-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "جاري الإنشاء..." : "إنشاء حساب الإدارة"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {editing && (
          <Card className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-p-black">تعديل الحساب</h3>
              <button type="button" onClick={closeForm}>
                <X className="h-5 w-5 text-p-black/40" />
              </button>
            </div>
            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}
            <form
              key={editing.id}
              onSubmit={handleUpdate}
              className="grid gap-4 sm:grid-cols-2"
            >
              <Input label="الاسم" name="name" defaultValue={editing.name} required />
              <Input
                label="اسم المستخدم"
                name="username"
                defaultValue={editing.username}
                required
                dir="ltr"
              />
              <Input
                label="البريد الإلكتروني"
                name="email"
                type="email"
                defaultValue={editing.email}
                required
              />
              <Select
                label="دور الإدارة"
                name="role"
                options={adminRoleOptions}
                defaultValue={editing.role}
              />
              <Select
                label="الحالة"
                name="status"
                options={statusOptions}
                defaultValue={editing.status}
              />
              <Input
                label="كلمة مرور جديدة (اختياري)"
                name="password"
                type="password"
                className="sm:col-span-2"
              />
              <div className="sm:col-span-2 flex gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "جاري الحفظ..." : "حفظ التعديلات"}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  إلغاء
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-p-cream text-p-black/60">
              <th className="px-4 py-3 text-start font-semibold">الاسم</th>
              <th className="px-4 py-3 text-start font-semibold">اسم المستخدم</th>
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
                  {u.username}
                </td>
                <td className="px-4 py-3" dir="ltr">
                  {u.email}
                </td>
                <td className="px-4 py-3">{roleLabels[u.role] ?? u.role}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.status === "active" ? "success" : "default"}>
                    {u.status === "active" ? "نشط" : "معطّل"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => openEditForm(u)}
                    >
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
