import Link from "next/link";
import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { mockTeacherClasses } from "@/data/mock";
import { GraduationCap, Users } from "lucide-react";

export default function TeacherDashboard() {
  return (
    <div>
      <PageHeader title="فصولي" description="الفصول الموكلة إليك" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockTeacherClasses.map((cls) => (
          <Link key={cls.id} href={`/teacher/classes/${cls.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-p-green/10">
                <GraduationCap className="h-6 w-6 text-p-green" />
              </div>
              <h3 className="text-lg font-bold text-p-black">{cls.name}</h3>
              <p className="mt-2 flex items-center gap-1 text-sm text-p-black/50">
                <Users className="h-4 w-4" />
                {cls.studentCount} طالب
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
