"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { EmptyState } from "@/components/molecules/EmptyState";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { TeacherQuizGroupCard } from "@/components/teacher/TeacherQuizGroupCard";
import { useAssignments } from "@/context/AssignmentsContext";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import { groupQuizList, type QuizGroup } from "@/lib/quizGroups";
import { quizTotalPoints } from "@/lib/quiz-scoring";
import { Plus } from "lucide-react";

export default function TeacherQuizzesPage() {
  const { user } = useAuth();
  const { getTeacherClassesByUserId, currentTeacher, loading } = useSchool();
  const { getQuizzesByTeacher, deleteQuiz, getQuizSubmissions, updateQuiz, refresh } =
    useAssignments();

  const classes = user ? getTeacherClassesByUserId(user.id) : [];
  const teacher = currentTeacher;
  const classIds = classes.map((c) => c.id);
  const items = teacher ? getQuizzesByTeacher(teacher.id, classIds) : [];
  const [expandedGroupId, setExpandedGroupId] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState<QuizGroup | null>(null);
  const [deleting, setDeleting] = useState(false);

  const groupedItems = useMemo(() => groupQuizList(items), [items]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.search.includes("saved=1")) {
      setSaved(true);
      window.history.replaceState({}, "", "/teacher/quizzes");
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

  async function toggleGradesVisible(group: QuizGroup) {
    await updateQuiz(group.id, { gradesVisible: !group.gradesVisible }, { applyToGroup: true });
    await refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function toggleReviewAllowed(group: QuizGroup) {
    await updateQuiz(group.id, { reviewAllowed: !group.reviewAllowed }, { applyToGroup: true });
    await refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <WorkspacePage
      title="الاختبارات"
      description="إدارة وتوزيع الاختبارات على فصولك"
      breadcrumbs={[
        { label: "فصولي", href: "/teacher" },
        { label: "الاختبارات" },
      ]}
      loading={loading}
      actions={
        <Link href="/teacher/quizzes/new" prefetch={false}>
          <Button>
            <Plus className="h-4 w-4" />
            اختبار جديد
          </Button>
        </Link>
      }
    >
      {saved && (
        <Alert variant="success" className="mb-4">
          تم حفظ الاختبار بنجاح
        </Alert>
      )}

      {classes.length === 0 ? (
        <EmptyState title="لا توجد فصول مسندة إليك." />
      ) : groupedItems.length === 0 ? (
        <EmptyState title="لا توجد اختبارات بعد." />
      ) : (
        <div className="space-y-3">
          {groupedItems.map((group) => {
            const isOpen = expandedGroupId === group.groupId;
            const submissionTotal =
              group.totalSubmissions ||
              group.targets.reduce(
                (sum, target) =>
                  sum + (target.submissionCount ?? getQuizSubmissions(target.id).length),
                0
              );
            const maxScore = group.maxScore ?? quizTotalPoints(group.questions);

            return (
              <TeacherQuizGroupCard
                key={group.groupId}
                group={group}
                isOpen={isOpen}
                submissionTotal={submissionTotal}
                maxScore={maxScore}
                onToggle={() => setExpandedGroupId(isOpen ? "" : group.groupId)}
                onDelete={() => setConfirmDeleteGroup(group)}
                onToggleGradesVisible={() => toggleGradesVisible(group)}
                onToggleReviewAllowed={() => toggleReviewAllowed(group)}
                getQuizSubmissions={getQuizSubmissions}
              />
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmDeleteGroup)}
        title="تأكيد حذف الاختبار"
        description={
          <>
            هل أنت متأكد من حذف الاختبار{" "}
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
            await deleteQuiz(confirmDeleteGroup.id, {
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
