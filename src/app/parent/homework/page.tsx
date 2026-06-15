"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Textarea } from "@/components/atoms/Textarea";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useAssignments } from "@/context/AssignmentsContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Homework, ParentChild } from "@/types";
import { Calendar, CheckCircle2 } from "lucide-react";

export default function ParentHomeworkPage() {
  const { user } = useAuth();
  const [child, setChild] = useState<ParentChild | undefined>();
  const { getHomeworkByClass, getHomeworkSubmission, submitHomework } = useAssignments();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      api.getParentChild().then((c) => setChild(c as ParentChild)).catch(() => {});
    }
  }, [user]);

  if (!child) {
    return <p className="text-neutral-500">لم يتم ربط حسابك بملف طالب.</p>;
  }

  const items = getHomeworkByClass(child.classId);

  async function handleSubmit(hw: Homework) {
    if (!content.trim()) return;
    await submitHomework({
      homeworkId: hw.id,
      studentId: child!.studentId,
      content: content.trim(),
    });
    setContent("");
    setActiveId(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <PageHeader
        title="الواجبات"
        description={`واجبات ${child.name} — عرض وتسليم`}
      />

      {saved && (
        <Alert variant="success" className="mb-4">
          تم تسليم الواجب بنجاح
        </Alert>
      )}

      {items.length === 0 ? (
        <Card className="text-center text-neutral-500">لا توجد واجبات حالياً.</Card>
      ) : (
        <div className="space-y-4">
          {items.map((hw) => {
            const submission = getHomeworkSubmission(hw.id, child.studentId);
            const isPastDue = new Date(hw.dueDate) < new Date(new Date().toDateString());
            const canSubmit = hw.status === "active" && !submission && !isPastDue;

            return (
              <Card key={hw.id}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-neutral-950">{hw.title}</h3>
                  {submission ? (
                    <Badge variant="success">
                      <CheckCircle2 className="me-1 inline h-3 w-3" />
                      مُسلّم
                    </Badge>
                  ) : hw.status === "closed" || isPastDue ? (
                    <Badge variant="default">منتهي</Badge>
                  ) : (
                    <Badge variant="warning">بانتظار التسليم</Badge>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-neutral-700">{hw.description}</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-neutral-500">
                  <Calendar className="h-3.5 w-3.5" />
                  موعد التسليم: {hw.dueDate}
                </p>

                {submission && (
                  <div className="mt-4 rounded-xl bg-neutral-50 p-4">
                    <p className="mb-1 text-xs font-semibold text-neutral-500">التسليم:</p>
                    <p className="text-sm text-neutral-800">{submission.content}</p>
                    <p className="mt-2 text-xs text-neutral-400">
                      سُلّم: {new Date(submission.submittedAt).toLocaleString("ar-PS")}
                    </p>
                  </div>
                )}

                {canSubmit && activeId !== hw.id && (
                  <Button className="mt-4" onClick={() => setActiveId(hw.id)}>
                    تسليم الواجب
                  </Button>
                )}

                {activeId === hw.id && (
                  <div className="mt-4 space-y-3 border-t border-neutral-100 pt-4">
                    <Textarea
                      label="اكتب الإجابة أو وصف التسليم"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="مثال: أنجزت التمارين 1-10..."
                      required
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => handleSubmit(hw)} disabled={!content.trim()}>
                        إرسال التسليم
                      </Button>
                      <Button variant="ghost" onClick={() => setActiveId(null)}>
                        إلغاء
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
