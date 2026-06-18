"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { NumberFieldWithKeypad } from "@/components/teacher/NumberFieldWithKeypad";
import { NumberKeypadGroup } from "@/components/teacher/NumberKeypadGroup";
import { PageHeader } from "@/components/molecules/PageHeader";
import { api } from "@/lib/api";
import { formatMetaDate } from "@/lib/dateDisplay";
import { cn } from "@/lib/utils";
import {
  Bell,
  Check,
  ChevronRight,
  CreditCard,
  Search,
  Unlock,
  UserX,
  Users,
} from "lucide-react";

type NotificationType = "fees_blocked" | "students_inactive";

type BlockedStudent = {
  id: string;
  name: string;
  studentNumber: string;
  grade: string;
  section: string;
  requiredAmount: number;
  installmentOrder?: number;
  installmentAmount?: number;
  installmentRemaining?: number;
  message: string;
  totalFees: number;
  paidFees: number;
  currentInstallment: {
    order: number;
    amount: number;
    remaining?: number;
    endDate: string | null;
  } | null;
};

type InactiveStudent = {
  id: string;
  name: string;
  studentNumber: string;
  grade: string;
  section: string;
  createdAt: string;
};

const TABS: Array<{
  id: NotificationType;
  label: string;
  icon: typeof Bell;
}> = [
  { id: "fees_blocked", label: "حجب الرسوم", icon: CreditCard },
  { id: "students_inactive", label: "حسابات غير نشطة", icon: UserX },
];

function installmentDue(s: BlockedStudent): number {
  const remaining = s.installmentRemaining ?? s.currentInstallment?.remaining;
  if (remaining != null && remaining > 0) return remaining;
  const instAmount = s.installmentAmount ?? s.currentInstallment?.amount;
  if (instAmount != null && instAmount > 0 && s.requiredAmount >= s.totalFees) return instAmount;
  return s.requiredAmount;
}

function installmentOrder(s: BlockedStudent): number {
  return s.installmentOrder ?? s.currentInstallment?.order ?? 1;
}

function installmentOrderLabel(order: number) {
  return order === 1 ? "الأولى" : `رقم ${order}`;
}

function classLabel(grade: string, section?: string) {
  if (!grade) return "—";
  return section ? `${grade} / ${section}` : grade;
}

const NOTIFICATIONS_TABLE =
  "w-full min-w-[980px] border-collapse border border-neutral-200 text-sm";
const NOTIFICATIONS_TH =
  "border-b border-e border-neutral-200 bg-neutral-50 px-3 py-3 text-start text-xs font-bold text-p-black/55 last:border-e-0 sm:px-4";
const NOTIFICATIONS_TD =
  "border-b border-e border-neutral-200 px-3 py-3 align-top last:border-e-0 sm:px-4";
const INACTIVE_TABLE = "w-full min-w-[720px] border-collapse border border-neutral-200 text-sm";

