"use client";

import { TeacherCard } from "@/components/molecules/TeacherCard";
import { PublicPage } from "@/components/molecules/PublicPage";
import { useSchool } from "@/context/SchoolContext";

export default function FacultyPage() {
  const { teachers } = useSchool();

  return (
    <PublicPage
      title="الكادر التعليمي"
      description="نخبة من المعلمين المتميزين يضعون الطالب في قلب العملية التعليمية."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {teachers.map((teacher) => (
          <TeacherCard key={teacher.id} teacher={teacher} />
        ))}
      </div>
    </PublicPage>
  );
}
