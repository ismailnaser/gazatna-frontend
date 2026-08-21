"use client";

import Link from "next/link";
import { Badge } from "@/components/atoms/Badge";
import {
  TABLE_BASE,
  TABLE_TD,
  TABLE_TH,
  TABLE_WRAP,
  TablePagination,
  useClientPagination,
} from "@/components/shared/DataTable";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { TeacherProfile } from "@/types/teacher";
import { ChevronLeft } from "lucide-react";

function memberInitial(name: string) {
  return name.replace(/^(د\.|أ\.|م\.)\s*/u, "").trim().charAt(0) || "ك";
}

type AdminTeachersTableProps = {
  teachers: TeacherProfile[];
  hasActiveFilters: boolean;
};

export function AdminTeachersTable({
  teachers,
  hasActiveFilters,
}: AdminTeachersTableProps) {
  const { page, totalPages, pageItems, pageSize, total, next, prev, setPage } =
    useClientPagination(teachers, 10);

  if (teachers.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-p-black/72">
        {hasActiveFilters ? "لا توجد نتائج مطابقة للبحث أو الفلاتر." : "لا يوجد أعضاء كادر بعد."}
      </p>
    );
  }

  return (
    <div className={TABLE_WRAP}>
      <div className="overflow-x-auto">
        <table className={TABLE_BASE}>
          <thead>
            <tr>
              <th className={TABLE_TH}>الاسم</th>
              <th className={cn(TABLE_TH, "w-40")}>التخصص</th>
              <th className={cn(TABLE_TH, "w-28")}>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((teacher, index) => {
              const imageSrc = resolveMediaUrl(teacher.imageUrl);
              const isActive = teacher.status !== "inactive";
              return (
                <tr key={teacher.id} className={cn(index % 2 === 1 && "bg-neutral-50/70")}>
                  <td className={TABLE_TD}>
                    <Link
                      href={`/admin/teachers/${teacher.id}`}
                      prefetch={false}
                      className="group flex items-center gap-3"
                    >
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-bold text-white",
                          !imageSrc && `bg-gradient-to-br ${teacher.imageGradient}`
                        )}
                      >
                        {imageSrc ? (
                          <img src={imageSrc} alt="" className="h-full w-full object-cover" />
                        ) : (
                          memberInitial(teacher.name)
                        )}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-semibold text-p-black group-hover:text-brand-blue">
                        {teacher.name}
                      </span>
                      <ChevronLeft className="h-4 w-4 shrink-0 text-neutral-300 group-hover:text-brand-blue" />
                    </Link>
                  </td>
                  <td className={TABLE_TD}>
                    <Badge variant="info">{teacher.staffTypeName || "—"}</Badge>
                  </td>
                  <td className={TABLE_TD}>
                    {teacher.isTeacher ? (
                      <Badge variant={isActive ? "success" : "default"}>
                        {isActive ? "نشط" : "غير نشط"}
                      </Badge>
                    ) : (
                      <span className="text-p-black/45">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPrev={prev}
        onNext={next}
        onPage={setPage}
      />
    </div>
  );
}
