"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import {
  AdminAdmissionsTable,
  type AdminAdmissionRow,
} from "@/components/admin/AdminAdmissionsTable";
import { GradeSectionClassPicker } from "@/components/shared/GradeSectionClassPicker";
import { PageHeader } from "@/components/molecules/PageHeader";
import { ExpandableText } from "@/components/molecules/ExpandableText";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { useSchool } from "@/context/SchoolContext";
import { useAuth } from "@/context/AuthContext";
import { canManageAdminClasses, isAdminRole } from "@/lib/adminRoles";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AccountCredentials, AdminStudent } from "@/types";
import { CheckCircle2, ClipboardList, Clock, RefreshCw, Save, Search, X } from "lucide-react";

type TabId = "pending" | "approved" | "all";

const TABS: Array<{ id: TabId; label: string; icon: typeof Clock }> = [
  { id: "pending", label: "قيد المراجعة", icon: Clock },
  { id: "approved", label: "معتمدة", icon: CheckCircle2 },
  { id: "all", label: "كل الطلبات", icon: ClipboardList },
];

function guessClassId(grade: string, classes: ReturnType<typeof useSchool>["classes"]) {
  const normalized = grade.trim().toLowerCase();
  if (!normalized) return "";

  const exact = classes.find(
    (cls) =>
      cls.name === grade ||
      cls.gradeLevel === grade ||
      cls.name.startsWith(grade) ||
      `${cls.gradeLevel} - ${cls.section}` === grade
  );
  if (exact) return exact.id;

  const partial = classes.find((cls) => {
    const haystack = [cls.name, cls.gradeLevel, cls.section].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(normalized) || normalized.includes(haystack);
  });
  return partial?.id ?? "";
}

function formatClassLabel(grade: string, section?: string) {
  return section ? `${grade} - ${section}` : grade;
}

function mapStudent(s: Record<string, unknown>): AdminStudent {
  return {
    id: String(s.id),
    name: String(s.name),
    grade: String(s.grade),
    section: s.section ? String(s.section) : undefined,
    classId: s.classId ? String(s.classId) : undefined,
    studentNumber: s.studentNumber ? String(s.studentNumber) : undefined,
    nationalId: s.nationalId ? String(s.nationalId) : undefined,
    username: s.username ? String(s.username) : undefined,
    generatedPassword: s.generatedPassword ? String(s.generatedPassword) : undefined,
    paymentStatus: s.paymentStatus as AdminStudent["paymentStatus"],
    documents: Array.isArray(s.documents)
      ? (s.documents as Array<Record<string, unknown>>).map((d) => ({
          id: d.id ? String(d.id) : null,
          name: String(d.name ?? ""),
          url: d.url ? String(d.url) : null,
        }))
      : [],
  };
}

function mapAdmission(row: Record<string, unknown>): AdminAdmissionRow {
  return {
    id: String(row.id),
    studentName: String(row.studentName ?? ""),
    nationalId: row.nationalId ? String(row.nationalId) : "",
    birthDate: row.birthDate ? String(row.birthDate) : null,
    grade: String(row.grade ?? ""),
    parentName: String(row.parentName ?? ""),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    notes: String(row.notes ?? ""),
    status: (row.status as AdminAdmissionRow["status"]) ?? "pending",
    createdAt: String(row.createdAt ?? ""),
    approvedStudentId: row.approvedStudentId ? String(row.approvedStudentId) : null,
    approvedByName: row.approvedByName ? String(row.approvedByName) : null,
    approvedAt: row.approvedAt ? String(row.approvedAt) : null,
  };
}

