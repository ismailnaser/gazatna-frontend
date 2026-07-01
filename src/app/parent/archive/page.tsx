"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Grade } from "@/types";
import { ChevronLeft, FolderArchive } from "lucide-react";

type ArchiveTerm = {
  termId: string;
  termName: string;
  sortOrder: number;
  isClosed: boolean;
  closedAt: string | null;
  hasGrades: boolean;
};

type ArchiveYear = {
  yearId: string;
  yearName: string;
  isArchived: boolean;
  terms: ArchiveTerm[];
};

function GradesTable({ grades }: { grades: Grade[] }) {
  if (grades.length === 0) {
    return <p className="text-sm text-p-black/55">لا توجد علامات محفوظة لهذا الفصل.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-neutral-100 bg-p-cream/60 text-p-black/60">
            <th className="px-3 py-2 text-start font-semibold">المادة</th>
            <th className="px-3 py-2 text-center font-semibold">العلامة</th>
            <th className="px-3 py-2 text-center font-semibold">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((grade) => (
            <tr key={grade.id} className="border-b border-neutral-50">
              <td className="px-3 py-2.5 font-medium text-p-black">{grade.subject}</td>
              <td className="px-3 py-2.5 text-center text-p-black">
                {grade.score == null ? "—" : `${grade.score}/${grade.maxScore}`}
              </td>
              <td className="px-3 py-2.5 text-center">
                {grade.passed == null ? (
                  "—"
                ) : (
                  <Badge variant={grade.passed ? "success" : "danger"}>
                    {grade.passed ? "ناجح" : "راسب"}
                  </Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ParentArchivePage() {
  const [years, setYears] = useState<ArchiveYear[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<{ id: string; name: string; yearName: string } | null>(
    null
  );
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [error, setError] = useState("");

  const hasContent = useMemo(() => years.some((year) => year.terms.length > 0), [years]);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const overview = await api.getParentArchive();
      setYears((overview.years as ArchiveYear[]) ?? []);
    } catch {
      setError("تعذر تحميل الأرشيف");
      setYears([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  async function openTerm(term: ArchiveTerm, yearName: string) {
    setSelectedTerm({ id: term.termId, name: term.termName, yearName });
    setLoadingGrades(true);
    setError("");
    try {
      const rows = await api.getParentArchiveTermGrades(term.termId);
      setGrades(rows as Grade[]);
    } catch {
      setGrades([]);
      setError("تعذر تحميل علامات هذا الفصل");
    } finally {
      setLoadingGrades(false);
    }
  }

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="أرشيف السنوات السابقة"
        description="عرض علامات الفصول المنتهية — للقراءة فقط"
      />

      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="font-semibold text-p-black">أرشيف الشهادات</p>
          <p className="mt-1 text-sm text-p-black/55">
            شهادات الفصول المنتهية والسنوات المؤرشفة في قسم مستقل
          </p>
        </div>
        <Button href="/parent/certificate-archive" variant="outline">
          <FolderArchive className="h-4 w-4" />
          فتح أرشيف الشهادات
        </Button>
      </Card>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {!hasContent ? (
        <Card className="p-6 text-sm text-p-black/60">
          لا يوجد أرشيف بعد. بعد إغلاق فصل دراسي أو أرشفة سنة ستظهر هنا العلامات المحفوظة.
        </Card>
      ) : null}

      {selectedTerm ? (
        <Card className="space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-p-black/50">{selectedTerm.yearName}</p>
              <h2 className="text-lg font-bold text-p-black">{selectedTerm.name}</h2>
            </div>
            <Button variant="outline" onClick={() => setSelectedTerm(null)}>
              <ChevronLeft className="h-4 w-4" />
              رجوع للأرشيف
            </Button>
          </div>
          {loadingGrades ? (
            <p className="text-sm text-neutral-500">جاري تحميل العلامات...</p>
          ) : (
            <GradesTable grades={grades} />
          )}
        </Card>
      ) : (
        <>
          {years.map((year) => (
            <Card key={year.yearId} className="space-y-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-p-black">{year.yearName}</h2>
                {year.isArchived ? <Badge variant="default">مؤرشفة</Badge> : null}
              </div>
              {year.terms.length === 0 ? (
                <p className="text-sm text-p-black/55">لا توجد فصول منتهية في هذه السنة.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {year.terms.map((term) => (
                    <button
                      key={term.termId}
                      type="button"
                      onClick={() => openTerm(term, year.yearName)}
                      className={cn(
                        "rounded-xl border border-neutral-200 px-4 py-3 text-start transition hover:border-p-green/40 hover:bg-p-green/5"
                      )}
                    >
                      <p className="font-semibold text-p-black">{term.termName}</p>
                      <p className="mt-1 text-xs text-p-black/50">
                        {term.hasGrades ? "عرض العلامات" : "لا توجد علامات"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
