"use client";

import { useEffect, useState } from "react";
import { TeacherCard } from "@/components/molecules/TeacherCard";
import { PublicPage } from "@/components/molecules/PublicPage";
import { api } from "@/lib/api";
import type { TeacherProfile } from "@/types/teacher";

export default function FacultyPage() {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTeachers()
      .then((data) => setTeachers(data as TeacherProfile[]))
      .catch(() => setTeachers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicPage
      title="الكادر التعليمي"
      description="نخبة من المعلمين المتميزين يضعون الطالب في قلب العملية التعليمية."
    >
      {loading ? (
        <p className="text-center text-neutral-500">جاري التحميل...</p>
      ) : teachers.length === 0 ? (
        <p className="text-center text-neutral-500">لا يوجد كادر تعليمي معروض حالياً.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      )}
    </PublicPage>
  );
}
