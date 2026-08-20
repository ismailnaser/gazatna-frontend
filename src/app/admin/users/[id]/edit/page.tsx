"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { PageBusy, PageHeader } from "@/components/molecules/PageHeader";
import { useAuth } from "@/context/AuthContext";
import {
  adminRoleDescriptions,
  adminRoleOptions,
  isAdminRole,
  isSuperAdmin,
} from "@/lib/adminRoles";
import { api } from "@/lib/api";
import type { SystemUser } from "@/types";
import { ArrowRight } from "lucide-react";

const statusOptions = [
  { value: "active", label: "نشط" },
  { value: "inactive", label: "معطّل" },
];

export default function AdminUserEditPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [editing, setEditing] = useState<SystemUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editRole, setEditRole] = useState<string>("admin_students");

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isSuperAdmin(user.role)) {
      router.replace("/admin");
      return;
    }
    if (!id) return;
    setLoading(true);
    api
      .getAdminUsers()
      .then((data) => {
        const found = (data as SystemUser[]).find((row) => String(row.id) === id) ?? null;
        setEditing(found);
        if (found && isAdminRole(found.role)) setEditRole(found.role);
      })
      .catch(() => setEditing(null))
      .finally(() => setLoading(false));
  }, [authLoading, user, router, id]);

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
        role: form.get("role"),
        status: form.get("status"),
      };
      if (password) payload.password = password;
      await api.updateAdminUser(editing.id, payload);
      router.push("/admin/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تحديث الحساب");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || !user || !isSuperAdmin(user.role) || loading) {
    return <PageBusy title="تعديل الحساب" description="تحديث بيانات حساب الإدارة" />;
  }

  if (!editing) {
    return (
      <div className="space-y-4">
        <PageHeader title="تعديل الحساب" description="تعذر العثور على المستخدم" />
        <Button href="/admin/users" variant="outline">
          العودة للقائمة
        </Button>
      </div>
    );
  }

  const editRoleDescription = isAdminRole(editRole) ? adminRoleDescriptions[editRole] : "";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader title="تعديل الحساب" description={editing.name} />
        <Button href="/admin/users" variant="outline" className="gap-2">
          <ArrowRight className="h-4 w-4" />
          العودة للقائمة
        </Button>
      </div>

      <Card>
        {error ? (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        ) : null}
        <form key={editing.id} onSubmit={handleUpdate} className="grid gap-4 sm:grid-cols-2">
          <Input label="الاسم" name="name" defaultValue={editing.name} required />
          <Input
            label="اسم المستخدم"
            name="username"
            defaultValue={editing.username}
            required
            dir="ltr"
          />
          <Select
            label="دور الإدارة"
            name="role"
            options={adminRoleOptions}
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
          />
          {editRoleDescription ? (
            <p className="sm:col-span-2 rounded-xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-3 text-sm leading-relaxed text-p-black/75">
              {editRoleDescription}
            </p>
          ) : null}
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
          <div className="sm:col-span-2 flex flex-wrap gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "جاري الحفظ..." : "حفظ التعديلات"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
              إلغاء
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
