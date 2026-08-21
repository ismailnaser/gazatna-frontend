"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { SearchField } from "@/components/molecules/SearchField";
import { EmptyState } from "@/components/molecules/EmptyState";
import { TABLE_BASE, TABLE_TD, TABLE_TH, TABLE_WRAP } from "@/components/shared/DataTable";
import { api, peekCachedList } from "@/lib/api";
import { formatMetaDate } from "@/lib/dateDisplay";
import { classLabel, type InactiveStudent } from "@/lib/adminNotifications";
import { Check } from "lucide-react";

export default function AdminNotificationsInactivePage() {
  const cached = peekCachedList<InactiveStudent>("/admin/notifications/inactive-students/");
  const [inactive, setInactive] = useState<InactiveStudent[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [activatingId, setActivatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getAdminInactiveStudents()
      .then((res) => {
        if (!cancelled) setInactive(res as InactiveStudent[]);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "تعذر تحميل التفاصيل");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return inactive;
    return inactive.filter((s) =>
      [s.name, s.studentNumber, s.nationalId, s.grade, s.section]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [inactive, search]);

  async function activateStudent(id: string) {
    setActivatingId(id);
    setError("");
    try {
      await api.updateAdminStudent(id, { is_active: true });
      setInactive((prev) => prev.filter((s) => s.id !== id));
      setSuccess("تم تفعيل الطالب بنجاح.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تفعيل الطالب");
    } finally {
      setActivatingId(null);
    }
  }

  return (
    <WorkspacePage
      title="حسابات غير نشطة"
      description="الطلاب المسجّلون الذين لم يُفعَّل حسابهم بعد."
      breadcrumbs={[{ label: "التنبيهات", href: "/admin/notifications" }, { label: "حسابات غير نشطة" }]}
      loading={loading}
      loadingMessage="جاري تحميل الحسابات..."
    >
      {success ? <Alert variant="success" className="mb-4">{success}</Alert> : null}
      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-p-black/65">{filtered.length} حساب</p>
        <SearchField value={search} onChange={setSearch} placeholder="بحث بالاسم أو رقم الطالب..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={search.trim() ? "لا توجد نتائج" : "لا يوجد طلاب غير نشطين"} />
      ) : (
        <div className={TABLE_WRAP}>
          <div className="overflow-x-auto">
            <table className={TABLE_BASE}>
              <thead>
                <tr>
                  <th className={TABLE_TH}>الطالب</th>
                  <th className={TABLE_TH}>الصف</th>
                  <th className={TABLE_TH}>تاريخ التسجيل</th>
                  <th className={TABLE_TH}>الحالة</th>
                  <th className={TABLE_TH}>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const { date, time } = formatMetaDate(s.createdAt);
                  return (
                    <tr key={s.id} className="hover:bg-neutral-50/80">
                      <td className={TABLE_TD}>
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-xs text-p-black/50" dir="ltr">#{s.studentNumber}</p>
                      </td>
                      <td className={TABLE_TD}>{classLabel(s.grade, s.section)}</td>
                      <td className={TABLE_TD}>
                        <p dir="ltr">{date}</p>
                        {time ? <p className="text-xs text-p-black/50" dir="ltr">{time}</p> : null}
                      </td>
                      <td className={TABLE_TD}>
                        <Badge variant="warning">غير نشط</Badge>
                      </td>
                      <td className={TABLE_TD}>
                        <Button
                          className="px-3 py-1.5 text-xs"
                          disabled={activatingId === s.id}
                          onClick={() => activateStudent(s.id)}
                        >
                          <Check className="h-3.5 w-3.5" />
                          {activatingId === s.id ? "جاري التفعيل..." : "تفعيل"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </WorkspacePage>
  );
}
