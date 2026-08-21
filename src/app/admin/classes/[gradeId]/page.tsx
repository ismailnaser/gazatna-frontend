"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { NumberFieldWithKeypad } from "@/components/teacher/NumberFieldWithKeypad";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { HubCard, HubGrid } from "@/components/dashboard/HubCard";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { EmptyState } from "@/components/molecules/EmptyState";
import { useSchool } from "@/context/SchoolContext";
import { api } from "@/lib/api";
import { mapGrades, mapSchoolClasses } from "@/lib/mapSchoolClass";
import type { Grade, SchoolClass } from "@/types/teacher";
import { Save, Trash2, Users } from "lucide-react";

export default function AdminGradeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gradeId = String(params?.gradeId ?? "");
  const { classes: schoolClasses, grades: schoolGrades, refresh } = useSchool();
  const [grade, setGrade] = useState<Grade | null>(
    schoolGrades.find((g) => g.id === gradeId) ?? null
  );
  const [sections, setSections] = useState<SchoolClass[]>(
    schoolClasses.filter((cls) => cls.gradeLevel === grade?.name)
  );
  const [loading, setLoading] = useState(!grade);
  const [error, setError] = useState("");
  const [sectionsCount, setSectionsCount] = useState(String(grade?.sectionsCount ?? 1));
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (schoolGrades.length) {
      const found = schoolGrades.find((g) => g.id === gradeId) ?? null;
      setGrade(found);
      setSectionsCount(String(found?.sectionsCount ?? 1));
      setSections(schoolClasses.filter((cls) => cls.gradeLevel === found?.name));
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [gradesData, classesData] = await Promise.all([api.getAdminGrades(), api.getAdminClasses()]);
      const grades = mapGrades(gradesData as unknown[]);
      const classes = mapSchoolClasses(classesData as unknown[]);
      const found = grades.find((g) => g.id === gradeId) ?? null;
      setGrade(found);
      setSectionsCount(String(found?.sectionsCount ?? 1));
      setSections(classes.filter((cls) => cls.gradeLevel === found?.name));
    } catch {
      setError("تعذر تحميل المرحلة");
    } finally {
      setLoading(false);
    }
  }, [gradeId, schoolGrades, schoolClasses]);

  useEffect(() => {
    void load();
  }, [load]);

  const studentsInGrade = useMemo(
    () => sections.reduce((sum, cls) => sum + (cls.studentCount ?? 0), 0),
    [sections]
  );

  async function saveCount() {
    if (!grade) return;
    setSaving(true);
    setError("");
    try {
      await api.updateAdminGrade(grade.id, { sectionsCount: Number(sectionsCount) });
      await refresh();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تحديث عدد الشعب");
    } finally {
      setSaving(false);
    }
  }

  async function deleteGrade() {
    if (!grade) return;
    setDeleting(true);
    try {
      await api.deleteAdminGrade(grade.id);
      await refresh();
      router.push("/admin/classes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حذف المرحلة");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <WorkspacePage
      title={grade?.name ?? "المرحلة"}
      description="افتح شعبة لعرض الطلاب وتعيين مربي الصف."
      breadcrumbs={[{ label: "المراحل", href: "/admin/classes" }, { label: grade?.name ?? "..." }]}
      loading={loading}
      loadingMessage="جاري تحميل المرحلة..."
      actions={
        <Button variant="outline" className="text-p-red" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="h-4 w-4" />
          حذف المرحلة
        </Button>
      }
    >
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}

      <Card className="mb-6 max-w-xl">
        <div className="flex flex-wrap items-end gap-3">
          <NumberFieldWithKeypad
            fieldId={`sections-${gradeId}`}
            label="عدد الشعب"
            value={sectionsCount}
            onChange={setSectionsCount}
            min={1}
            max={20}
            className="w-[200px]"
            inputClassName="w-full"
          />
          <Button type="button" variant="outline" onClick={saveCount} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "جاري الحفظ..." : "حفظ العدد"}
          </Button>
        </div>
      </Card>

      {sections.length === 0 ? (
        <EmptyState title="لا توجد شعب" description="عدّل عدد الشعب ثم احفظ لتوليدها." />
      ) : (
        <HubGrid>
          {sections.map((cls) => (
            <HubCard
              key={cls.id}
              href={`/admin/classes/${gradeId}/sections/${cls.id}`}
              icon={Users}
              title={cls.name}
              description="قائمة الطلاب ومربي الصف"
              meta={<Badge variant="default">{cls.studentCount ?? 0} طالب</Badge>}
            />
          ))}
        </HubGrid>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="تأكيد حذف المرحلة"
        description={
          <>
            سيتم حذف جميع شعب {grade?.name}
            {studentsInGrade > 0 ? ` وإلغاء ربط ${studentsInGrade} طالب` : ""}.
          </>
        }
        loading={deleting}
        onConfirm={deleteGrade}
        onCancel={() => setConfirmDelete(false)}
      />
    </WorkspacePage>
  );
}
