"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { TeacherClassHomeworkCard } from "@/components/teacher/TeacherClassHomeworkCard";
import { useAssignments } from "@/context/AssignmentsContext";
import { Plus } from "lucide-react";

export function HomeworkPanel({
  classId,
}: {
  classId: string;
  teacherId: string;
}) {
  const { getHomeworkByClass, deleteHomework, getHomeworkSubmissions } = useAssignments();
  const items = getHomeworkByClass(classId);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDeleteItem = items.find((hw) => hw.id === confirmDeleteId) ?? null;

  async function confirmDeleteHomework() {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await deleteHomework(confirmDeleteId);
      setConfirmDeleteId(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-p-black/60">
          أنشئ واجبات منزلية لطلاب هذا الفصل وحدّد موعد التسليم.
        </p>
        <Link href="/teacher/homework/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            واجب جديد
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <Card className="border-dashed text-center text-p-black/50">
          لا توجد واجبات بعد. أنشئ أول واجب للطلاب.
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((hw) => (
            <TeacherClassHomeworkCard
              key={hw.id}
              homework={hw}
              submissionCount={hw.submissionCount ?? getHomeworkSubmissions(hw.id).length}
              onDelete={() => setConfirmDeleteId(hw.id)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmDeleteItem)}
        title="تأكيد حذف الواجب"
        description={
          <>
            هل أنت متأكد من حذف الواجب{" "}
            <span className="font-semibold">{confirmDeleteItem?.title}</span>؟
          </>
        }
        loading={deleting}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={confirmDeleteHomework}
      />
    </div>
  );
}
