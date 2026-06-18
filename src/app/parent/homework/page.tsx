"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { api } from "@/lib/api";
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
    <div className="flex min-w-0 items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2.5">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-base font-bold leading-none text-p-black">{count}</p>
        <p className="mt-0.5 truncate text-xs text-p-black/55">{label}</p>
      </div>
    </div>
  );
}

export default function ParentHomeworkSubjectsPage() {
  const [subjects, setSubjects] = useState<ParentSubjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getParentSubjects()
      .then((data) => setSubjects(data as ParentSubjectSummary[]))
      .catch(() => setSubjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="محتوى المواد"
        description="اختر المادة لعرض واجباتها واختباراتها وإعلاناتها ومرفقاتها"
      />

      {loading ? (
        <p className="text-neutral-500">جاري التحميل...</p>
      ) : subjects.length === 0 ? (
        <Card className="text-center text-neutral-500">لا توجد مواد أو واجبات حالياً.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {subjects.map((row) => {
            const stats = [
              row.homeworkCount > 0 && {
                key: "hw",
                icon: PenLine,
                count: row.homeworkCount,
                label: row.homeworkCount === 1 ? "واجب" : "واجبات",
                tone: "orange" as const,
              },
              row.quizCount > 0 && {
                key: "quiz",
                icon: ClipboardList,
                count: row.quizCount,
                label: row.quizCount === 1 ? "اختبار" : "اختبارات",
                tone: "blue" as const,
              },
              (row.announcementCount ?? 0) > 0 && {
                key: "ann",
                icon: Megaphone,
                count: row.announcementCount ?? 0,
                label: (row.announcementCount ?? 0) === 1 ? "إعلان" : "إعلانات",
                tone: "amber" as const,
              },
              (row.materialCount ?? 0) > 0 && {
                key: "mat",
                icon: FolderOpen,
                count: row.materialCount ?? 0,
                label: (row.materialCount ?? 0) === 1 ? "مرفق" : "مرفقات",
                tone: "teal" as const,
              },
            ].filter(Boolean) as Array<{
              key: string;
              icon: typeof BookOpen;
              count: number;
              label: string;
              tone: "orange" | "blue" | "amber" | "teal";
            }>;

            return (
            <Link
              key={row.subject}
              href={`/parent/homework/subject/${encodeURIComponent(row.subject)}`}
              className="block"
            >
              <Card className="p-4 transition-shadow hover:shadow-md sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10">
                      <BookOpen className="h-5 w-5 text-brand-orange" />
                    </span>
                    <h3 className="truncate text-base font-bold text-p-black sm:text-lg">{row.subject}</h3>
                  </div>
                  <ChevronLeft className="h-5 w-5 shrink-0 text-p-black/30" />
                </div>
                {stats.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
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
                ) : (
                  <p className="text-sm text-p-black/45">لا يوجد محتوى بعد</p>
                )}
              </Card>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
