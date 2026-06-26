"use client";

import { TeacherCV } from "@/components/organisms/TeacherCV";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";

export default function TeacherProfilePage() {
  const { user } = useAuth();
  const { getTeacherClassesByUserId, currentTeacher, loading } = useSchool();

  const teacher = currentTeacher;

  if (loading) {
    return (
      <p className="text-[#1a1a1a]/50">جاري التحميل...</p>
    );
  }

  if (!teacher) {
    return (
      <p className="text-[#1a1a1a]/50">
        لم يتم ربط حسابك بملف في الكادر التعليمي. تواصل مع الإدارة.
      </p>
    );
  }

  return (
    <TeacherCV
      teacher={teacher}
      classes={getTeacherClassesByUserId(user!.id)}
      backHref="/teacher"
      backLabel="العودة لفصولي"
    />
  );
}
