"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { EmptyState } from "@/components/molecules/EmptyState";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
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
    load();
  }, []);

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

  if (!teacher && !loading) {
    return <p className="text-neutral-700">لم يتم ربط حسابك بملف معلم.</p>;
  }

  return (
    <WorkspacePage
      title="مرفقات المواد"
      description="ارفع كتب المادة وسلايدات ومصادر تظهر للطلاب ضمن محتوى المواد"
      breadcrumbs={[
        { label: "فصولي", href: "/teacher" },
        { label: "مرفقات المواد" },
      ]}
      loading={loading || fetching}
      actions={
        <Link href="/teacher/materials/new" prefetch={false}>
          <Button>
            <Plus className="h-4 w-4" />
            مرفق جديد
          </Button>
        </Link>
      }
    >
      {saved && (
        <Alert variant="success" className="mb-4">
          تم حفظ المرفق بنجاح
        </Alert>
      )}

      {classes.length === 0 ? (
        <EmptyState title="لا توجد فصول مسندة إليك." />
      ) : groupedItems.length === 0 ? (
        <EmptyState title="لا توجد مرفقات بعد." />
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
    </WorkspacePage>
  );
}
