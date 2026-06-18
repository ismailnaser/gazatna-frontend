"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { MultiSelect } from "@/components/atoms/MultiSelect";
import { AdminTeachersTable } from "@/components/admin/AdminTeachersTable";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useSchool } from "@/context/SchoolContext";
import { cn } from "@/lib/utils";
import { BookMarked, GraduationCap, Layers, Plus, Search } from "lucide-react";

function StatChip({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof GraduationCap;
  label: string;
  value: string | number;
  tone?: "default" | "success";
}) {
  const tones = {
    default: "bg-brand-blue/10 text-brand-blue",
    success: "bg-p-green/10 text-p-green",
  };

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-neutral-100 bg-white px-3 py-2.5 shadow-sm">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          tones[tone]
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-p-black/45">{label}</p>
        <p className="truncate text-sm font-bold text-p-black">{value}</p>
      </div>
    </div>
  );
}

export default function AdminTeachersPage() {
  const router = useRouter();
  const { teachers, classes, subjects, assignments } = useSchool();

  const [search, setSearch] = useState("");
  const [subjectFilters, setSubjectFilters] = useState<string[]>([]);
  const [classFilters, setClassFilters] = useState<string[]>([]);

  const hasActiveFilters = Boolean(
    search.trim() || subjectFilters.length > 0 || classFilters.length > 0
  );

  const stats = useMemo(() => {
    const assignmentCount = Object.values(assignments).reduce((sum, ids) => sum + ids.length, 0);
    const withSubjects = teachers.filter((teacher) => (teacher.subjectIds ?? []).length > 0).length;
    return {
      total: teachers.length,
      withSubjects,
      assignmentCount,
    };
  }, [teachers, assignments]);

  const filteredTeachers = useMemo(
    () =>
      teachers.filter((teacher) => {
        const q = search.trim().toLowerCase();
        if (q) {
          const hay = [teacher.name, teacher.username, teacher.subject]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (subjectFilters.length > 0) {
          const teacherSubjects = teacher.subjectIds ?? [];
          if (!subjectFilters.some((id) => teacherSubjects.includes(id))) return false;
        }
        if (classFilters.length > 0) {
          const teacherClasses = assignments[teacher.id] ?? [];
          if (!classFilters.some((id) => teacherClasses.includes(id))) return false;
        }
        return true;
      }),
    [teachers, search, subjectFilters, classFilters, assignments]
  );

  function clearFilters() {
    setSearch("");
    setSubjectFilters([]);
    setClassFilters([]);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="الكادر التعليمي"
          description="إدارة المعلمين وإسناد المواد والفصول لهم"
        />
        <Button href="/admin/teachers/new" className="shrink-0">
          <Plus className="h-4 w-4" />
          إضافة معلم
        </Button>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <StatChip icon={GraduationCap} label="عدد المعلمين" value={stats.total} />
        <StatChip icon={BookMarked} label="لديهم مواد مسندة" value={stats.withSubjects} tone="success" />
        <StatChip icon={Layers} label="إسنادات الفصول" value={stats.assignmentCount} />
      </div>

      <Card className="p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="font-bold text-p-black">قائمة الكادر</h3>
            <p className="mt-1 text-sm text-p-black/55">
              {teachers.length === 0
                ? "لا يوجد معلمون بعد"
                : `${filteredTeachers.length} من ${teachers.length} معلم`}
            </p>
          </div>
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-p-black/35" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو اسم المستخدم..."
              className="w-full rounded-xl border border-neutral-200 py-2.5 pe-3 ps-9 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <MultiSelect
            label="فلترة حسب المادة"
            options={subjects.map((subject) => ({ value: subject.id, label: subject.name }))}
            value={subjectFilters}
            onChange={setSubjectFilters}
            placeholder="كل المواد"
            countLabel="مواد"
          />
          <MultiSelect
            label="فلترة حسب الفصل"
            options={classes.map((schoolClass) => ({ value: schoolClass.id, label: schoolClass.name }))}
            value={classFilters}
            onChange={setClassFilters}
            placeholder="كل الفصول"
          />
        </div>

        {hasActiveFilters && (
          <div className="mb-4 flex justify-end">
            <Button type="button" variant="outline" className="px-3 py-1.5 text-xs" onClick={clearFilters}>
              إزالة الفلاتر
            </Button>
          </div>
        )}

        <AdminTeachersTable
          teachers={filteredTeachers}
          assignments={assignments}
          classes={classes}
          hasActiveFilters={hasActiveFilters}
          onEdit={(id) => router.push(`/admin/teachers/${id}`)}
        />
      </Card>
    </div>
  );
}
