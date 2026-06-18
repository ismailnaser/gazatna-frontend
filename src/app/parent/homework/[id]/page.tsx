"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Card } from "@/components/atoms/Card";
import { ParentHomeworkCard } from "@/components/parent/ParentHomeworkCard";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useAssignments } from "@/context/AssignmentsContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Homework, ParentChild } from "@/types";
import { ChevronRight } from "lucide-react";

export default function ParentHomeworkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const [child, setChild] = useState<ParentChild | undefined>();
  const [hw, setHw] = useState<Homework | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [savedWasEdit, setSavedWasEdit] = useState(false);
  const [error, setError] = useState("");
  const { getHomeworkSubmission, submitHomework } = useAssignments();

  useEffect(() => {
    if (user) {
      api.getParentChild().then((c) => setChild(c as ParentChild)).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    api
      .getParentHomeworkDetail(id)
      .then((data) => setHw(data as Homework))
      .catch(() => setHw(null))
      .finally(() => setLoading(false));
  }, [id]);

  const submission = child && hw ? getHomeworkSubmission(hw.id, child.studentId) : undefined;
  const canSubmit = Boolean(hw?.windowStatus === "active");

  async function handleSubmit(data: { content: string; attachment: File | null }) {
    if (!child || !hw) return;
    const isEdit = Boolean(submission);
    setError("");
    try {
      await submitHomework({
        homeworkId: hw.id,
        studentId: child.studentId,
        content: data.content,
        attachment: data.attachment,
      });
      setSavedWasEdit(isEdit);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : isEdit ? "تعذر تحديث التسليم" : "تعذر تسليم الواجب");
    }
  }

  if (!child && !loading) {
    return <p className="text-neutral-500">لم يتم ربط حسابك بملف طالب.</p>;
  }

  const subject = hw?.subject || "عام";

  return (
    <div>
      <Link
        href={`/parent/homework/subject/${encodeURIComponent(subject)}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
      >
        <ChevronRight className="h-4 w-4" />
        {subject}
      </Link>

      {loading ? (
        <p className="text-neutral-500">جاري التحميل...</p>
      ) : !hw ? (
        <Card className="text-center text-neutral-500">الواجب غير متاح.</Card>
      ) : (
        <>
          <PageHeader title={hw.title} description={hw.subject ? `مادة ${hw.subject}` : undefined} className="mb-4" />

          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}
          {saved && (
            <Alert variant="success" className="mb-4">
              {savedWasEdit ? "تم تحديث التسليم بنجاح" : "تم تسليم الواجب بنجاح"}
            </Alert>
          )}

          <ParentHomeworkCard
            hw={hw}
            submission={submission}
            canSubmit={canSubmit}
            onSubmit={handleSubmit}
          />
        </>
      )}
    </div>
  );
}
