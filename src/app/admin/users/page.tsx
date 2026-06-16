"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import type { AccountCredentials, SystemUser } from "@/types";
import { KeyRound, Plus, Search, Trash2, X } from "lucide-react";

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
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SystemUser | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<SystemUser | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [confirmResetUser, setConfirmResetUser] = useState<SystemUser | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetCredentials, setResetCredentials] = useState<AccountCredentials | null>(null);
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

  async function resetUserPassword(user: SystemUser) {
    setResettingPassword(true);
    setError("");
    try {
      const data = (await api.resetAdminUserPassword(user.id)) as Record<string, unknown>;
      setResetCredentials({
        name: String(data.name ?? user.name),
        username: String(data.username ?? user.username),
        password: String(data.password ?? ""),
        role: "admin",
      });
      setConfirmResetUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إعادة تعيين كلمة المرور");
    } finally {
      setResettingPassword(false);
    }
  }

  const hasActiveFilters = Boolean(search.trim() || roleFilter || statusFilter);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      if (roleFilter && user.role !== roleFilter) return false;
      if (statusFilter && user.status !== statusFilter) return false;

      if (query) {
        const haystack = [user.name, user.username, roleLabels[user.role]]
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

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="إدارة المستخدمين"
          description="إنشاء وإدارة حسابات الإدارة بأدوار وصلاحيات مختلفة."
        />
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4" />
          حساب إدارة جديد
        </Button>
      </div>

      {resetCredentials && (
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
      )}

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

      <Card className="mb-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative sm:col-span-2 lg:col-span-3">
            <Search className="absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-p-black/40" />
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
          <p className="text-sm text-p-black/60">
            عرض {filteredUsers.length} من {users.length} مستخدم
          </p>
          {hasActiveFilters && (
            <Button variant="outline" className="px-3 py-1.5 text-xs" onClick={clearFilters}>
              مسح الفلاتر
            </Button>
          )}
        </div>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-p-cream text-p-black/60">
              <th className="px-4 py-3 text-start font-semibold">الاسم</th>
              <th className="px-4 py-3 text-start font-semibold">اسم المستخدم</th>
              <th className="px-4 py-3 text-start font-semibold">الدور</th>
              <th className="px-4 py-3 text-start font-semibold">الحالة</th>
              <th className="px-4 py-3 text-start font-semibold">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-p-black/50">
                  {hasActiveFilters ? "لا توجد نتائج مطابقة للبحث أو الفلاتر" : "لا يوجد مستخدمون"}
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
              <tr key={u.id} className="border-b border-neutral-50">
                <td className="px-4 py-3 font-medium text-p-black">{u.name}</td>
                <td className="px-4 py-3" dir="ltr">
                  {u.username}
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
                      variant="outline"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => {
                        setError("");
                        setConfirmResetUser(u);
                      }}
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      كلمة السر
                    </Button>
                    <Button
                      variant="danger"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => {
                        setError("");
                        setConfirmDeleteUser(u);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {confirmDeleteUser && (
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
              {error && (
                <Alert variant="error" className="mt-4">
                  {error}
                </Alert>
              )}
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
      )}

      {confirmResetUser && (
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
              {error && (
                <Alert variant="error" className="mt-4">
                  {error}
                </Alert>
              )}
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
      )}
    </div>
  );
}
