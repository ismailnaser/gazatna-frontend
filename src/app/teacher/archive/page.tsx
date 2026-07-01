"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

type ArchiveTerm = {
  termId: string;
  termName: string;
  sortOrder: number;
  classCount: number;
};

type ArchiveYear = {
  yearId: string;
  yearName: string;
  isArchived: boolean;
  terms: ArchiveTerm[];
};

type ArchiveClass = {
  classId: string;
  name: string;
  gradeLevel: string;
  section: string;
};

type ArchiveStudentRow = {
  studentId: string;
  name: string;
  studentNumber: string;
  subjects: Record<
    string,
    {
      score: number | null;
      maxScore: number;
      passed: boolean | null;
    }
  >;
};

export default function TeacherArchivePage() {
  const [years, setYears] = useState<ArchiveYear[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<{ id: string; name: string; yearName: string } | null>(
    null
  );
  const [classes, setClasses] = useState<ArchiveClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<ArchiveClass | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [students, setStudents] = useState<ArchiveStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  const hasContent = useMemo(() => years.some((year) => year.terms.length > 0), [years]);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const overview = await api.getTeacherArchive();
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
    setSelectedClass(null);
    setSubjects([]);
    setStudents([]);
    setLoadingDetail(true);
    setError("");
    try {
      const rows = await api.getTeacherArchiveTermClasses(term.termId);
      setClasses(rows as ArchiveClass[]);
    } catch {
      setClasses([]);
      setError("تعذر تحميل فصول هذا الفصل الدراسي");
    } finally {
      setLoadingDetail(false);
    }
  }

  async function openClass(archiveClass: ArchiveClass) {
    if (!selectedTerm) return;
    setSelectedClass(archiveClass);
    setLoadingDetail(true);
    setError("");
    try {
      const payload = await api.getTeacherArchiveClassGrades(selectedTerm.id, archiveClass.classId);
      setSubjects(payload.subjects ?? []);
      setStudents((payload.students as ArchiveStudentRow[]) ?? []);
    } catch {
      setSubjects([]);
      setStudents([]);
      setError("تعذر تحميل علامات الطلاب");
    } finally {
      setLoadingDetail(false);
    }
  }

  function resetToYears() {
    setSelectedTerm(null);
    setSelectedClass(null);
    setClasses([]);
    setSubjects([]);
    setStudents([]);
  }

  function resetToTerm() {
    setSelectedClass(null);
    setSubjects([]);
    setStudents([]);
  }

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="أرشيف السنوات السابقة"
        description="عرض علامات الطلاب في الفصول المنتهية — للقراءة فقط"
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      {!hasContent ? (
        <Card className="p-6 text-sm text-p-black/60">
          لا يوجد أرشيف بعد. بعد إغلاق فصل دراسي ستظهر هنا علامات الطلاب التي أدخلتها في الفصول
          السابقة.
        </Card>
      ) : null}

      {selectedClass && selectedTerm ? (
        <Card className="space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-p-black/50">
                {selectedTerm.yearName} — {selectedTerm.name}
              </p>
              <h2 className="text-lg font-bold text-p-black">{selectedClass.name}</h2>
            </div>
            <Button variant="outline" onClick={resetToTerm}>
              <ChevronLeft className="h-4 w-4" />
              رجوع للفصول
            </Button>
          </div>

          {loadingDetail ? (
            <p className="text-sm text-neutral-500">جاري تحميل العلامات...</p>
          ) : students.length === 0 ? (
            <p className="text-sm text-p-black/55">لا توجد علامات محفوظة لهذا الفصل.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-p-cream/60 text-p-black/60">
                    <th className="px-3 py-2 text-start font-semibold">الطالب</th>
                    {subjects.map((subject) => (
                      <th key={subject} className="px-3 py-2 text-center font-semibold">
                        {subject}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.studentId} className="border-b border-neutral-50">
                      <td className="px-3 py-2.5">
                        <p className="font-medium text-p-black">{student.name}</p>
                        <p className="text-xs text-p-black/45">{student.studentNumber || "—"}</p>
                      </td>
                      {subjects.map((subject) => {
                        const cell = student.subjects[subject];
                        return (
                          <td key={subject} className="px-3 py-2.5 text-center text-p-black">
                            {cell?.score == null ? "—" : `${cell.score}/${cell.maxScore}`}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : selectedTerm ? (
        <Card className="space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-p-black/50">{selectedTerm.yearName}</p>
              <h2 className="text-lg font-bold text-p-black">{selectedTerm.name}</h2>
            </div>
            <Button variant="outline" onClick={resetToYears}>
              <ChevronLeft className="h-4 w-4" />
              رجوع للأرشيف
            </Button>
          </div>

          {loadingDetail ? (
            <p className="text-sm text-neutral-500">جاري التحميل...</p>
          ) : classes.length === 0 ? (
            <p className="text-sm text-p-black/55">لا توجد فصول مرتبطة بهذا الفصل.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {classes.map((archiveClass) => (
                <button
                  key={archiveClass.classId}
                  type="button"
                  onClick={() => openClass(archiveClass)}
                  className={cn(
                    "rounded-xl border border-neutral-200 px-4 py-3 text-start transition hover:border-p-green/40 hover:bg-p-green/5"
                  )}
                >
                  <p className="font-semibold text-p-black">{archiveClass.name}</p>
                  <p className="mt-1 text-xs text-p-black/50">
                    {archiveClass.gradeLevel}
                    {archiveClass.section ? ` — ${archiveClass.section}` : ""}
                  </p>
                </button>
              ))}
            </div>
          )}
        </Card>
      ) : (
        years.map((year) => (
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
                    <p className="mt-1 text-xs text-p-black/50">{term.classCount} فصل/شعبة</p>
                  </button>
                ))}
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
