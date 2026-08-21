"use client";

import { HubCard, HubGrid } from "@/components/dashboard/HubCard";
import { WorkspacePage } from "@/components/dashboard/WorkspacePage";
import {
  isParentFeeRestricted,
  ParentAccessBlockedCard,
  ParentNoStudentCard,
  type ParentStudentResponse,
} from "@/components/parent/ParentAccessCards";
import { StudentHero } from "@/components/parent/StudentHero";
import { AcademicPeriodBanner } from "@/components/shared/AcademicPeriodBanner";
import { useParentStudent } from "@/hooks/useParentStudent";
import type { Student } from "@/types";
import {
  Archive,
  Bell,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  CreditCard,
  FolderArchive,
  Medal,
  PenLine,
} from "lucide-react";

export default function ParentDashboard() {
  const { student, loading } = useParentStudent();
  const access = student as (Student & ParentStudentResponse) | null;

  if (!student && !loading) {
    return <ParentNoStudentCard />;
  }

  if (student && isParentFeeRestricted(access)) {
    return (
      <ParentAccessBlockedCard
        message={
          access?.accessRestrictionMessage ||
          "تم إيقاف الوصول إلى حساب الطالب بسبب الرسوم المستحقة. يرجى مراجعة صفحة المالية."
        }
        studentName={student.name}
      />
    );
  }

  return (
    <WorkspacePage
      title="مغامرتي"
      description="تعلم، تابع موادك، واجمع إنجازاتك كل يوم."
      loading={loading}
    >
      <AcademicPeriodBanner />

      {student ? (
        <StudentHero
          name={student.name}
          grade={student.grade}
          section={student.section}
          studentNumber={student.studentNumber}
        />
      ) : null}

      <HubGrid>
        <HubCard
          href="/parent/alerts"
          icon={Bell}
          title="إشعارات"
          description="تنبيهات المحتوى والعلامات."
        />
        <HubCard
          href="/parent/subjects"
          icon={BookMarked}
          title="موادي"
          description="موادك الملونة ومعلموك."
        />
        <HubCard
          href="/parent/homework"
          icon={PenLine}
          title="مهام المغامرة"
          description="واجبات، اختبارات، وكنوز المرفقات."
        />
        <HubCard
          href="/parent/assessments"
          icon={BookOpenCheck}
          title="التقييمات"
          description="شوف كم نجمة جمعت بالواجبات والاختبارات."
        />
        <HubCard
          href="/parent/grades"
          icon={BookOpen}
          title="العلامات"
          description="كشف العلامات — كل علامة إنجاز."
          tone="success"
        />
        <HubCard
          href="/parent/schedules"
          icon={CalendarDays}
          title="جدول يومي"
          description="الحصص والاختبارات على شكل رحلة."
        />
        <HubCard
          href="/parent/certificates"
          icon={Medal}
          title="أوسمتي"
          description="شهادات الفصل الحالي."
        />
        <HubCard
          href="/parent/certificate-archive"
          icon={FolderArchive}
          title="صندوق الأوسمة"
          description="شهادات السنوات السابقة."
        />
        <HubCard
          href="/parent/archive"
          icon={Archive}
          title="ذكريات السنوات"
          description="علامات الفصول المنتهية."
        />
        <HubCard
          href="/parent/fees"
          icon={CreditCard}
          title="المالية"
          description="الرصيد والأقساط لولي الأمر."
        />
      </HubGrid>
    </WorkspacePage>
  );
}
