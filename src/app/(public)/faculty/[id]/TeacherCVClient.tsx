"use client";

import Link from "next/link";
import { TeacherCV } from "@/components/organisms/TeacherCV";
import { useSchool } from "@/context/SchoolContext";

export function TeacherCVClient({ id }: { id: string }) {
  const { teachers, getTeacherClasses } = useSchool();

  const teacher = teachers.find((t) => t.id === id);

  if (!teacher) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-[#1a1a1a]/50">المعلم غير موجود.</p>
        <Link href="/faculty" className="mt-4 inline-block text-[var(--brand-teal)] hover:underline">
          العودة للكادر التعليمي
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white px-4 pb-12 pt-[var(--nav-height)] sm:px-6 sm:pb-16">
      <TeacherCV teacher={teacher} classes={getTeacherClasses(teacher.id)} />
    </div>
  );
}
