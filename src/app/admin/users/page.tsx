"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Select } from "@/components/atoms/Select";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { PageBusy, PageHeader } from "@/components/molecules/PageHeader";
import { useAuth } from "@/context/AuthContext";
import {
  adminRoleLabels,
  adminRoleOptions,
  isSuperAdmin,
} from "@/lib/adminRoles";
import { api } from "@/lib/api";
import type { AccountCredentials, SystemUser } from "@/types";
import { Plus, Search } from "lucide-react";

const statusOptions = [
  { value: "active", label: "نشط" },
  { value: "inactive", label: "معطّل" },
];

const roleFilterOptions = [
  { value: "", label: "كل الأدوار" },
  ...adminRoleOptions,
];

const statusFilterOptions = [
  { value: "", label: "كل الحالات" },
  ...statusOptions,
];

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<SystemUser | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [confirmResetUser, setConfirmResetUser] = useState<SystemUser | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetCredentials, setResetCredentials] = useState<AccountCredentials | null>(null);
  const pageTopRef = useRef<HTMLDivElement>(null);

  function scrollToPageTop() {
    pageTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isSuperAdmin(user.role)) {
      router.replace("/admin");
      return;
    }
    api
      .getAdminUsers()
      .then((data) => setUsers(data as SystemUser[]))
      .catch(() => setUsers([]));
  }, [authLoading, user, router]);

  async function handleDelete(id: string) {
    await api.deleteAdminUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  async function confirmDelete() {
    if (!confirmDeleteUser) return;
    setDeletingUser(true);
    setError("");
    try {
      await handleDelete(confirmDeleteUser.id);
      setConfirmDeleteUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حذف الحساب");
    } finally {
      setDeletingUser(false);
    }
  }

  async function resetUserPassword(target: SystemUser) {
    setResettingPassword(true);
    setError("");
    try {
      const data = (await api.resetAdminUserPassword(target.id)) as Record<string, unknown>;
      setResetCredentials({
        name: String(data.name ?? target.name),
        username: String(data.username ?? target.username),
        password: String(data.password ?? ""),
        role: "admin",
      });
      setConfirmResetUser(null);
      scrollToPageTop();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إعادة تعيين كلمة المرور");
    } finally {
      setResettingPassword(false);
    }
  }

  const hasActiveFilters = Boolean(search.trim() || roleFilter || statusFilter);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((row) => {
      if (roleFilter && row.role !== roleFilter) return false;
      if (statusFilter && row.status !== statusFilter) return false;

      if (query) {
        const haystack = [
          row.name,
          row.username,
          adminRoleLabels[row.role as keyof typeof adminRoleLabels] ?? row.role,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  function clearFilters() {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
  }

  if (authLoading || !user || !isSuperAdmin(user.role)) {
    return <PageBusy title="إدارة المستخدمين" />;
  }

  return (
    <div ref={pageTopRef}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="إدارة المستخدمين"
          description="إنشاء وإدارة حسابات الإدارة بأدوار وصلاحيات مختلفة."
        />
        <Button onClick={() => router.push("/admin/users/create")}>
          <Plus className="h-4 w-4" />
          حساب إدارة جديد
        </Button>
      </div>

      {resetCredentials ? (
        <Alert variant="success" className="mb-6">
          <p className="mb-2 font-semibold">تم إعادة تعيين كلمة المرور — احفظ بيانات الدخول:</p>
          <p>الاسم: {resetCredentials.name}</p>
          <p>
            اسم المستخدم: <span dir="ltr">{resetCredentials.username}</span>
          </p>
          <p>
            كلمة المرور الجديدة: <span dir="ltr">{resetCredentials.password}</span>
          </p>
        </Alert>
      ) : null}

      <Card className="mb-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative sm:col-span-2 lg:col-span-3">
            <Search className="absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-p-black/75" />
            <input
              type="text"
              placeholder="بحث بالاسم أو اسم المستخدم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 py-2.5 pe-4 ps-10 text-sm focus:border-p-green focus:outline-none focus:ring-2 focus:ring-p-green/20"
            />
          </div>
          <Select
            label="الدور"
            name="roleFilter"
            options={roleFilterOptions}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          />
          <Select
            label="الحالة"
            name="statusFilter"
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4">
          <p className="text-sm text-p-black/78">
            عرض {filteredUsers.length} من {users.length} مستخدم
          </p>
          {hasActiveFilters ? (
            <Button variant="outline" className="px-3 py-1.5 text-xs" onClick={clearFilters}>
              مسح الفلاتر
            </Button>
          ) : null}
        </div>
      </Card>

      <AdminUsersTable
        users={filteredUsers}
        hasActiveFilters={hasActiveFilters}
        onEdit={(row) => router.push(`/admin/users/${row.id}/edit`)}
        onResetPassword={(row) => {
          setError("");
          setConfirmResetUser(row);
        }}
        onDelete={(row) => {
          setError("");
          setConfirmDeleteUser(row);
        }}
      />

      {confirmDeleteUser ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setError("");
            setConfirmDeleteUser(null);
          }}
        >
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <Card className="p-6">
              <p className="text-base font-bold text-p-black">تأكيد حذف الحساب</p>
              <p className="mt-2 text-sm text-p-black/70">
                هل أنت متأكد من حذف حساب{" "}
                <span className="font-semibold">{confirmDeleteUser.name}</span> (
                <span dir="ltr">{confirmDeleteUser.username}</span>)؟ لا يمكن التراجع عن هذا
                الإجراء.
              </p>
              {error ? (
                <Alert variant="error" className="mt-4">
                  {error}
                </Alert>
              ) : null}
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setError("");
                    setConfirmDeleteUser(null);
                  }}
                >
                  إلغاء
                </Button>
                <Button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deletingUser}
                  className="bg-p-red hover:bg-p-red/90 focus-visible:ring-p-red"
                >
                  {deletingUser ? "جاري الحذف..." : "حذف"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {confirmResetUser ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setError("");
            setConfirmResetUser(null);
          }}
        >
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <Card className="p-6">
              <p className="text-base font-bold text-p-black">تأكيد تغيير كلمة المرور</p>
              <p className="mt-2 text-sm text-p-black/70">
                هل أنت متأكد من إعادة تعيين كلمة مرور حساب{" "}
                <span className="font-semibold">{confirmResetUser.name}</span>؟ سيتم إنشاء كلمة مرور
                جديدة وعرضها مرة واحدة.
              </p>
              {error ? (
                <Alert variant="error" className="mt-4">
                  {error}
                </Alert>
              ) : null}
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setError("");
                    setConfirmResetUser(null);
                  }}
                >
                  إلغاء
                </Button>
                <Button
                  type="button"
                  onClick={() => resetUserPassword(confirmResetUser)}
                  disabled={resettingPassword}
                >
                  {resettingPassword ? "جاري التغيير..." : "تأكيد"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
