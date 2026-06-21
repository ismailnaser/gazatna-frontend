"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { api } from "@/lib/api";
import { formatClassLabel } from "@/lib/adminStudents";
import type { ParentSubjectSummary, Student } from "@/types";
import { BookMarked, BookOpen, ChevronLeft } from "lucide-react";

export default function ParentSubjectsPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [subjects, setSubjects] = useState<ParentSubjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getParentStudent().then((data) => setStudent(data as Student)).catch(() => setStudent(null)),
      api.getParentSubjects()
        .then((data) => setSubjects(data as ParentSubjectSummary[]))
        .catch(() => setSubjects([])),
    ]).finally(() => setLoading(false));
  }, []);

  const classLabel = student ? formatClassLabel(student.grade, student.section) : "";

  return (
    <div>
      <PageHeader
        title="المواد المسندة"
        description="المواد المرتبطة بفصل وشعبة الطالب — حسب إسناد المعلمين"
      />

      {loading ? (
        <p className="text-neutral-500">جاري التحميل...</p>
      ) : !student ? (
        <Card className="text-center text-neutral-500">
          لا يوجد طالب مرتبط بحسابك. تواصل مع الإدارة.
        </Card>
      ) : subjects.length === 0 ? (
        <Card className="space-y-2 text-center text-neutral-500">
          <p>لا توجد مواد مسندة لفصل الطالب حالياً.</p>
          {classLabel ? (
            <p className="text-sm text-p-black/60">
              فصل الطالب: <span className="font-semibold text-p-black">{classLabel}</span>
            </p>
          ) : null}
          <p className="text-sm leading-relaxed text-p-black/55">
            يجب على الإدارة إسناد معلم ومواد لهذه الشعبة تحديداً من لوحة{" "}
            <span className="font-semibold">الكادر → تعديل المعلم → الفصول المسندة</span>.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((row) => (
            <Link
              key={row.subject}
              href={`/parent/homework/subject/${encodeURIComponent(row.subject)}`}
              className="block"
            >
              <Card className="h-full p-4 transition-shadow hover:shadow-md sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10">
                        <BookMarked className="h-4 w-4 text-brand-blue" />
                      </span>
                      <h3 className="truncate text-base font-bold text-p-black">{row.subject}</h3>
                    </div>
                    {row.teacherName ? (
                      <p className="text-sm text-p-black/60">المعلم: {row.teacherName}</p>
                    ) : null}
                    {row.totalCount > 0 ? (
                      <p className="mt-2 text-xs font-medium text-brand-orange">
                        {row.totalCount} عنصر في المحتوى
                      </p>
                    ) : (
                      <p className="mt-2 flex items-center gap-1 text-xs text-p-black/45">
                        <BookOpen className="h-3.5 w-3.5" />
                        لا يوجد محتوى بعد
                      </p>
                    )}
                  </div>
                  <ChevronLeft className="h-5 w-5 shrink-0 text-p-black/30" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
