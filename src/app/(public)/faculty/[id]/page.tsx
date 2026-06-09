"use client";

import { useParams } from "next/navigation";
import { TeacherCV } from "@/components/organisms/TeacherCV";
import { useSchool } from "@/context/SchoolContext";
import Link from "next/link";

export default function TeacherCVPage() {
  const params = useParams();
  const id = params.id as string;
  const { teachers, getTeacherClasses } = useSchool();

  const teacher = teachers.find((t) => t.id === id);

  if (!teacher) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-[#1a1a1a]/50">المعلم غير موجود.</p>
        <Link href="/faculty" className="mt-4 inline-block text-[#064e3b] hover:underline">
          العودة للكادر التعليمي
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white px-4 py-12 sm:px-6 sm:py-16">
      <TeacherCV teacher={teacher} classes={getTeacherClasses(teacher.id)} />
    </div>
  );
}