function StatChip({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  tone?: "default" | "danger" | "warning";
}) {
  const tones = {
    default: "bg-brand-blue/10 text-brand-blue",
    danger: "bg-p-red/10 text-p-red",
    warning: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-neutral-100 bg-white px-3 py-2.5 shadow-sm">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          tones[tone]
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-p-black/45">{label}</p>
        <p className="text-sm font-bold text-p-black">{value}</p>
      </div>
    </div>
  );
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as NotificationType | null) ?? "fees_blocked";

  const [blocked, setBlocked] = useState<BlockedStudent[]>([]);
  const [inactive, setInactive] = useState<InactiveStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [accessTarget, setAccessTarget] = useState<BlockedStudent | null>(null);
  const [accessDays, setAccessDays] = useState("1");
  const [grantingAccess, setGrantingAccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    const loader =
      type === "students_inactive"
        ? api.getAdminInactiveStudents().then((res) => setInactive(res as InactiveStudent[]))
        : api.getAdminBlockedStudents().then((res) => setBlocked(res as BlockedStudent[]));

    loader
      .catch((e) => {
        setError(e instanceof Error ? e.message : "تعذر تحميل التفاصيل");
        setBlocked([]);
        setInactive([]);
      })
      .finally(() => setLoading(false));
  }, [type]);

  const count = type === "students_inactive" ? inactive.length : blocked.length;

  const filteredBlocked = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return blocked;
    return blocked.filter((s) => {
      const haystack = [s.name, s.studentNumber, s.grade, s.section]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [blocked, search]);

  const filteredInactive = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return inactive;
    return inactive.filter((s) => {
      const haystack = [s.name, s.studentNumber, s.grade, s.section]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [inactive, search]);

  const totalDue = useMemo(
    () => filteredBlocked.reduce((sum, s) => sum + installmentDue(s), 0),
    [filteredBlocked]
  );

  async function activateStudent(id: string) {
    setActivatingId(id);
    setError("");
    setSuccess("");
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

  async function grantTemporaryAccess() {
    if (!accessTarget) return;
    setGrantingAccess(true);
    setError("");
    setSuccess("");
    try {
      const result = await api.grantStudentFeeAccess(accessTarget.id, Number(accessDays));
      setSuccess(`تم فتح الوصول للطالب حتى ${new Date(result.accessOverrideUntil).toLocaleString("ar")}`);
      setAccessTarget(null);
      setAccessDays("1");
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر فتح الوصول للطالب");
    } finally {
      setGrantingAccess(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="التنبيهات"
        description="متابعة الطلاب المحجوبين بسبب الرسوم والحسابات التي بانتظار التفعيل."
      />

      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:underline"
      >
        <ChevronRight className="h-4 w-4" />
        العودة للوحة الإدارة
      </Link>

      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid grid-cols-2 gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => router.replace(`/admin/notifications?type=${id}`)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors",
              type === id
                ? "border-brand-blue bg-brand-blue text-white shadow-sm"
                : "border-neutral-200 bg-white text-p-black/65 hover:bg-neutral-50"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <StatChip
          icon={Users}
          label={type === "fees_blocked" ? "طلاب محجوبون" : "حسابات بانتظار التفعيل"}
          value={count}
          tone={count > 0 ? "warning" : "default"}
        />
        {type === "fees_blocked" && count > 0 ? (
          <StatChip
            icon={CreditCard}
            label="إجمالي المطلوب لفك الحجب"
            value={`${totalDue} ₪`}
            tone="danger"
          />
        ) : null}
      </div>

      <section className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        <header className="space-y-3 border-b border-neutral-100 bg-neutral-50/70 px-3 py-3 sm:px-4 sm:py-4">
          <div>
            <h2 className="text-sm font-bold text-p-black">
              {type === "fees_blocked" ? "قائمة الطلاب المحجوبين" : "قائمة الحسابات غير النشطة"}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-p-black/50">
              {type === "fees_blocked"
                ? "يُحجب الطالب عن المنصة حتى دفع الدفعة المستحقة الحالية — وليس إجمالي خطة الرسوم كاملة."
                : "الطلاب المسجلون الجدد الذين لم يُفعَّل حسابهم بعد من الإدارة."}
            </p>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-p-black/40" />
            <input
              type="search"
              placeholder="بحث بالاسم أو رقم الطالب..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pe-4 ps-10 text-sm focus:border-p-green focus:outline-none focus:ring-2 focus:ring-p-green/20"
            />
          </div>
        </header>

        <div className="p-3 sm:p-4">
          {loading ? (
            <p className="py-8 text-center text-sm text-neutral-500">جاري التحميل...</p>
          ) : type === "fees_blocked" ? (
            filteredBlocked.length === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-500">
                {search.trim() ? "لا توجد نتائج مطابقة." : "لا يوجد طلاب محجوبون حالياً."}
              </p>
            ) : (
              <div className="-mx-3 overflow-x-auto sm:mx-0">
                <table className={NOTIFICATIONS_TABLE}>
                  <colgroup>
                    <col className="w-[19%]" />
                    <col className="w-[11%]" />
                    <col className="w-[15%]" />
                    <col className="w-[14%]" />
                    <col className="w-[18%]" />
                    <col className="w-[23%]" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className={NOTIFICATIONS_TH}>الطالب</th>
                      <th className={NOTIFICATIONS_TH}>الصف</th>
                      <th className={NOTIFICATIONS_TH}>المدفوع / إجمالي الخطة</th>
                      <th className={NOTIFICATIONS_TH}>المطلوب لفك الحجب</th>
                      <th className={NOTIFICATIONS_TH}>الدفعة الحالية</th>
                      <th className={NOTIFICATIONS_TH}>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBlocked.map((s, index) => {
                      const order = installmentOrder(s);
                      const due = installmentDue(s);
                      const endDate = s.currentInstallment?.endDate;
                      const { date: dueDate, time: dueTime } = formatMetaDate(endDate ?? "");

                      return (
                        <tr
                          key={s.id}
                          className={cn(index % 2 === 1 && "bg-neutral-50/50")}
                        >
                          <td className={NOTIFICATIONS_TD}>
                            <div className="space-y-1.5">
                              <p className="font-semibold leading-snug text-p-black">{s.name}</p>
                              <p className="text-xs text-p-black/50" dir="ltr">
                                #{s.studentNumber}
                              </p>
                              <Badge variant="danger" className="mt-0.5">
                                محجوب
                              </Badge>
                            </div>
                          </td>
                          <td className={cn(NOTIFICATIONS_TD, "text-p-black/75")}>
                            <p className="font-medium leading-snug">{classLabel(s.grade, s.section)}</p>
                          </td>
                          <td className={NOTIFICATIONS_TD}>
                            <p className="text-base font-bold text-p-black" dir="ltr">
                              {s.paidFees} ₪
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-p-black/45">
                              من {s.totalFees} ₪
                              <br />
                              حسب خطة المرحلة
                            </p>
                          </td>
                          <td className={NOTIFICATIONS_TD}>
                            <p className="text-base font-bold text-p-red" dir="ltr">
                              {due} ₪
                            </p>
                            <p className="mt-1 text-xs text-p-black/50">
                              دفعة {installmentOrderLabel(order)} فقط
                            </p>
                          </td>
                          <td className={NOTIFICATIONS_TD}>
                            <p className="font-medium leading-snug text-p-black">
                              الدفعة {order}
                            </p>
                            <p className="mt-0.5 text-sm text-p-black/70" dir="ltr">
                              {s.currentInstallment?.amount ?? s.installmentAmount ?? due} ₪
                            </p>
                            {endDate ? (
                              <p className="mt-1.5 text-xs leading-relaxed text-p-black/50">
                                آخر موعد
                                <br />
                                <span dir="ltr">
                                  {dueDate}
                                  {dueTime ? ` · ${dueTime}` : ""}
                                </span>
                              </p>
                            ) : (
                              <p className="mt-1 text-xs text-p-black/40">بدون موعد محدد</p>
                            )}
                          </td>
                          <td className={NOTIFICATIONS_TD}>
                            <div className="flex min-w-[8.5rem] flex-col gap-1.5">
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-center gap-1.5 px-2 py-1.5 text-xs"
                                onClick={() => {
                                  setAccessTarget(s);
                                  setAccessDays("1");
                                  setError("");
                                  setSuccess("");
                                }}
                              >
                                <Unlock className="h-3.5 w-3.5 shrink-0" />
                                فتح مؤقت
                              </Button>
                              <Button
                                href="/admin/finance"
                                variant="outline"
                                className="w-full justify-center gap-1.5 px-2 py-1.5 text-xs"
                              >
                                <CreditCard className="h-3.5 w-3.5 shrink-0" />
                                المالية
                              </Button>
                              <Button
                                href="/admin/students"
                                variant="ghost"
                                className="w-full justify-center px-2 py-1.5 text-xs"
                              >
                                الطلاب
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : filteredInactive.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-500">
              {search.trim() ? "لا توجد نتائج مطابقة." : "لا يوجد طلاب غير نشطين حالياً."}
            </p>
          ) : (
            <div className="-mx-3 overflow-x-auto sm:mx-0">
              <table className={INACTIVE_TABLE}>
                <colgroup>
                  <col className="w-[28%]" />
                  <col className="w-[18%]" />
                  <col className="w-[22%]" />
                  <col className="w-[14%]" />
                  <col className="w-[18%]" />
                </colgroup>
                <thead>
                  <tr>
                    <th className={NOTIFICATIONS_TH}>الطالب</th>
                    <th className={NOTIFICATIONS_TH}>الصف</th>
                    <th className={NOTIFICATIONS_TH}>تاريخ التسجيل</th>
                    <th className={NOTIFICATIONS_TH}>الحالة</th>
                    <th className={NOTIFICATIONS_TH}>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInactive.map((s, index) => {
                    const { date, time } = formatMetaDate(s.createdAt);
                    return (
                      <tr
                        key={s.id}
                        className={cn(index % 2 === 1 && "bg-neutral-50/50")}
                      >
                        <td className={NOTIFICATIONS_TD}>
                          <p className="font-semibold leading-snug text-p-black">{s.name}</p>
                          <p className="mt-1 text-xs text-p-black/50" dir="ltr">
                            #{s.studentNumber}
                          </p>
                        </td>
                        <td className={cn(NOTIFICATIONS_TD, "font-medium text-p-black/75")}>
                          {classLabel(s.grade, s.section)}
                        </td>
                        <td className={NOTIFICATIONS_TD}>
                          <p className="font-medium text-p-black" dir="ltr">
                            {date}
                          </p>
                          {time ? (
                            <p className="mt-0.5 text-xs text-p-black/45" dir="ltr">
                              {time}
                            </p>
                          ) : null}
                        </td>
                        <td className={NOTIFICATIONS_TD}>
                          <Badge variant="warning">غير نشط</Badge>
                        </td>
                        <td className={NOTIFICATIONS_TD}>
                          <Button
                            type="button"
                            className="gap-1.5 px-3 py-1.5 text-xs"
                            disabled={activatingId === s.id}
                            onClick={() => activateStudent(s.id)}
                          >
                            <Check className="h-3.5 w-3.5 shrink-0" />
                            {activatingId === s.id ? "جاري التفعيل..." : "تفعيل"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {accessTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          onClick={() => setAccessTarget(null)}
        >
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <Card className="rounded-t-3xl p-5 sm:rounded-2xl sm:p-6">
              <p className="text-base font-bold text-p-black">فتح الوصول مؤقتاً</p>
              <div className="mt-3 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5 text-sm">
                <p className="font-semibold text-p-black">{accessTarget.name}</p>
                <p className="mt-1 text-xs text-p-black/50" dir="ltr">
                  #{accessTarget.studentNumber} — {classLabel(accessTarget.grade, accessTarget.section)}
                </p>
                <p className="mt-2 text-xs text-amber-800">
                  المطلوب لفك الحجب:{" "}
                  <span className="font-bold">{installmentDue(accessTarget)} ₪</span>
                </p>
              </div>
              <div className="mt-4">
                <NumberKeypadGroup>
                  <NumberFieldWithKeypad
                    fieldId="accessDays"
                    label="مدة الفتح (بالأيام)"
                    value={accessDays}
                    onChange={setAccessDays}
                    min={1}
                    max={30}
                    required
                  />
                </NumberKeypadGroup>
                <p className="mt-2 text-xs text-p-black/50">
                  يسمح للطالب بالدخول لفترة محددة ثم يُغلق الوصول تلقائياً.
                </p>
              </div>
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setAccessTarget(null)}
                  disabled={grantingAccess}
                >
                  إلغاء
                </Button>
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={grantTemporaryAccess}
                  disabled={grantingAccess}
                >
                  {grantingAccess ? "جاري التفعيل..." : "فتح الوصول"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
