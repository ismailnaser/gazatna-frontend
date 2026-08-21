"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { ProfileField, ProfileSection } from "@/components/dashboard/ProfileFields";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { api, peekCachedGet } from "@/lib/api";
import { formatClassLabel, mapAdminStudent } from "@/lib/adminStudents";
import type { AccountCredentials, AdminStudent } from "@/types";
import { FileText, KeyRound, Pencil, Power, Trash2 } from "lucide-react";

export default function AdminStudentViewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = String(params.id ?? "");
  const cached = peekCachedGet<Record<string, unknown>>(`/admin/students/${id}/`);
  const [student, setStudent] = useState<AdminStudent | null>(
    cached ? mapAdminStudent(cached) : null
  );
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [toggling, setToggling] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [credentials, setCredentials] = useState<AccountCredentials | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getAdminStudent(id)
      .then((row) => setStudent(mapAdminStudent(row as Record<string, unknown>)))
      .catch(() => {
        if (!cached) setStudent(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function toggleActive() {
    if (!student) return;
    const nextActive = !student.isActive;
    setToggling(true);
    setError("");
    try {
      const updated = (await api.updateAdminStudent(student.id, {
        isActive: nextActive,
        is_active: nextActive,
      })) as Record<string, unknown>;
      setStudent(mapAdminStudent(updated));
      setSuccess(nextActive ? "تم تفعيل الطالب." : "تم تعطيل الطالب.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر تغيير حالة الطالب");
    } finally {
      setToggling(false);
    }
  }

  async function resetPassword() {
    if (!student) return;
    setResetting(true);
    setError("");
    try {
      const data = (await api.resetAdminStudentPassword(student.id)) as Record<string, unknown>;
      setCredentials({
        name: String(data.name ?? student.name),
        username: String(data.username ?? student.username ?? ""),
        password: String(data.password ?? ""),
        role: "parent",
      });
      setSuccess("تم إعادة تعيين كلمة المرور.");
      setConfirmReset(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إعادة تعيين كلمة المرور");
    } finally {
      setResetting(false);
    }
  }

  async function deleteStudent() {
    if (!student) return;
    setDeleting(true);
    setError("");
    try {
      await api.deleteAdminStudent(student.id);
      router.push("/admin/students");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حذف الطالب");
      setDeleting(false);
    }
  }

  return (
    <WorkspacePage
      title={student?.name ?? "ملف الطالب"}
      description="بيانات الطالب والفصل وحساب الدخول."
      breadcrumbs={[
        { label: "الطلاب", href: "/admin/students" },
        { label: student?.name ?? "ملف الطالب" },
      ]}
      loading={loading}
      loadingMessage="جاري تحميل ملف الطالب..."
      actions={
        student ? (
          <>
            <Button href={`/admin/students/${student.id}/edit`} variant="outline">
              <Pencil className="h-4 w-4" />
              تعديل
            </Button>
            <Button href={`/admin/students/${student.id}/documents`} variant="outline">
              <FileText className="h-4 w-4" />
              الوثائق
            </Button>
          </>
        ) : null
      }
    >
      {success ? <Alert variant="success" className="mb-4">{success}</Alert> : null}
      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}
      {credentials ? (
        <Alert variant="success" className="mb-4">
          <p className="mb-3 font-semibold">بيانات الدخول الجديدة — احفظها الآن</p>
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

      {!student && !loading ? (
        <Alert variant="error">الطالب غير موجود.</Alert>
      ) : student ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={student.isActive ? "success" : "default"}>
              {student.isActive ? "نشط" : "غير نشط"}
            </Badge>
            <StatusBadge status={student.paymentStatus} />
          </div>

          <ProfileSection title="البيانات الأساسية">
            <ProfileField label="اسم الطالب" value={student.name} />
            <ProfileField
              label="رقم الطالب"
              value={student.studentNumber ? `#${student.studentNumber}` : ""}
              dir="ltr"
            />
            <ProfileField label="رقم الهوية" value={student.nationalId} dir="ltr" />
            <ProfileField
              label="الفصل"
              value={formatClassLabel(student.grade, student.section)}
            />
          </ProfileSection>

          <ProfileSection title="التواصل">
            <ProfileField label="جوال ولي الأمر" value={student.parentPhone} dir="ltr" />
            <ProfileField label="اسم المستخدم" value={student.username} dir="ltr" />
            <ProfileField label="العنوان" value={student.address} wide />
          </ProfileSection>

          <ProfileSection title="المالية">
            <ProfileField label="الإجمالي" value={`${student.balance?.total ?? 0} ₪`} dir="ltr" />
            <ProfileField label="المدفوع" value={`${student.balance?.paid ?? 0} ₪`} dir="ltr" />
            <ProfileField label="المتبقي" value={`${student.balance?.remaining ?? 0} ₪`} dir="ltr" />
            <ProfileField
              label="الوثائق"
              value={
                student.documents.length > 0 ? `${student.documents.length} وثيقة` : "لا توجد وثائق"
              }
            />
          </ProfileSection>

          <ProfileSection title="التقييم">
            <ProfileField
              label="ملاحظات التقييم"
              value={
                student.evaluation ? (
                  <p className="whitespace-pre-wrap">{student.evaluation}</p>
                ) : (
                  ""
                )
              }
              wide
            />
          </ProfileSection>

          <div className="flex flex-wrap gap-2 border-t border-neutral-200 pt-4">
            <Button type="button" variant="outline" onClick={toggleActive} disabled={toggling}>
              <Power className="h-4 w-4" />
              {toggling ? "جاري..." : student.isActive ? "تعطيل الحساب" : "تفعيل الحساب"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setConfirmReset(true)}>
              <KeyRound className="h-4 w-4" />
              إعادة تعيين كلمة المرور
            </Button>
            <Button type="button" variant="ghost" className="text-p-red" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4" />
              حذف الطالب
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmReset}
        title="تأكيد تغيير كلمة المرور"
        description={student ? `إعادة تعيين كلمة مرور ${student.name}؟ ستُعرض كلمة المرور الجديدة مرة واحدة.` : null}
        loading={resetting}
        onConfirm={resetPassword}
        onCancel={() => setConfirmReset(false)}
      />
      <ConfirmDialog
        open={confirmDelete}
        title="تأكيد حذف الطالب"
        description={
          student ? (
            <>
              هل أنت متأكد من حذف الطالب <span className="font-semibold">{student.name}</span>؟
              سيتم حذف سجل الطالب وحساب الدخول. لا يمكن التراجع.
            </>
          ) : null
        }
        loading={deleting}
        onConfirm={deleteStudent}
        onCancel={() => setConfirmDelete(false)}
      />
    </WorkspacePage>
  );
}
