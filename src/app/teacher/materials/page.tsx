"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { PageHeader } from "@/components/molecules/PageHeader";
import { TeacherMaterialGroupCard } from "@/components/teacher/TeacherMaterialGroupCard";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import { api } from "@/lib/api";
import { groupMaterialList, type MaterialGroup } from "@/lib/materialGroups";
import type { SubjectMaterial } from "@/types";
import { Plus } from "lucide-react";

export default function TeacherMaterialsPage() {
  const { user } = useAuth();
  const { getTeacherClassesByUserId, currentTeacher, loading } = useSchool();
  const [items, setItems] = useState<SubjectMaterial[]>([]);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState<MaterialGroup | null>(null);
  const [deleting, setDeleting] = useState(false);

  const classes = user ? getTeacherClassesByUserId(user.id) : [];
  const teacher = currentTeacher;
  const groupedItems = useMemo(() => groupMaterialList(items), [items]);

  async function load() {
    setFetching(true);
    try {
      const data = (await api.getTeacherMaterials()) as SubjectMaterial[];
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    if (teacher) load();
  }, [teacher]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.search.includes("saved=1")) {
      setSaved(true);
      window.history.replaceState({}, "", "/teacher/materials");
      load();
    }
  }, []);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(t);
  }, [saved]);

  if (loading || fetching) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  if (!teacher) {
    return <p className="text-neutral-500">لم يتم ربط حسابك بملف معلم.</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="مرفقات المواد"
          description="ارفع كتب المادة وسلايدات ومصادر تظهر للطلاب ضمن محتوى المواد"
        />
        <Link href="/teacher/materials/new">
          <Button>
            <Plus className="h-4 w-4" />
            مرفق جديد
          </Button>
        </Link>
      </div>

      {saved && (
        <Alert variant="success" className="mb-4">
          تم حفظ المرفق بنجاح
        </Alert>
      )}

      {classes.length === 0 ? (
        <Card className="text-center text-neutral-500">لا توجد فصول مسندة إليك.</Card>
      ) : groupedItems.length === 0 ? (
        <Card className="text-center text-neutral-500">لا توجد مرفقات بعد.</Card>
      ) : (
        <div className="space-y-3">
          {groupedItems.map((group) => (
            <TeacherMaterialGroupCard
              key={group.groupId}
              group={group}
              onDelete={() => setConfirmDeleteGroup(group)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmDeleteGroup)}
        title="تأكيد حذف المرفق"
        description={
          <>
            هل أنت متأكد من حذف{" "}
            <span className="font-semibold">{confirmDeleteGroup?.title}</span>
            {confirmDeleteGroup && confirmDeleteGroup.targets.length > 1 && (
              <span> من {confirmDeleteGroup.targets.length} فصول؟</span>
            )}
          </>
        }
        loading={deleting}
        onCancel={() => setConfirmDeleteGroup(null)}
        onConfirm={async () => {
          if (!confirmDeleteGroup) return;
          setDeleting(true);
          try {
            await api.deleteTeacherMaterial(
              confirmDeleteGroup.id,
              confirmDeleteGroup.targets.length > 1
            );
            await load();
            setConfirmDeleteGroup(null);
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}
