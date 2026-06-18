"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { PageHeader } from "@/components/molecules/PageHeader";
import { TeacherHomeworkGroupCard } from "@/components/teacher/TeacherHomeworkGroupCard";
import { TeacherSubmissionAlerts } from "@/components/teacher/TeacherSubmissionAlerts";
import { useAssignments } from "@/context/AssignmentsContext";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import { useTeacherAlerts } from "@/hooks/useTeacherAlerts";
import { groupHomeworkList, type HomeworkGroup } from "@/lib/homeworkGroups";
import { Plus } from "lucide-react";

export default function TeacherHomeworkPage() {
  const { user } = useAuth();
  const { getTeacherClassesByUserId, currentTeacher, loading } = useSchool();
  const { getHomeworkByTeacher, deleteHomework, getHomeworkSubmissions, homeworkSubmissions } =
    useAssignments();
  const { alerts, refresh } = useTeacherAlerts();

  const classes = user ? getTeacherClassesByUserId(user.id) : [];
  const teacher = currentTeacher;
  const classIds = classes.map((c) => c.id);
  const items = teacher ? getHomeworkByTeacher(teacher.id, classIds) : [];
  const groupedItems = useMemo(() => groupHomeworkList(items), [items]);

  const [expandedGroupId, setExpandedGroupId] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState<HomeworkGroup | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.search.includes("saved=1")) {
      setSaved(true);
      window.history.replaceState({}, "", "/teacher/homework");
    }
  }, []);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(t);
  }, [saved]);

  useEffect(() => {
    refresh();
  }, [homeworkSubmissions.length, saved, refresh]);

  const homeworkAlerts = useMemo(
    () => alerts.filter((a) => a.type === "homework_submission"),
    [alerts]
  );

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  if (!teacher) {
    return <p className="text-neutral-500">لم يتم ربط حسابك بملف معلم.</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="الواجبات"
          description="إدارة وتوزيع الواجبات على فصولك"
        />
        <Link href="/teacher/homework/new">
          <Button>
            <Plus className="h-4 w-4" />
            واجب جديد
          </Button>
        </Link>
      </div>

      {saved && (
        <Alert variant="success" className="mb-4">
          تم حفظ الواجب بنجاح
        </Alert>
      )}

      <TeacherSubmissionAlerts
        alerts={homeworkAlerts}
        limit={5}
        title="تسليمات الواجبات"
        onAlertOpen={refresh}
      />

      {classes.length === 0 ? (
        <Card className="text-center text-neutral-500">لا توجد فصول مسندة إليك.</Card>
      ) : (
        <>
          <h2 className="mb-4 text-lg font-bold text-neutral-900">جميع الواجبات</h2>
          {groupedItems.length === 0 ? (
            <Card className="text-center text-neutral-500">لا توجد واجبات بعد.</Card>
          ) : (
            <div className="space-y-3">
              {groupedItems.map((group) => {
                const isOpen = expandedGroupId === group.groupId;
                const submissionTotal =
                  group.totalSubmissions ||
                  group.targets.reduce(
                    (sum, target) =>
                      sum + (target.submissionCount ?? getHomeworkSubmissions(target.id).length),
                    0
                  );

                return (
                  <TeacherHomeworkGroupCard
                    key={group.groupId}
                    group={group}
                    isOpen={isOpen}
                    submissionTotal={submissionTotal}
                    onToggle={() => setExpandedGroupId(isOpen ? "" : group.groupId)}
                    onDelete={() => setConfirmDeleteGroup(group)}
                    getHomeworkSubmissions={getHomeworkSubmissions}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(confirmDeleteGroup)}
        title="تأكيد حذف الواجب"
        description={
          <>
            هل أنت متأكد من حذف الواجب{" "}
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
            await deleteHomework(confirmDeleteGroup.id, {
              group: confirmDeleteGroup.targets.length > 1,
            });
            setConfirmDeleteGroup(null);
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}