function StatChip({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Clock;
  label: string;
  value: string | number;
  tone?: "default" | "success" | "warning";
}) {
  const tones = {
    default: "bg-brand-blue/10 text-brand-blue",
    success: "bg-p-green/10 text-p-green",
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

export default function AdminAdmissionsPage() {
  const { user } = useAuth();
  const { classes, grades } = useSchool();
  const canManageClasses =
    user && isAdminRole(user.role) && canManageAdminClasses(user.role);
  const [items, setItems] = useState<AdminAdmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [credentials, setCredentials] = useState<AccountCredentials | null>(null);
  const [tab, setTab] = useState<TabId>("pending");
  const [search, setSearch] = useState("");

  const [approveTarget, setApproveTarget] = useState<AdminAdmissionRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminAdmissionRow | null>(null);
  const [unapproveTarget, setUnapproveTarget] = useState<AdminAdmissionRow | null>(null);
  const [classId, setClassId] = useState("");
  const [approving, setApproving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [unapproving, setUnapproving] = useState(false);
  const [detailTarget, setDetailTarget] = useState<AdminAdmissionRow | null>(null);
  const [studentDetail, setStudentDetail] = useState<AdminStudent | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = (await api.getAdminAdmissions()) as unknown[];
      setItems(res.map((row) => mapAdmission(row as Record<string, unknown>)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحميل الطلبات");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const pendingCount = useMemo(() => items.filter((i) => i.status === "pending").length, [items]);
  const approvedCount = useMemo(() => items.filter((i) => i.status === "approved").length, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = items;
    if (tab === "pending") list = list.filter((i) => i.status === "pending");
    else if (tab === "approved") list = list.filter((i) => i.status === "approved");

    if (!q) return list;

    return list.filter((row) => {
      const haystack = [
        row.studentName,
        row.nationalId,
        row.parentName,
        row.phone,
        row.email,
        row.grade,
        row.notes,
        row.approvedByName ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, tab, search]);

  function openApproveModal(admission: AdminAdmissionRow) {
    setApproveTarget(admission);
    setClassId(guessClassId(admission.grade, classes));
    setError("");
    setSuccess("");
  }

  async function approve() {
    if (!approveTarget) return;
    if (!classId) {
      setError("يجب اختيار الفصل والشعبة");
      return;
    }

    setApproving(true);
    setError("");
    setSuccess("");
    setCredentials(null);
    try {
      const res = await api.approveAdminAdmission(approveTarget.id, { classId });
      const row = res as Record<string, unknown>;
      const sid = row.studentId ? String(row.studentId) : null;
      setItems((prev) =>
        prev.map((a) =>
          a.id === approveTarget.id
            ? {
                ...a,
                status: "approved",
                approvedStudentId: sid,
                approvedByName: row.approvedByName ? String(row.approvedByName) : a.approvedByName,
                approvedAt: row.approvedAt ? String(row.approvedAt) : a.approvedAt,
              }
            : a
        )
      );

      if (row.username && row.password) {
        setCredentials({
          name: approveTarget.studentName,
          username: String(row.username),
          password: String(row.password),
          role: "parent",
        });
      }

      setSuccess("تم اعتماد الطلب وإنشاء الطالب. تم توليد رقم الطالب وكلمة المرور تلقائياً.");
      setApproveTarget(null);
      setClassId("");
      setTab("approved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر اعتماد الطلب");
    } finally {
      setApproving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError("");
    setSuccess("");
    try {
      await api.deleteAdminAdmission(deleteTarget.id);
      setItems((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setSuccess(`تم حذف طلب ${deleteTarget.studentName} بنجاح.`);
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر حذف الطلب");
    } finally {
      setDeleting(false);
    }
  }

  async function confirmUnapprove() {
    if (!unapproveTarget) return;
    setUnapproving(true);
    setError("");
    setSuccess("");
    try {
      await api.unapproveAdminAdmission(unapproveTarget.id);
      setItems((prev) =>
        prev.map((a) =>
          a.id === unapproveTarget.id
            ? {
                ...a,
                status: "pending",
                approvedStudentId: null,
                approvedByName: null,
                approvedAt: null,
              }
            : a
        )
      );
      setSuccess(`تم التراجع عن اعتماد ${unapproveTarget.studentName}. عاد الطلب إلى قيد المراجعة.`);
      setUnapproveTarget(null);
      setTab("pending");
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر التراجع عن الاعتماد");
    } finally {
      setUnapproving(false);
    }
  }

  async function openStudentDetail(admission: AdminAdmissionRow) {
    if (!admission.approvedStudentId) return;
    setDetailTarget(admission);
    setStudentDetail(null);
    setDetailError("");
    setLoadingDetail(true);
    try {
      const data = (await api.getAdminStudent(admission.approvedStudentId)) as Record<string, unknown>;
      setStudentDetail(mapStudent(data));
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : "تعذر تحميل بيانات الطالب");
    } finally {
      setLoadingDetail(false);
    }
  }

  function closeStudentDetail() {
    setDetailTarget(null);
    setStudentDetail(null);
    setDetailError("");
  }

  const detailClassName = useMemo(() => {
    if (!studentDetail) return "-";
    const cls = classes.find((c) => c.id === studentDetail.classId);
    return cls?.name ?? formatClassLabel(studentDetail.grade, studentDetail.section);
  }, [studentDetail, classes]);

  const tableVariant = tab === "all" ? "all" : tab;

  return (
    <div>
      <PageHeader
        title="طلبات القبول والتسجيل"
        description="مراجعة طلبات التسجيل من الموقع، اعتمادها أو التراجع عن الاعتماد"
      />

      {success && (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      )}
      {credentials && (
        <Alert variant="success" className="mb-4">
          <p className="mb-2 font-semibold">تم إنشاء حساب الطالب تلقائياً — احفظ بيانات الدخول:</p>
          <p>الاسم: {credentials.name}</p>
          <p>
            رقم الطالب / اسم المستخدم: <span dir="ltr">{credentials.username}</span>
          </p>
          <p>
            كلمة المرور: <span dir="ltr">{credentials.password}</span>
          </p>
        </Alert>
      )}
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <StatChip icon={ClipboardList} label="إجمالي الطلبات" value={items.length} />
        <StatChip icon={Clock} label="قيد المراجعة" value={pendingCount} tone="warning" />
        <StatChip icon={CheckCircle2} label="معتمدة" value={approvedCount} tone="success" />
      </div>

      <Card className="mb-4 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                  tab === id
                    ? "bg-brand-blue text-white"
                    : "bg-neutral-50 text-p-black/65 hover:bg-neutral-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
                <span className="rounded-md bg-black/10 px-1.5 py-0.5 text-[11px]">
                  {id === "pending"
                    ? pendingCount
                    : id === "approved"
                      ? approvedCount
                      : items.length}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1 lg:max-w-xs">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-p-black/35" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث بالاسم أو الهاتف أو رقم الهوية..."
                className="w-full rounded-xl border border-neutral-200 py-2.5 pe-3 ps-9 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>
            <Button type="button" variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              {loading ? "جاري التحميل..." : "تحديث"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-3 sm:p-4">
        {loading && items.length === 0 ? (
          <p className="py-10 text-center text-sm text-p-black/50">جاري تحميل الطلبات...</p>
        ) : (
          <AdminAdmissionsTable
            rows={filtered}
            variant={tableVariant}
            hasActiveFilters={Boolean(search.trim())}
            onApprove={openApproveModal}
            onUnapprove={(row) => {
              setUnapproveTarget(row);
              setError("");
              setSuccess("");
            }}
            onDelete={(row) => {
              setDeleteTarget(row);
              setError("");
              setSuccess("");
            }}
            onView={openStudentDetail}
          />
        )}
      </Card>

      {approveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6">
            <h3 className="text-lg font-bold text-p-black">اعتماد الطلب</h3>
            <p className="mt-1 text-sm text-p-black/60">{approveTarget.studentName}</p>

            <div className="mt-4 rounded-xl border border-neutral-100 bg-neutral-50 p-4 text-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                <p>
                  <span className="text-p-black/55">ولي الأمر:</span> {approveTarget.parentName}
                </p>
                {approveTarget.nationalId ? (
                  <p>
                    <span className="text-p-black/55">رقم الهوية:</span>{" "}
                    <span dir="ltr">{approveTarget.nationalId}</span>
                  </p>
                ) : null}
                <p>
                  <span className="text-p-black/55">الهاتف:</span>{" "}
                  <span dir="ltr">{approveTarget.phone}</span>
                </p>
                <p>
                  <span className="text-p-black/55">المرحلة المطلوبة:</span> {approveTarget.grade}
                </p>
                {approveTarget.birthDate ? (
                  <p>
                    <span className="text-p-black/55">تاريخ الميلاد:</span> {approveTarget.birthDate}
                  </p>
                ) : null}
              </div>
              {approveTarget.notes ? (
                <div className="mt-2">
                  <p className="text-sm text-p-black/55">ملاحظات</p>
                  <ExpandableText maxLines={3} className="text-p-black/70">
                    {approveTarget.notes}
                  </ExpandableText>
                </div>
              ) : null}
            </div>

            <div className="mt-4 space-y-3">
              {classes.length === 0 ? (
                <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center text-sm text-neutral-500">
                  لا توجد فصول مسجّلة.{" "}
                  {canManageClasses
                    ? "أضف الفصول أولاً من صفحة إدارة الفصول."
                    : "تواصل مع إدارة الفصول لإضافتها."}
                </p>
              ) : (
                <GradeSectionClassPicker
                  classes={classes}
                  grades={grades}
                  mode="single"
                  value={classId ? [classId] : []}
                  onChange={(ids) => setClassId(ids[0] ?? "")}
                  label="الفصل والشعبة"
                  required
                />
              )}
              <p className="text-xs text-p-black/50">
                سيتم توليد رقم الطالب وكلمة المرور تلقائياً، وسيُسجَّل اسمك كمُعتمد للطلب.
              </p>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setApproveTarget(null)}>
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={approve}
                disabled={approving || classes.length === 0 || !classId}
              >
                <Save className="h-4 w-4" />
                {approving ? "جاري الاعتماد..." : "اعتماد وإنشاء طالب"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {unapproveTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setUnapproveTarget(null)}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <p className="text-base font-bold text-p-black">التراجع عن الاعتماد</p>
            <p className="mt-2 text-sm text-p-black/70">
              هل تريد التراجع عن اعتماد{" "}
              <span className="font-semibold">{unapproveTarget.studentName}</span>؟
            </p>
            <p className="mt-2 text-sm text-amber-700">
              سيعود الطلب إلى «قيد المراجعة»، ويُحذف الطالب وحساب ولي الأمر المُنشآن عند الاعتماد.
            </p>
            {unapproveTarget.approvedByName ? (
              <p className="mt-2 text-xs text-p-black/50">
                اعتُمد سابقاً بواسطة: {unapproveTarget.approvedByName}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUnapproveTarget(null)}
                disabled={unapproving}
              >
                إلغاء
              </Button>
              <Button type="button" onClick={confirmUnapprove} disabled={unapproving}>
                {unapproving ? "جاري التراجع..." : "تأكيد التراجع"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setDeleteTarget(null)}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <p className="text-base font-bold text-p-black">تأكيد حذف الطلب</p>
            <p className="mt-2 text-sm text-p-black/70">
              هل أنت متأكد من حذف طلب{" "}
              <span className="font-semibold">{deleteTarget.studentName}</span>؟ لا يمكن التراجع عن هذا
              الإجراء.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-p-red hover:bg-p-red/90 focus-visible:ring-p-red"
              >
                {deleting ? "جاري الحذف..." : "حذف الطلب"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {detailTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeStudentDetail}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-p-black">بيانات الطالب</h3>
                <p className="mt-1 text-sm text-p-black/60">{detailTarget.studentName}</p>
                {detailTarget.approvedByName ? (
                  <p className="mt-1 text-xs text-p-black/45">
                    اعتُمد بواسطة {detailTarget.approvedByName}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={closeStudentDetail}
                aria-label="إغلاق"
                className="rounded-full p-1 text-p-black/40 hover:bg-neutral-100 hover:text-p-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingDetail ? (
              <p className="text-sm text-neutral-500">جاري تحميل البيانات...</p>
            ) : detailError ? (
              <Alert variant="error">{detailError}</Alert>
            ) : studentDetail ? (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-neutral-100">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-neutral-50">
                        <th className="bg-neutral-50 px-3 py-2 text-start text-xs font-bold text-p-black/55">
                          الاسم
                        </th>
                        <td className="px-3 py-2">{studentDetail.name}</td>
                      </tr>
                      <tr className="border-b border-neutral-50">
                        <th className="bg-neutral-50 px-3 py-2 text-start text-xs font-bold text-p-black/55">
                          رقم الهوية
                        </th>
                        <td className="px-3 py-2" dir="ltr">
                          {studentDetail.nationalId ?? detailTarget.nationalId ?? "—"}
                        </td>
                      </tr>
                      <tr className="border-b border-neutral-50">
                        <th className="bg-neutral-50 px-3 py-2 text-start text-xs font-bold text-p-black/55">
                          رقم الطالب
                        </th>
                        <td className="px-3 py-2" dir="ltr">
                          {studentDetail.studentNumber ?? "—"}
                        </td>
                      </tr>
                      <tr className="border-b border-neutral-50">
                        <th className="bg-neutral-50 px-3 py-2 text-start text-xs font-bold text-p-black/55">
                          الفصل
                        </th>
                        <td className="px-3 py-2">{detailClassName}</td>
                      </tr>
                      <tr className="border-b border-neutral-50">
                        <th className="bg-neutral-50 px-3 py-2 text-start text-xs font-bold text-p-black/55">
                          اسم المستخدم
                        </th>
                        <td className="px-3 py-2" dir="ltr">
                          {studentDetail.username ?? "—"}
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-neutral-50 px-3 py-2 text-start text-xs font-bold text-p-black/55">
                          حالة الدفع
                        </th>
                        <td className="px-3 py-2">
                          <StatusBadge status={studentDetail.paymentStatus} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Link
                    href={`/admin/students/${studentDetail.id}/documents`}
                    className="inline-flex items-center justify-center rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-brand-blue hover:bg-brand-blue/10"
                  >
                    الوثائق
                  </Link>
                  <Button type="button" variant="outline" onClick={closeStudentDetail}>
                    إغلاق
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
