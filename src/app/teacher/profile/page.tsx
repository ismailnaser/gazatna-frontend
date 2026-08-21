"use client";

import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import { TeacherCV } from "@/components/organisms/TeacherCV";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";

export default function TeacherProfilePage() {
  const { user } = useAuth();
  const { getTeacherClassesByUserId, currentTeacher, loading } = useSchool();
  const teacher = currentTeacher;

  if (!teacher && !loading) {
    return (
      <p className="text-[#1a1a1a]/50">
        لم يتم ربط حسابك بملف في الكادر التعليمي. تواصل مع الإدارة.
      </p>
    );
  }

  return (
    <WorkspacePage
      title="سيرتي الذاتية"
      description="البيانات الظاهرة في صفحة الكادر التعليمي."
      breadcrumbs={[
        { label: "فصولي", href: "/teacher" },
        { label: "سيرتي الذاتية" },
      ]}
      loading={loading}
    >
      {teacher ? (
        <TeacherCV
          teacher={teacher}
          classes={getTeacherClassesByUserId(user!.id)}
          backHref="/teacher"
          backLabel="العودة لفصولي"
        />
      ) : null}
    </WorkspacePage>
  );
}
