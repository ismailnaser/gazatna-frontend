"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/atoms/Card";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { EmptyState } from "@/components/molecules/EmptyState";
import {
  isParentFeeRestricted,
  ParentAccessBlockedCard,
  ParentNoStudentCard,
  type ParentStudentResponse,
} from "@/components/parent/ParentAccessCards";
import { useParentStudent } from "@/hooks/useParentStudent";
import { api, peekCachedList } from "@/lib/api";
import { formatClassLabel } from "@/lib/adminStudents";
import type { ParentSubjectSummary, Student } from "@/types";
import { BookMarked, BookOpen, ChevronLeft } from "lucide-react";

export default function ParentSubjectsPage() {
  const { student, loading: studentLoading } = useParentStudent();
  const cached = peekCachedList<ParentSubjectSummary>("/parent/subjects/");
  const [subjects, setSubjects] = useState<ParentSubjectSummary[]>(cached ?? []);
  const [loadingSubjects, setLoadingSubjects] = useState(!cached);
  const access = student as (Student & ParentStudentResponse) | null;
  const restricted = isParentFeeRestricted(access);

  useEffect(() => {
    if (!student || restricted) {
      setLoadingSubjects(false);
      return;
    }
    let cancelled = false;
    api
      .getParentSubjects()
      .then((data) => {
        if (!cancelled) setSubjects(data as ParentSubjectSummary[]);
      })
      .catch(() => {
        if (!cancelled && !cached) setSubjects([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSubjects(false);
      });
    return () => {
      cancelled = true;
    };
  }, [student, restricted]);

  const classLabel = student ? formatClassLabel(student.grade, student.section) : "";

  if (!student && !studentLoading) {
    return <ParentNoStudentCard />;
  }

  if (student && restricted) {
    return (
      <ParentAccessBlockedCard
        message={
          access?.accessRestrictionMessage ||
          "تم إيقاف الوصول إلى حساب الطالب بسبب الرسوم المستحقة."
        }
        studentName={student.name}
      />
    );
  }

  return (
    <WorkspacePage
      title="موادي"
      description="مواد صفّك الملونة — كل مادة باب لمغامرة."
      breadcrumbs={[
        { label: "الرئيسية", href: "/parent" },
        { label: "موادي" },
      ]}
      loading={studentLoading || loadingSubjects}
    >
      {subjects.length === 0 ? (
        <EmptyState
          title="لسه ما في مواد بهالصف."
          description={
            classLabel
              ? `صفك: ${classLabel}. الإدارة رح تسند المواد قريب.`
              : "الإدارة رح تسند المواد قريب."
          }
        />
      ) : (
        <div className="card-grid">
          {subjects.map((row) => (
            <Link
              key={row.subject}
              href={`/parent/homework/subject/${encodeURIComponent(row.subject)}`}
              prefetch={false}
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
                      <p className="text-sm text-p-black/78">المعلم: {row.teacherName}</p>
                    ) : null}
                    {row.totalCount > 0 ? (
                      <p className="mt-2 text-xs font-medium text-brand-orange">
                        {row.totalCount} عنصر في المحتوى
                      </p>
                    ) : (
                      <p className="mt-2 flex items-center gap-1 text-xs text-p-black/70">
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
    </WorkspacePage>
  );
}
