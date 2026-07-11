"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { MultiSelect } from "@/components/atoms/MultiSelect";
import { Select } from "@/components/atoms/Select";
import { AdminTeachersTable } from "@/components/admin/AdminTeachersTable";
import { useAdminStaffTypes } from "@/components/admin/AdminTeacherAddForm";
import { StaffTypeManager } from "@/components/admin/StaffTypeManager";
import { GradeSectionClassMultiSelect } from "@/components/shared/GradeSectionClassMultiSelect";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useSchool } from "@/context/SchoolContext";
import { exportStaffToExcel } from "@/lib/exportStaffExcel";
import { cn } from "@/lib/utils";
import { BookMarked, Download, GraduationCap, Layers, Plus, Search, Users } from "lucide-react";

const statusFilterOptions = [
  { value: "", label: "كل الحالات" },
  { value: "active", label: "نشط" },
  { value: "inactive", label: "غير نشط" },
];

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
  const { teachers, classes, grades, subjects, assignments, updateTeacher } = useSchool();
  const { staffTypes, setStaffTypes } = useAdminStaffTypes();

  const [search, setSearch] = useState("");
  const [staffTypeFilters, setStaffTypeFilters] = useState<string[]>([]);
  const [subjectFilters, setSubjectFilters] = useState<string[]>([]);
  const [classFilters, setClassFilters] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [togglingTeacherId, setTogglingTeacherId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportMessage, setExportMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const hasActiveFilters = Boolean(
    search.trim() ||
      staffTypeFilters.length > 0 ||
      subjectFilters.length > 0 ||
      classFilters.length > 0 ||
      statusFilter
  );

  const stats = useMemo(() => {
    const assignmentCount = Object.values(assignments).reduce((sum, ids) => sum + ids.length, 0);
    const teachersOnly = teachers.filter((member) => member.isTeacher).length;
    return {
      total: teachers.length,
      teachersOnly,
      assignmentCount,
    };
  }, [teachers, assignments]);

  const filteredTeachers = useMemo(
    () =>
      teachers.filter((teacher) => {
        const q = search.trim().toLowerCase();
        if (q) {
          const hay = [
            teacher.name,
            teacher.nameEn,
            teacher.username,
            teacher.subject,
            teacher.staffTypeName,
            teacher.nationalId,
            teacher.mobile,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (staffTypeFilters.length > 0 && !staffTypeFilters.includes(teacher.staffTypeId ?? "")) {
          return false;
        }
        if (subjectFilters.length > 0) {
          const teacherSubjects = teacher.subjectIds ?? [];
          if (!subjectFilters.some((id) => teacherSubjects.includes(id))) return false;
        }
        if (classFilters.length > 0) {
          const teacherClasses = assignments[teacher.id] ?? [];
          if (!classFilters.some((id) => teacherClasses.includes(id))) return false;
        }
        if (statusFilter === "active" && teacher.status === "inactive") return false;
        if (statusFilter === "inactive" && teacher.status !== "inactive") return false;
        return true;
      }),
    [teachers, search, staffTypeFilters, subjectFilters, classFilters, statusFilter, assignments]
  );

  function clearFilters() {
    setSearch("");
    setStaffTypeFilters([]);
    setSubjectFilters([]);
    setClassFilters([]);
    setStatusFilter("");
  }

  async function handleExportExcel() {
    if (filteredTeachers.length === 0 || exportingExcel) return;
    setExportingExcel(true);
    setExportMessage(null);
    try {
      await exportStaffToExcel(filteredTeachers, { assignments, classes });
      setExportMessage({
        type: "success",
        text: `تم تصدير ${filteredTeachers.length} عضو/أعضاء إلى ملف Excel حسب الفلاتر الحالية.`,
      });
    } catch (err) {
      setExportMessage({
        type: "error",
        text: err instanceof Error ? err.message : "تعذّر تصدير ملف Excel",
      });
    } finally {
      setExportingExcel(false);
    }
  }

  async function toggleTeacherStatus(teacher: (typeof teachers)[number]) {
    if (!teacher.isTeacher) return;
    const nextStatus = teacher.status === "inactive" ? "active" : "inactive";
    setTogglingTeacherId(teacher.id);
    setStatusMessage("");
    try {
      await updateTeacher(teacher.id, { status: nextStatus });
      setStatusMessage(
        nextStatus === "active"
          ? `تم تفعيل «${teacher.name}».`
          : `تم تعطيل «${teacher.name}».`
      );
    } catch {
      setStatusMessage("تعذّر تغيير الحالة");
    } finally {
      setTogglingTeacherId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="الكادر"
          description="إدارة كل العاملين في المدرسة: مدير، نائب مدير، معلمين، وغيرهم"
        />
        <Button href="/admin/teachers/new" className="shrink-0">
          <Plus className="h-4 w-4" />
          إضافة عضو كادر
        </Button>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <StatChip icon={Users} label="إجمالي الكادر" value={stats.total} />
        <StatChip icon={GraduationCap} label="المعلمون" value={stats.teachersOnly} tone="success" />
        <StatChip icon={Layers} label="إسنادات الفصول" value={stats.assignmentCount} />
      </div>

      <div className="mb-4">
        <StaffTypeManager types={staffTypes} onChange={setStaffTypes} />
      </div>

      {statusMessage ? (
        <p className="mb-4 rounded-xl border border-p-green/20 bg-p-green/5 px-4 py-3 text-sm text-p-green">
          {statusMessage}
        </p>
      ) : null}

      <Card className="p-4 sm:p-5">
        {exportMessage ? (
          <Alert variant={exportMessage.type === "success" ? "success" : "error"} className="mb-4">
            {exportMessage.text}
          </Alert>
        ) : null}

        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="font-bold text-p-black">قائمة الكادر</h3>
            <p className="mt-1 text-sm text-p-black/55">
              {teachers.length === 0
                ? "لا يوجد أعضاء كادر بعد"
                : `${filteredTeachers.length} من ${teachers.length} عضو`}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
            <Button
              type="button"
              variant="outline"
              className="gap-1.5 px-3 py-2 text-xs sm:shrink-0"
              onClick={() => void handleExportExcel()}
              disabled={exportingExcel || filteredTeachers.length === 0}
            >
              <Download className="h-3.5 w-3.5" />
              {exportingExcel ? "جاري التصدير..." : `تصدير Excel (${filteredTeachers.length})`}
            </Button>
            <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-p-black/35" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم، الهوية، الجوال..."
              className="w-full rounded-xl border border-neutral-200 py-2.5 pe-3 ps-9 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />
            </div>
          </div>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MultiSelect
            label="فلترة حسب التخصص"
            options={staffTypes.map((type) => ({ value: type.id, label: type.name }))}
            value={staffTypeFilters}
            onChange={setStaffTypeFilters}
            placeholder="كل الأنواع"
            countLabel="أنواع"
          />
          <MultiSelect
            label="فلترة حسب المادة"
            options={subjects.map((subject) => ({ value: subject.id, label: subject.name }))}
            value={subjectFilters}
            onChange={setSubjectFilters}
            placeholder="كل المواد"
            countLabel="مواد"
          />
          <GradeSectionClassMultiSelect
            label="فلترة حسب الفصل"
            classes={classes}
            grades={grades}
            value={classFilters}
            onChange={setClassFilters}
            placeholder="كل الفصول"
          />
          <Select
            label="الحالة"
            name="statusFilter"
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
          togglingId={togglingTeacherId}
          onEdit={(id) => router.push(`/admin/teachers/${id}`)}
          onToggleStatus={toggleTeacherStatus}
        />
      </Card>
    </div>
  );
}
