"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Badge } from "@/components/atoms/Badge";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { ProfileField, ProfileSection } from "@/components/dashboard/ProfileFields";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { ExpandableText } from "@/components/molecules/ExpandableText";
import { GradeThenSectionSelect } from "@/components/shared/GradeThenSectionSelect";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import { canManageAdminClasses, isAdminRole } from "@/lib/adminRoles";
import { api, peekCachedList } from "@/lib/api";
import {
  formatAdmissionClassLabel,
  guessClassId,
  mapAdmission,
  mapAdmissionStudent,
} from "@/lib/adminAdmissions";
import type { AdminAdmissionRow } from "@/components/admin/AdminAdmissionsTable";
import type { AccountCredentials, AdminStudent } from "@/types";
import { Save } from "lucide-react";

export default function AdminAdmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? "");
  const { user } = useAuth();
  const { classes, grades } = useSchool();
  const canManageClasses = user && isAdminRole(user.role) && canManageAdminClasses(user.role);
  const cachedList = peekCachedList<Record<string, unknown>>("/admin/admissions/");
  const cachedRow = cachedList
    ? cachedList.map((row) => mapAdmission(row)).find((row) => row.id === id)
    : null;

  const [admission, setAdmission] = useState<AdminAdmissionRow | null>(cachedRow ?? null);
  const [loading, setLoading] = useState(!cachedRow);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [credentials, setCredentials] = useState<AccountCredentials | null>(null);
  const [classId, setClassId] = useState("");
  const [approving, setApproving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmUnapprove, setConfirmUnapprove] = useState(false);
  const [unapproving, setUnapproving] = useState(false);
  const [studentDetail, setStudentDetail] = useState<AdminStudent | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getAdminAdmissions()
      .then((res) => {
        if (cancelled) return;
        const row = (res as unknown[])
          .map((item) => mapAdmission(item as Record<string, unknown>))
          .find((item) => item.id === id);
        setAdmission(row ?? null);
        if (row) setClassId(guessClassId(row.grade, classes));
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "تعذر تحميل الطلب");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, classes]);

  useEffect(() => {
    if (!admission?.approvedStudentId) return;
    api
      .getAdminStudent(admission.approvedStudentId)
      .then((data) => setStudentDetail(mapAdmissionStudent(data as Record<string, unknown>)))
      .catch(() => setStudentDetail(null));
  }, [admission?.approvedStudentId]);

  const detailClassName = useMemo(() => {
    if (!studentDetail) return "—";
    const cls = classes.find((c) => c.id === studentDetail.classId);
    return cls?.name ?? formatAdmissionClassLabel(studentDetail.grade, studentDetail.section);
  }, [studentDetail, classes]);

  async function approve() {
    if (!admission) return;
    if (!classId) {
      setError("يجب اختيار الفصل والشعبة");
      return;
    }
    setApproving(true);
    setError("");
    try {
      const res = await api.approveAdminAdmission(admission.id, { classId });
      const row = res as Record<string, unknown>;
      if (row.username && row.password) {
        setCredentials({
          name: admission.studentName,
          username: String(row.username),
          password: String(row.password),
          role: "parent",
        });
      }
      setSuccess("تم اعتماد الطلب وإنشاء الطالب.");
      setAdmission((prev) =>
        prev
          ? {
              ...prev,
              status: "approved",
              approvedStudentId: row.studentId ? String(row.studentId) : prev.approvedStudentId,
            }
          : prev
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر اعتماد الطلب");
    } finally {
      setApproving(false);
    }
  }

  async function confirmDeleteAction() {
    if (!admission) return;
    setDeleting(true);
    try {
      await api.deleteAdminAdmission(admission.id);
      router.push("/admin/admissions");
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر حذف الطلب");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  async function confirmUnapproveAction() {
    if (!admission) return;
    setUnapproving(true);
    try {
      await api.unapproveAdminAdmission(admission.id);
      setAdmission((prev) =>
        prev
          ? { ...prev, status: "pending", approvedStudentId: null, approvedByName: null, approvedAt: null }
          : prev
      );
      setStudentDetail(null);
      setSuccess("عاد الطلب إلى قيد المراجعة.");
      setConfirmUnapprove(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر التراجع عن الاعتماد");
    } finally {
      setUnapproving(false);
    }
  }

  return (
    <WorkspacePage
      title={admission?.studentName ?? "طلب التسجيل"}
      description="مراجعة الطلب واعتماده أو رفضه."
      breadcrumbs={[
        { label: "طلبات التسجيل", href: "/admin/admissions" },
        { label: admission?.studentName ?? "..." },
      ]}
      loading={loading}
      loadingMessage="جاري تحميل الطلب..."
    >
      {success ? (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      ) : null}
      {credentials ? (
        <Alert variant="success" className="mb-4">
          <p className="mb-3 font-semibold">بيانات الدخول</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-p-green/20 bg-white px-4 py-3">
              <p className="border-b border-neutral-200 pb-2 text-xs font-semibold text-p-black/55">
                رقم الطالب
              </p>
              <p className="mt-2 font-medium leading-7" dir="ltr">
                {credentials.username}
              </p>
            </div>
            <div className="rounded-xl border border-p-green/20 bg-white px-4 py-3">
              <p className="border-b border-neutral-200 pb-2 text-xs font-semibold text-p-black/55">
                كلمة المرور
              </p>
              <p className="mt-2 font-medium leading-7" dir="ltr">
                {credentials.password}
              </p>
            </div>
          </div>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}

      {!admission && !loading ? (
        <Alert variant="error">الطلب غير موجود.</Alert>
      ) : null}

      {admission ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_minmax(16rem,22rem)]">
          <div className="space-y-4">
            <ProfileSection title="بيانات الطلب">
              <ProfileField label="ولي الأمر" value={admission.parentName} />
              <ProfileField label="الجوال" value={admission.phone} dir="ltr" />
              <ProfileField label="رقم الهوية" value={admission.nationalId} dir="ltr" />
              <ProfileField label="المرحلة المطلوبة" value={admission.grade} />
              <ProfileField
                label="ملاحظات"
                value={
                  admission.notes ? (
                    <ExpandableText maxLines={4}>{admission.notes}</ExpandableText>
                  ) : (
                    ""
                  )
                }
                wide
              />
            </ProfileSection>

            <Card className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {admission.status === "pending" ? (
                  <Badge variant="warning">قيد المراجعة</Badge>
                ) : null}
                {admission.status === "approved" ? (
                  <Badge variant="success">معتمد</Badge>
                ) : null}
              </div>
              {admission.status === "pending" ? (
                <div className="space-y-3 border-t border-neutral-100 pt-4">
                  {classes.length === 0 ? (
                    <p className="text-sm text-p-black/65">
                      {canManageClasses
                        ? "أضف الفصول أولاً من صفحة المراحل."
                        : "تواصل مع إدارة الفصول."}
                    </p>
                  ) : (
                    <GradeThenSectionSelect
                      classes={classes}
                      grades={grades}
                      value={classId}
                      onChange={setClassId}
                      required
                    />
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={approve} disabled={approving || !classId}>
                      <Save className="h-4 w-4" />
                      {approving ? "جاري الاعتماد..." : "اعتماد وإنشاء طالب"}
                    </Button>
                    <Button
                      variant="outline"
                      className="text-p-red"
                      onClick={() => setConfirmDelete(true)}
                    >
                      حذف الطلب
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" onClick={() => setConfirmUnapprove(true)}>
                  التراجع عن الاعتماد
                </Button>
              )}
            </Card>
          </div>

          {studentDetail ? (
            <div className="space-y-4">
              <ProfileSection title="الطالب المُنشأ">
                <ProfileField label="الاسم" value={studentDetail.name} />
                <ProfileField
                  label="رقم الطالب"
                  value={studentDetail.studentNumber ? `#${studentDetail.studentNumber}` : ""}
                  dir="ltr"
                />
                <ProfileField label="الفصل" value={detailClassName} />
                <ProfileField
                  label="حالة الدفع"
                  value={<StatusBadge status={studentDetail.paymentStatus} />}
                />
              </ProfileSection>
              <Link
                href={`/admin/students/${studentDetail.id}`}
                prefetch={false}
                className="inline-flex text-sm font-semibold text-brand-blue hover:underline"
              >
                فتح ملف الطالب
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmDelete}
        title="تأكيد حذف الطلب"
        description={admission ? `حذف طلب ${admission.studentName}؟` : ""}
        loading={deleting}
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete(false)}
      />
      <ConfirmDialog
        open={confirmUnapprove}
        title="التراجع عن الاعتماد"
        confirmLabel="تأكيد التراجع"
        description="سيُحذف الطالب وحساب ولي الأمر المُنشآن عند الاعتماد."
        loading={unapproving}
        loadingLabel="جاري التراجع..."
        onConfirm={confirmUnapproveAction}
        onCancel={() => setConfirmUnapprove(false)}
      />
    </WorkspacePage>
  );
}
