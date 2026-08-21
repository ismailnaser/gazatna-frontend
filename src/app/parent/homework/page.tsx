"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/atoms/Card";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { EmptyState } from "@/components/molecules/EmptyState";
import { api, peekCachedList } from "@/lib/api";
import type { ParentSubjectSummary } from "@/types";
import { BookOpen, ChevronLeft, ClipboardList, FolderOpen, Megaphone, PenLine } from "lucide-react";

function SubjectStat({
  icon: Icon,
  count,
  label,
  tone,
}: {
  icon: typeof BookOpen;
  count: number;
  label: string;
  tone: "orange" | "blue" | "amber" | "teal";
}) {
  const tones = {
    orange: "bg-brand-orange/10 text-brand-orange",
    blue: "bg-brand-blue/10 text-brand-blue",
    amber: "bg-amber-50 text-amber-700",
    teal: "bg-p-green/10 text-p-green",
  };

  return (
    <div
      className={`flex h-14 min-w-0 items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2.5 ${
        count === 0 ? "opacity-45" : ""
      }`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-base font-bold leading-none text-p-black">{count}</p>
        <p className="mt-0.5 truncate text-xs text-p-black/75">{label}</p>
      </div>
    </div>
  );
}

export default function ParentHomeworkSubjectsPage() {
  const cached = peekCachedList<ParentSubjectSummary>("/parent/subjects/");
  const [subjects, setSubjects] = useState<ParentSubjectSummary[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    api
      .getParentSubjects()
      .then((data) => setSubjects(data as ParentSubjectSummary[]))
      .catch(() => {
        if (!cached) setSubjects([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <WorkspacePage
      title="مهام المغامرة"
      description="اختار مادتك وشوف الواجبات والاختبارات والكنوز."
      breadcrumbs={[
        { label: "الرئيسية", href: "/parent" },
        { label: "مهام المغامرة" },
      ]}
      loading={loading}
    >
      {subjects.length === 0 ? (
        <EmptyState title="لسه ما في مهام. أول ما المعلم يحط شي، بيظهر هون." />
      ) : (
        <div className="card-grid card-grid-2">
          {subjects.map((row) => {
            const stats = [
              {
                key: "hw",
                icon: PenLine,
                count: row.homeworkCount,
                label: row.homeworkCount === 1 ? "واجب" : "واجبات",
                tone: "orange" as const,
              },
              {
                key: "quiz",
                icon: ClipboardList,
                count: row.quizCount,
                label: row.quizCount === 1 ? "اختبار" : "اختبارات",
                tone: "blue" as const,
              },
              {
                key: "ann",
                icon: Megaphone,
                count: row.announcementCount ?? 0,
                label: (row.announcementCount ?? 0) === 1 ? "إعلان" : "إعلانات",
                tone: "amber" as const,
              },
              {
                key: "mat",
                icon: FolderOpen,
                count: row.materialCount ?? 0,
                label: (row.materialCount ?? 0) === 1 ? "مرفق" : "مرفقات",
                tone: "teal" as const,
              },
            ];

            return (
            <Link
              key={row.subject}
              href={`/parent/homework/subject/${encodeURIComponent(row.subject)}`}
              prefetch={false}
              className="flex"
            >
              <Card className="flex min-h-full w-full flex-1 flex-col p-4 transition-shadow hover:shadow-md sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10">
                      <BookOpen className="h-5 w-5 text-brand-orange" />
                    </span>
                    <h3 className="truncate text-base font-bold text-p-black sm:text-lg">{row.subject}</h3>
                  </div>
                  <ChevronLeft className="h-5 w-5 shrink-0 text-p-black/30" />
                </div>
                <div className="mt-auto grid grid-cols-2 gap-2">
                  {stats.map((item) => (
                    <SubjectStat
                      key={item.key}
                      icon={item.icon}
                      count={item.count}
                      label={item.label}
                      tone={item.tone}
                    />
                  ))}
                </div>
              </Card>
            </Link>
            );
          })}
        </div>
      )}
    </WorkspacePage>
  );
}
