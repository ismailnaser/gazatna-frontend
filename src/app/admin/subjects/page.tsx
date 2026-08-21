"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { AdminSubjectsGrid } from "@/components/admin/AdminSubjectsGrid";
import { SearchField } from "@/components/molecules/SearchField";
import { EmptyState } from "@/components/molecules/EmptyState";
import { useSchool } from "@/context/SchoolContext";
import { teacherCountLabel } from "@/lib/adminSubjects";
import { Plus } from "lucide-react";

export default function AdminSubjectsPage() {
  const { subjects, teachers, loading, refresh } = useSchool();
  const [search, setSearch] = useState("");

  const subjectsWithCounts = useMemo(
    () =>
      subjects.map((subject) => ({
        ...subject,
        teacherCount: teachers.filter((teacher) => teacher.subjectIds?.includes(subject.id)).length,
      })),
    [subjects, teachers]
  );

  const filteredSubjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subjectsWithCounts;
    return subjectsWithCounts.filter((subject) => subject.name.toLowerCase().includes(q));
  }, [subjectsWithCounts, search]);

  return (
    <WorkspacePage
      title="المواد الدراسية"
      description="المواد الدراسية وإسناد الفصول والمعلمين."
      actions={
        <Button href="/admin/subjects/create">
          <Plus className="h-4 w-4" />
          إضافة مادة
        </Button>
      }
      loading={loading}
      loadingMessage="جاري تحميل المواد..."
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-p-black/65">
          {subjectsWithCounts.length} مادة · {teacherCountLabel(
            subjectsWithCounts.reduce((sum, s) => sum + s.teacherCount, 0)
          )}
        </p>
        <SearchField value={search} onChange={setSearch} placeholder="بحث باسم المادة..." />
      </div>

      {subjectsWithCounts.length === 0 ? (
        <EmptyState
          title="لا توجد مواد بعد"
          action={
            <Button variant="outline" onClick={() => void refresh()}>
              إعادة تحميل
            </Button>
          }
        />
      ) : (
        <Card>
          <AdminSubjectsGrid subjects={filteredSubjects} hasActiveFilters={Boolean(search.trim())} />
        </Card>
      )}
    </WorkspacePage>
  );
}
