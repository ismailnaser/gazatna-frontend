"use client";

import Link from "next/link";
import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import { GraduationCap, Users } from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { getTeacherClassesByUserId } = useSchool();
  const classes = user ? getTeacherClassesByUserId(user.id) : [];

  return (
    <div>
      <PageHeader title="فصولي" description="الفصول المسندة إليك من الإدارة" />

      {classes.length === 0 ? (
        <Card className="text-center text-[#1a1a1a]/50">
          لا توجد فصول مسندة إليك حالياً. تواصل مع الإدارة.
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Link key={cls.id} href={`/teacher/classes/${cls.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#064e3b]/10">
                  <GraduationCap className="h-6 w-6 text-[#064e3b]" />
                </div>
                <h3 className="text-lg font-bold text-[#1a1a1a]">{cls.name}</h3>
                <p className="mt-2 flex items-center gap-1 text-sm text-[#1a1a1a]/50">
                  <Users className="h-4 w-4" />
                  {cls.studentCount} طالب
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
