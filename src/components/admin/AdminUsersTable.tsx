"use client";

import { useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import {
  ExpandRowButton,
  TABLE_BASE,
  TABLE_TD,
  TABLE_TH,
  TABLE_WRAP,
  TablePagination,
  useClientPagination,
} from "@/components/shared/DataTable";
import { adminRoleLabels } from "@/lib/adminRoles";
import { cn } from "@/lib/utils";
import type { SystemUser } from "@/types";
import { KeyRound, Pencil, Trash2 } from "lucide-react";

type AdminUsersTableProps = {
  users: SystemUser[];
  hasActiveFilters: boolean;
  onEdit: (user: SystemUser) => void;
  onResetPassword: (user: SystemUser) => void;
  onDelete: (user: SystemUser) => void;
};

export function AdminUsersTable({
  users,
  hasActiveFilters,
  onEdit,
  onResetPassword,
  onDelete,
}: AdminUsersTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { page, totalPages, pageItems, pageSize, total, next, prev, setPage } =
    useClientPagination(users, 10);

  if (users.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-p-black/72">
        {hasActiveFilters ? "لا توجد نتائج مطابقة للبحث أو الفلاتر" : "لا يوجد مستخدمون"}
      </p>
    );
  }

  return (
    <div className={TABLE_WRAP}>
      <div className="overflow-x-auto">
        <table className={TABLE_BASE}>
          <thead>
            <tr>
              <th className={TABLE_TH}>الاسم</th>
              <th className={cn(TABLE_TH, "w-44")}>اسم المستخدم</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((u, index) => {
              const open = expandedId === u.id;
              return (
                <tr key={u.id} className={cn(index % 2 === 1 && "bg-neutral-50/70")}>
                  <td className={TABLE_TD} colSpan={open ? 2 : 1}>
                    {!open ? (
                      <ExpandRowButton
                        open={false}
                        label={u.name}
                        onClick={() => setExpandedId(u.id)}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-bold text-p-black">{u.name}</p>
                            <p className="mt-1 text-sm text-p-black/72" dir="ltr">
                              {u.username}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="px-3 py-1.5 text-xs"
                            onClick={() => setExpandedId(null)}
                          >
                            إغلاق
                          </Button>
                        </div>

                        <dl className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <dt className="text-xs font-semibold text-p-black/72">الدور</dt>
                            <dd className="mt-0.5 font-medium">
                              {adminRoleLabels[u.role as keyof typeof adminRoleLabels] ?? u.role}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold text-p-black/72">الحالة</dt>
                            <dd className="mt-1">
                              <Badge variant={u.status === "active" ? "success" : "default"}>
                                {u.status === "active" ? "نشط" : "معطّل"}
                              </Badge>
                            </dd>
                          </div>
                        </dl>

                        <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
                          <Button
                            variant="outline"
                            className="gap-1.5 px-3 py-1.5 text-xs"
                            onClick={() => onEdit(u)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            تعديل
                          </Button>
                          <Button
                            variant="outline"
                            className="gap-1.5 px-3 py-1.5 text-xs"
                            onClick={() => onResetPassword(u)}
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                            كلمة السر
                          </Button>
                          <Button
                            variant="danger"
                            className="gap-1.5 px-3 py-1.5 text-xs"
                            onClick={() => onDelete(u)}
                          >
                            <Trash2 className="h-3 w-3" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    )}
                  </td>
                  {!open ? (
                    <td className={cn(TABLE_TD, "font-medium")} dir="ltr">
                      <button
                        type="button"
                        className="text-start font-semibold text-p-black hover:text-brand-blue"
                        onClick={() => setExpandedId(u.id)}
                      >
                        {u.username}
                      </button>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPrev={prev}
        onNext={next}
        onPage={setPage}
      />
    </div>
  );
}
