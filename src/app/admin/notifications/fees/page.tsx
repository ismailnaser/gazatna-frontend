"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { NumberFieldWithKeypad } from "@/components/teacher/NumberFieldWithKeypad";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { SearchField } from "@/components/molecules/SearchField";
import { EmptyState } from "@/components/molecules/EmptyState";
import { TABLE_BASE, TABLE_TD, TABLE_TH, TABLE_WRAP } from "@/components/shared/DataTable";
import { api, peekCachedList } from "@/lib/api";
import { formatMetaDate } from "@/lib/dateDisplay";
import {
  classLabel,
  installmentDue,
  installmentName,
  installmentOrder,
  installmentOrderLabel,
  type BlockedStudent,
} from "@/lib/adminNotifications";
import { CreditCard, Unlock } from "lucide-react";

export default function AdminNotificationsFeesPage() {
  const cached = peekCachedList<BlockedStudent>("/admin/notifications/blocked-students/");
  const [blocked, setBlocked] = useState<BlockedStudent[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [accessTarget, setAccessTarget] = useState<BlockedStudent | null>(null);
  const [accessDays, setAccessDays] = useState("1");
  const [grantingAccess, setGrantingAccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .getAdminBlockedStudents()
      .then((res) => {
        if (!cancelled) setBlocked(res as BlockedStudent[]);
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
    if (!query) return blocked;
    return blocked.filter((s) =>
      [s.name, s.studentNumber, s.nationalId, s.grade, s.section]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [blocked, search]);

  async function grantTemporaryAccess() {
    if (!accessTarget) return;
    setGrantingAccess(true);
    setError("");
    try {
      const result = await api.grantStudentFeeAccess(accessTarget.id, Number(accessDays));
      setSuccess(`تم فتح الوصول حتى ${new Date(result.accessOverrideUntil).toLocaleString("ar")}`);
      setBlocked((prev) => prev.filter((s) => s.id !== accessTarget.id));
      setAccessTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر فتح الوصول");
    } finally {
      setGrantingAccess(false);
    }
  }

  return (
    <WorkspacePage
      title="حجب الرسوم"
      description="يُحجب الطالب حتى دفع الدفعة الحالية فقط — وليس إجمالي الخطة."
      breadcrumbs={[{ label: "التنبيهات", href: "/admin/notifications" }, { label: "حجب الرسوم" }]}
      loading={loading}
      loadingMessage="جاري تحميل المحجوبين..."
    >
      {success ? <Alert variant="success" className="mb-4">{success}</Alert> : null}
      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-p-black/65">{filtered.length} طالب محجوب</p>
        <SearchField value={search} onChange={setSearch} placeholder="بحث بالاسم أو رقم الطالب..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={search.trim() ? "لا توجد نتائج" : "لا يوجد طلاب محجوبون"} />
      ) : (
        <div className={TABLE_WRAP}>
          <div className="overflow-x-auto">
            <table className={TABLE_BASE}>
              <thead>
                <tr>
                  <th className={TABLE_TH}>الطالب</th>
                  <th className={TABLE_TH}>الصف</th>
                  <th className={TABLE_TH}>المدفوع / الخطة</th>
                  <th className={TABLE_TH}>المطلوب لفك الحجب</th>
                  <th className={TABLE_TH}>الدفعة الحالية</th>
                  <th className={TABLE_TH}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const due = installmentDue(s);
                  const { date: dueDate, time: dueTime } = formatMetaDate(s.currentInstallment?.endDate ?? "");
                  return (
                    <tr key={s.id} className="hover:bg-neutral-50/80">
                      <td className={TABLE_TD}>
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-xs text-p-black/50" dir="ltr">#{s.studentNumber}</p>
                        <Badge variant="danger" className="mt-1">محجوب</Badge>
                      </td>
                      <td className={TABLE_TD}>{classLabel(s.grade, s.section)}</td>
                      <td className={TABLE_TD}>
                        <p className="font-bold" dir="ltr">{s.paidFees} ₪</p>
                        <p className="text-xs text-p-black/50">من {s.totalFees} ₪</p>
                      </td>
                      <td className={TABLE_TD}>
                        <p className="font-bold text-p-red" dir="ltr">{due} ₪</p>
                        <p className="text-xs text-p-black/50">دفعة {installmentOrderLabel(installmentOrder(s))}</p>
                      </td>
                      <td className={TABLE_TD}>
                        <p>{installmentName(s)}</p>
                        {s.currentInstallment?.endDate ? (
                          <p className="text-xs text-p-black/50" dir="ltr">
                            {dueDate}{dueTime ? ` · ${dueTime}` : ""}
                          </p>
                        ) : null}
                      </td>
                      <td className={TABLE_TD}>
                        <div className="flex flex-col gap-1.5">
                          <Button
                            variant="outline"
                            className="px-2 py-1.5 text-xs"
                            onClick={() => {
                              setAccessTarget(s);
                              setAccessDays("1");
                            }}
                          >
                            <Unlock className="h-3.5 w-3.5" />
                            فتح مؤقت
                          </Button>
                          <Button href="/admin/finance/payments" variant="outline" className="px-2 py-1.5 text-xs">
                            <CreditCard className="h-3.5 w-3.5" />
                            المالية
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {accessTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setAccessTarget(null)}
        >
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <p className="font-bold">فتح الوصول مؤقتاً</p>
            <p className="mt-2 text-sm">{accessTarget.name}</p>
            <div className="mt-4">
              <NumberFieldWithKeypad
                fieldId="accessDays"
                label="مدة الفتح (بالأيام)"
                value={accessDays}
                onChange={setAccessDays}
                min={1}
                max={30}
                required
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAccessTarget(null)} disabled={grantingAccess}>
                إلغاء
              </Button>
              <Button onClick={grantTemporaryAccess} disabled={grantingAccess}>
                {grantingAccess ? "جاري التفعيل..." : "فتح الوصول"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </WorkspacePage>
  );
}
