"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Select } from "@/components/atoms/Select";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { EmptyState } from "@/components/molecules/EmptyState";
import { TABLE_BASE, TABLE_TD, TABLE_TH, TABLE_WRAP } from "@/components/shared/DataTable";
import { useSchool } from "@/context/SchoolContext";
import { api } from "@/lib/api";
import { mapAdminStudent } from "@/lib/adminStudents";
import type { AdminStudent } from "@/types";
import { Save, Trash2 } from "lucide-react";

export default function AdminClassSectionPage() {
  const params = useParams();
  const router = useRouter();
  const gradeId = String(params?.gradeId ?? "");
  const classId = String(params?.classId ?? "");
  const { teachers: schoolTeachers, classes: schoolClasses, grades: schoolGrades, refresh } = useSchool();
  const schoolClass = schoolClasses.find((cls) => cls.id === classId);
  const grade = schoolGrades.find((g) => g.id === gradeId);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [homeroomTeacherId, setHomeroomTeacherId] = useState("");
  const [homeroomTeacherName, setHomeroomTeacherName] = useState<string | null>(null);
  const [className, setClassName] = useState(schoolClass?.name ?? "الشعبة");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const teachers = useMemo(
    () =>
      schoolTeachers
        .map((t) => ({
          id: String(t.id),
          name: String(t.name),
          homeroomClassId: t.homeroomClassId != null ? String(t.homeroomClassId) : null,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "ar")),
    [schoolTeachers]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = (await api.getAdminClassDetail(classId)) as {
        class: Record<string, unknown>;
        students: Array<Record<string, unknown>>;
      };
      setStudents((data.students ?? []).map(mapAdminStudent));
      setHomeroomTeacherName((data.class?.homeroomTeacherName as string | null | undefined) ?? null);
      setHomeroomTeacherId(String((data.class?.homeroomTeacherId as string | null | undefined) ?? ""));
      setClassName(String(data.class?.name ?? schoolClass?.name ?? "الشعبة"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تحميل تفاصيل الشعبة");
    } finally {
      setLoading(false);
    }
  }, [classId, schoolClass?.name]);

  useEffect(() => {
    void load();
  }, [load]);

  const homeroomTeacherOptions = useMemo(
    () =>
      teachers
        .filter((teacher) => !teacher.homeroomClassId || teacher.homeroomClassId === classId)
        .map((teacher) => ({ value: teacher.id, label: teacher.name })),
    [teachers, classId]
  );

  const pendingName = teachers.find((t) => t.id === homeroomTeacherId)?.name ?? null;

  async function saveHomeroom() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.updateAdminClassHomeroom(classId, homeroomTeacherId || null);
      await load();
      await refresh();
      setSuccess(
        homeroomTeacherId
          ? `تم تعيين ${pendingName ?? "مربي الصف"} بنجاح.`
          : "تم إزالة مربي الصف بنجاح."
      );
      setConfirmSave(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حفظ مربي الصف");
    } finally {
      setSaving(false);
    }
  }

  async function deleteClass() {
    setDeleting(true);
    try {
      await api.deleteAdminClass(classId);
      await refresh();
      router.push(`/admin/classes/${gradeId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حذف الشعبة");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <WorkspacePage
      title={className}
      description="مربي الصف منفصل عن إسناد المواد — معلم واحد لكل شعبة."
      breadcrumbs={[
        { label: "المراحل", href: "/admin/classes" },
        { label: grade?.name ?? "المرحلة", href: `/admin/classes/${gradeId}` },
        { label: className },
      ]}
      loading={loading}
      loadingMessage="جاري تحميل الشعبة..."
      actions={
        <Button variant="outline" className="text-p-red" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="h-4 w-4" />
          حذف الشعبة
        </Button>
      }
    >
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      ) : null}

      <Card className="mb-6 max-w-xl">
        <p className="mb-3 text-sm text-p-black/70">
          مربي الصف الحالي: <span className="font-semibold text-p-black">{homeroomTeacherName ?? "غير محدد"}</span>
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <Select
              label="تعيين مربي الصف"
              value={homeroomTeacherId}
              onChange={(e) => {
                setHomeroomTeacherId(e.target.value);
                setSuccess("");
              }}
              options={[{ value: "", label: "بدون (غير محدد)" }, ...homeroomTeacherOptions]}
            />
          </div>
          <Button type="button" variant="outline" onClick={() => setConfirmSave(true)} disabled={saving}>
            <Save className="h-4 w-4" />
            حفظ
          </Button>
        </div>
      </Card>

      {students.length === 0 ? (
        <EmptyState title="لا يوجد طلاب في هذه الشعبة" />
      ) : (
        <div className={TABLE_WRAP}>
          <div className="overflow-x-auto">
            <table className={TABLE_BASE}>
              <thead>
                <tr>
                  <th className={TABLE_TH}>الطالب</th>
                  <th className={TABLE_TH}>رقم الطالب</th>
                  <th className={TABLE_TH}>رقم الهوية</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-50/80">
                    <td className={TABLE_TD}>{s.name}</td>
                    <td className={TABLE_TD}>{s.studentNumber ?? "—"}</td>
                    <td className={TABLE_TD} dir="ltr">
                      {s.nationalId ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmSave}
        title="تأكيد تعيين مربي الصف"
        confirmLabel="تأكيد"
        loadingLabel="جاري الحفظ..."
        description={
          homeroomTeacherId ? (
            <>
              تعيين <span className="font-semibold">{pendingName}</span> مربياً لـ {className}؟
            </>
          ) : (
            <>إزالة مربي الصف من {className}؟</>
          )
        }
        loading={saving}
        onConfirm={saveHomeroom}
        onCancel={() => setConfirmSave(false)}
      />
      <ConfirmDialog
        open={confirmDelete}
        title="تأكيد حذف الشعبة"
        description={`سيتم إلغاء ربط الطلاب بشعبة ${className}.`}
        loading={deleting}
        onConfirm={deleteClass}
        onCancel={() => setConfirmDelete(false)}
      />
    </WorkspacePage>
  );
}
