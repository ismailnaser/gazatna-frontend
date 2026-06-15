"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Card } from "@/components/atoms/Card";
import {
  ClassDetailTabs,
  type ClassTab,
} from "@/components/teacher/ClassDetailTabs";
import { GradebookPanel } from "@/components/teacher/GradebookPanel";
import { HomeworkPanel } from "@/components/teacher/HomeworkPanel";
import { QuizPanel } from "@/components/teacher/QuizPanel";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useAssignments } from "@/context/AssignmentsContext";
import { useAuth } from "@/context/AuthContext";
import { useSchool } from "@/context/SchoolContext";
import { ArrowRight } from "lucide-react";

const tabDescriptions: Record<ClassTab, string> = {
  grades: "دفتر العلامات — إدخال وتعديل درجات الطلاب",
  homework: "إنشاء وإدارة الواجبات المنزلية للطلاب",
  quizzes: "إنشاء وإدارة الاختبارات القصيرة والكويزات",
};

export function ClassDetailClient({
  classId,
  activeTab,
}: {
  classId: string;
  activeTab: ClassTab;
}) {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();
  const { getTeacherClassesByUserId, currentTeacher, loading } = useSchool();
  const { getHomeworkByClass, getQuizzesByClass } = useAssignments();

  const assignedClasses = user ? getTeacherClassesByUserId(user.id) : [];
  const classInfo = assignedClasses.find((c) => c.id === classId);
  const teacher = currentTeacher;

  const counts = useMemo(
    () => ({
      homework: getHomeworkByClass(classId).length,
      quizzes: getQuizzesByClass(classId).length,
    }),
    [classId, getHomeworkByClass, getQuizzesByClass]
  );

  function setTab(tab: ClassTab) {
    const next = tab === "grades" ? "" : `?tab=${tab}`;
    router.replace(`/teacher/classes/${classId}${next}`, { scroll: false });
  }

  if (authLoading || loading) {
    return (
      <Card className="text-center">
        <p className="text-neutral-500">جاري التحميل...</p>
      </Card>
    );
  }

  if (!classInfo || !teacher) {
    return (
      <Card className="text-center">
        <p className="mb-4 text-neutral-600">
          {!teacher
            ? "لم يتم ربط حسابك بملف معلم. تواصل مع الإدارة."
            : "هذا الفصل غير مسند إليك أو غير موجود."}
        </p>
        <Link
          href="/teacher"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى فصولي
        </Link>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader title={classInfo.name} description={tabDescriptions[activeTab]} />

      <ClassDetailTabs active={activeTab} onChange={setTab} counts={counts} />

      {activeTab === "grades" && <GradebookPanel classId={classId} />}
      {activeTab === "homework" && (
        <HomeworkPanel classId={classId} teacherId={teacher.id} />
      )}
      {activeTab === "quizzes" && (
        <QuizPanel classId={classId} teacherId={teacher.id} />
      )}
    </div>
  );
}
