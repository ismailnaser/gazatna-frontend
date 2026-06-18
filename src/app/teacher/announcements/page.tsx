"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { PageHeader } from "@/components/molecules/PageHeader";
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
    if (teacher) load();
  }, [teacher]);

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
          title="الإعلانات"
          description="انشر إعلانات تظهر للطلاب ضمن محتوى المواد"
        />
        <Link href="/teacher/announcements/new">
          <Button>
            <Plus className="h-4 w-4" />
            إعلان جديد
          </Button>
        </Link>
      </div>

      {saved && (
        <Alert variant="success" className="mb-4">
          تم حفظ الإعلان بنجاح
        </Alert>
      )}

      {classes.length === 0 ? (
        <Card className="text-center text-neutral-500">لا توجد فصول مسندة إليك.</Card>
      ) : groupedItems.length === 0 ? (
        <Card className="text-center text-neutral-500">لا توجد إعلانات بعد.</Card>
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
    </div>
  );
}
