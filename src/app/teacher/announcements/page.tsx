"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { EmptyState } from "@/components/molecules/EmptyState";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { TeacherAnnouncementGroupCard } from "@/components/teacher/TeacherAnnouncementGroupCard";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import { api } from "@/lib/api";
import { groupAnnouncementList, type AnnouncementGroup } from "@/lib/announcementGroups";
import type { SubjectAnnouncement } from "@/types";
import { Plus } from "lucide-react";

export default function TeacherAnnouncementsPage() {
  const { user } = useAuth();
  const { getTeacherClassesByUserId, currentTeacher, loading } = useSchool();
  const [items, setItems] = useState<SubjectAnnouncement[]>([]);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState<AnnouncementGroup | null>(null);
  const [deleting, setDeleting] = useState(false);

  const classes = user ? getTeacherClassesByUserId(user.id) : [];
  const teacher = currentTeacher;
  const groupedItems = useMemo(() => groupAnnouncementList(items), [items]);

  async function load() {
    setFetching(true);
    try {
      const data = (await api.getTeacherAnnouncements()) as SubjectAnnouncement[];
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
      window.history.replaceState({}, "", "/teacher/announcements");
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
      title="الإعلانات"
      description="انشر إعلانات تظهر للطلاب ضمن محتوى المواد"
      breadcrumbs={[
        { label: "فصولي", href: "/teacher" },
        { label: "الإعلانات" },
      ]}
      loading={loading || fetching}
      actions={
        <Link href="/teacher/announcements/new" prefetch={false}>
          <Button>
            <Plus className="h-4 w-4" />
            إعلان جديد
          </Button>
        </Link>
      }
    >
      {saved && (
        <Alert variant="success" className="mb-4">
          تم حفظ الإعلان بنجاح
        </Alert>
      )}

      {classes.length === 0 ? (
        <EmptyState title="لا توجد فصول مسندة إليك." />
      ) : groupedItems.length === 0 ? (
        <EmptyState title="لا توجد إعلانات بعد." />
      ) : (
        <div className="space-y-3">
          {groupedItems.map((group) => (
            <TeacherAnnouncementGroupCard
              key={group.groupId}
              group={group}
              onDelete={() => setConfirmDeleteGroup(group)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmDeleteGroup)}
        title="تأكيد حذف الإعلان"
        description={
          <>
            هل أنت متأكد من حذف الإعلان{" "}
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
            await api.deleteTeacherAnnouncement(
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
