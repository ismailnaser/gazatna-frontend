"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Card } from "@/components/atoms/Card";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { EmptyState } from "@/components/molecules/EmptyState";
import { api, peekCachedList } from "@/lib/api";
import type { ParentAssessmentItem } from "@/types";
import { ClipboardList, PenLine } from "lucide-react";

function formatAt(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("ar-PS", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ParentAssessmentsPage() {
  const cached = peekCachedList<ParentAssessmentItem>("/parent/assessments/");
  const [items, setItems] = useState<ParentAssessmentItem[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    api
      .getParentAssessments()
      .then((data) => setItems(data as ParentAssessmentItem[]))
      .catch(() => {
        if (!cached) setItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <WorkspacePage
      title="التقييمات"
      description="علامات الواجبات والاختبارات اللي ظهرها المعلم — كل علامة نجمة."
      breadcrumbs={[
        { label: "الرئيسية", href: "/parent" },
        { label: "التقييمات" },
      ]}
      loading={loading}
    >
      {items.length === 0 ? (
        <EmptyState title="لسه ما في تحديات ظاهرة. أول ما المعلم يظهر علامة، بتصير هون." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-p-cream text-p-black/78">
                <th className="px-4 py-3 text-start font-semibold">النوع</th>
                <th className="px-4 py-3 text-start font-semibold">المادة</th>
                <th className="px-4 py-3 text-start font-semibold">العنوان</th>
                <th className="px-4 py-3 text-start font-semibold">العلامة</th>
                <th className="px-4 py-3 text-start font-semibold">ملاحظة</th>
                <th className="px-4 py-3 text-start font-semibold">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={`${item.kind}-${item.id}`} className="border-b border-neutral-50">
                  <td className="px-4 py-3">
                    {item.kind === "homework" ? (
                      <Badge variant="default">
                        <PenLine className="me-1 inline h-3 w-3" />
                        واجب
                      </Badge>
                    ) : (
                      <Badge variant="info">
                        <ClipboardList className="me-1 inline h-3 w-3" />
                        اختبار
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-p-black/70">{item.subject}</td>
                  <td className="px-4 py-3 font-medium text-p-black">
                    {item.kind === "homework" ? (
                      <Link
                        href={`/parent/homework/${item.refId}`}
                        className="hover:text-brand-blue hover:underline"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      item.title
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-p-green">
                    {item.score}/{item.maxScore}
                  </td>
                  <td className="max-w-[180px] px-4 py-3 text-p-black/72">
                    {item.teacherNote?.trim() ? item.teacherNote : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-p-black/70">
                    {formatAt(item.at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </WorkspacePage>
  );
}
