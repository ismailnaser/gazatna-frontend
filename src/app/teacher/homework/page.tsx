"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { EmptyState } from "@/components/molecules/EmptyState";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { TeacherHomeworkGroupCard } from "@/components/teacher/TeacherHomeworkGroupCard";
import { useAssignments } from "@/context/AssignmentsContext";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import { groupHomeworkList, type HomeworkGroup } from "@/lib/homeworkGroups";
import { Plus } from "lucide-react";

export default function TeacherHomeworkPage() {
  const { user } = useAuth();
  const { getTeacherClassesByUserId, currentTeacher, loading } = useSchool();
  const { getHomeworkByTeacher, deleteHomework, getHomeworkSubmissions } =
    useAssignments();

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

  if (!teacher && !loading) {
    return <p className="text-neutral-700">لم يتم ربط حسابك بملف معلم.</p>;
  }

  return (
    <WorkspacePage
      title="الواجبات"
      description="إدارة وتوزيع الواجبات على فصولك"
      breadcrumbs={[
        { label: "فصولي", href: "/teacher" },
        { label: "الواجبات" },
      ]}
      loading={loading}
      actions={
        <Link href="/teacher/homework/new" prefetch={false}>
          <Button>
            <Plus className="h-4 w-4" />
            واجب جديد
          </Button>
        </Link>
      }
    >
      {saved && (
        <Alert variant="success" className="mb-4">
          تم حفظ الواجب بنجاح
        </Alert>
      )}

      {classes.length === 0 ? (
        <EmptyState title="لا توجد فصول مسندة إليك." />
      ) : groupedItems.length === 0 ? (
        <EmptyState title="لا توجد واجبات بعد." />
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
    </WorkspacePage>
  );
}
