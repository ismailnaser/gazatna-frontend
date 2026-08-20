"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowRight } from "lucide-react";

export default function AdminUserCreatePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createRole, setCreateRole] = useState<string>("admin_students");

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isSuperAdmin(user.role)) {
      router.replace("/admin");
    }
  }, [authLoading, user, router]);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      await api.createAdminUser({
        name: form.get("name"),
        username: form.get("username"),
        role: form.get("role"),
        password: form.get("password"),
        status: "active",
      });
      router.push("/admin/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إنشاء الحساب");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || !user || !isSuperAdmin(user.role)) {
    return <PageBusy title="حساب إدارة جديد" description="إنشاء حساب إدارة بصلاحيات محددة" />;
  }

  const createRoleDescription = isAdminRole(createRole)
    ? adminRoleDescriptions[createRole]
    : "";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader title="حساب إدارة جديد" description="إنشاء حساب إدارة بأدوار وصلاحيات مختلفة" />
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
        <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
          <Input label="الاسم" name="name" required />
          <Input label="اسم المستخدم" name="username" required dir="ltr" />
          <Select
            label="دور الإدارة"
            name="role"
            options={adminRoleOptions}
            value={createRole}
            onChange={(e) => setCreateRole(e.target.value)}
          />
          {createRoleDescription ? (
            <p className="sm:col-span-2 rounded-xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-3 text-sm leading-relaxed text-p-black/75">
              {createRoleDescription}
            </p>
          ) : null}
          <Input
            label="كلمة المرور"
            name="password"
            type="password"
            required
            className="sm:col-span-2"
          />
          <div className="sm:col-span-2 flex flex-wrap gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "جاري الإنشاء..." : "إنشاء حساب الإدارة"}
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
