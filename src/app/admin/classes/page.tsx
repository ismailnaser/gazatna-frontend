"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { HubCard, HubGrid } from "@/components/dashboard/HubCard";
import { EmptyState } from "@/components/molecules/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import { api } from "@/lib/api";
import { isSuperAdmin } from "@/lib/adminRoles";
import { mapGrades, mapSchoolClasses } from "@/lib/mapSchoolClass";
import type { Grade, SchoolClass } from "@/types/teacher";
import { GraduationCap, GripVertical, Plus } from "lucide-react";

export default function AdminClassesHubPage() {
  const { user } = useAuth();
  const { classes: schoolClasses, grades: schoolGrades, refresh } = useSchool();
  const [grades, setGrades] = useState<Grade[]>(schoolGrades);
  const [pageClasses, setPageClasses] = useState<SchoolClass[]>(schoolClasses);
  const [loading, setLoading] = useState(!schoolGrades.length);
  const [error, setError] = useState("");
  const [draggingGradeId, setDraggingGradeId] = useState("");
  const [dropTargetGradeId, setDropTargetGradeId] = useState("");
  const [reordering, setReordering] = useState(false);

  const sortGrades = (list: Grade[]) =>
    [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name, "ar"));

  const load = useCallback(async () => {
    if (schoolGrades.length) {
      setGrades(sortGrades(schoolGrades));
      setPageClasses(schoolClasses);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [gradesData, classesData] = await Promise.all([api.getAdminGrades(), api.getAdminClasses()]);
      setGrades(sortGrades(mapGrades(gradesData as unknown[])));
      setPageClasses(mapSchoolClasses(classesData as unknown[]));
    } catch {
      setError("تعذر تحميل المراحل الدراسية");
    } finally {
      setLoading(false);
    }
  }, [schoolGrades, schoolClasses]);

  useEffect(() => {
    void load();
  }, [load]);

  const classesByGradeName = useMemo(() => {
    const map = new Map<string, SchoolClass[]>();
    for (const cls of pageClasses) {
      const grade = cls.gradeLevel?.trim();
      if (!grade) continue;
      const list = map.get(grade) ?? [];
      list.push(cls);
      map.set(grade, list);
    }
    return map;
  }, [pageClasses]);

  async function handleGradeDrop(e: React.DragEvent<HTMLDivElement>, toId: string) {
    e.preventDefault();
    const fromId = e.dataTransfer.getData("text/plain");
    setDraggingGradeId("");
    setDropTargetGradeId("");
    if (!fromId || fromId === toId) return;
    const fromIdx = grades.findIndex((g) => g.id === fromId);
    const toIdx = grades.findIndex((g) => g.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = [...grades];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setGrades(next);
    setReordering(true);
    try {
      const data = await api.reorderAdminGrades(next.map((g) => g.id));
      setGrades(sortGrades(mapGrades(data as unknown[])));
      void refresh();
    } catch {
      setError("تعذر حفظ ترتيب الفصول");
      const data = await api.getAdminGrades();
      setGrades(sortGrades(mapGrades(data as unknown[])));
    } finally {
      setReordering(false);
    }
  }

  if (user && !isSuperAdmin(user.role)) {
    return <p className="text-sm text-neutral-700">إدارة المراحل الدراسية متاحة للإدارة الكلية فقط.</p>;
  }

  return (
    <WorkspacePage
      title="المراحل الدراسية"
      description="اضغط على مرحلة لفتح شعبها. اسحب البطاقة لتغيير ترتيب التصعيد."
      actions={
        <Button href="/admin/classes/new">
          <Plus className="h-4 w-4" />
          إضافة مرحلة
        </Button>
      }
      loading={loading}
      loadingMessage="جاري تحميل المراحل..."
    >
      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {reordering ? <p className="mb-3 text-xs font-medium text-brand-blue">جاري حفظ الترتيب...</p> : null}

      {grades.length === 0 ? (
        <EmptyState
          title="لا توجد مراحل بعد"
          description="أضف مرحلة مثل الصف التاسع، وسيتم توليد الشعب تلقائياً."
          action={
            <Button href="/admin/classes/new">
              <Plus className="h-4 w-4" />
              إضافة مرحلة
            </Button>
          }
        />
      ) : (
        <HubGrid>
          {grades.map((grade, index) => {
            const sections = classesByGradeName.get(grade.name) ?? [];
            const students = sections.reduce((sum, cls) => sum + (cls.studentCount ?? 0), 0);
            return (
              <div
                key={grade.id}
                draggable={!reordering}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", grade.id);
                  e.dataTransfer.effectAllowed = "move";
                  setDraggingGradeId(grade.id);
                }}
                onDragEnd={() => {
                  setDraggingGradeId("");
                  setDropTargetGradeId("");
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDropTargetGradeId(grade.id);
                }}
                onDrop={(e) => handleGradeDrop(e, grade.id)}
                className={
                  draggingGradeId === grade.id
                    ? "opacity-60"
                    : dropTargetGradeId === grade.id
                      ? "ring-2 ring-brand-blue ring-offset-2 rounded-2xl"
                      : ""
                }
              >
                <HubCard
                  href={`/admin/classes/${grade.id}`}
                  icon={GraduationCap}
                  title={grade.name}
                  description={`${grade.sectionsCount} ${grade.sectionsCount === 1 ? "شعبة" : "شعب"} · ترتيب التصعيد ${index + 1}`}
                  meta={
                    <span className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-neutral-400" />
                      <Badge variant="default">{students} طالب</Badge>
                    </span>
                  }
                />
              </div>
            );
          })}
        </HubGrid>
      )}
    </WorkspacePage>
  );
}
