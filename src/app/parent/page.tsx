"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Homework, ParentChild, Quiz, Student } from "@/types";
import {
  Bell,
  BookOpen,
  ClipboardList,
  CreditCard,
  GraduationCap,
  Hash,
  Users,
} from "lucide-react";

export default function ParentDashboard() {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [child, setChild] = useState<ParentChild | undefined>();
  const [pendingHomework, setPendingHomework] = useState(0);
  const [openQuizzes, setOpenQuizzes] = useState(0);
  const [loading, setLoading] = useState(true);

  const [alerts, setAlerts] = useState<Array<{ id: string; text: string; type: string }>>([]);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      api.getParentStudent().then((s) => setStudent(s as Student)).catch(() => setStudent(null)),
      api.getParentChild()
        .then(async (c) => {
          const childData = c as ParentChild;
          setChild(childData);
          const [homework, quizzes, submissions] = await Promise.all([
            api.getParentHomework(),
            api.getParentQuizzes(),
            api.getParentSubmissions(),
          ]);
          const hwList = homework as Homework[];
          const qzList = quizzes as Quiz[];
          const subs = submissions as {
            homework: { homeworkId: string }[];
            quizzes: { quizId: string }[];
          };
          const submittedHw = new Set(subs.homework.map((s) => s.homeworkId));
          const submittedQz = new Set(subs.quizzes.map((s) => s.quizId));
          setPendingHomework(
            hwList.filter((h) => h.status === "active" && !submittedHw.has(h.id)).length
          );
          setOpenQuizzes(
            qzList.filter((q) => q.status === "active" && !submittedQz.has(q.id)).length
          );
        })
        .catch(() => {}),
      api.getParentAlerts()
        .then((data) => setAlerts(data as Array<{ id: string; text: string; type: string }>))
        .catch(() => setAlerts([])),
    ]).finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

  if (!student) {
    return (
      <Card className="text-center text-neutral-500">
        لا يوجد طالب مرتبط بحسابك. تواصل مع الإدارة.
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title="الرئيسية"
        description="متابعة ابنك/ابنتك — واجبات، اختبارات، ونتائج"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: GraduationCap, label: "اسم الطالب", value: student.name },
          { icon: Users, label: "الصف", value: student.grade },
          { icon: Hash, label: "الشعبة", value: student.section },
          { icon: Hash, label: "رقم الطالب", value: student.studentNumber },
        ].map((item) => (
          <Card key={item.label} className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-p-green/10">
              <item.icon className="h-5 w-5 text-p-green" />
            </span>
            <div>
              <p className="text-xs text-p-black/50">{item.label}</p>
              <p className="font-semibold text-p-black">{item.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Link href="/parent/homework">
          <Card className="transition-shadow hover:shadow-md">
            <BookOpen className="mb-2 h-7 w-7 text-brand-orange" />
            <h3 className="font-bold text-neutral-950">الواجبات</h3>
            <p className="mt-1 text-sm text-neutral-600">
              {pendingHomework > 0 ? `${pendingHomework} واجب بانتظار التسليم` : "لا واجبات معلّقة"}
            </p>
          </Card>
        </Link>
        <Link href="/parent/quizzes">
          <Card className="transition-shadow hover:shadow-md">
            <ClipboardList className="mb-2 h-7 w-7 text-brand-blue" />
            <h3 className="font-bold text-neutral-950">الاختبارات</h3>
            <p className="mt-1 text-sm text-neutral-600">
              {openQuizzes > 0 ? `${openQuizzes} اختبار متاح` : "لا اختبارات متاحة حالياً"}
            </p>
          </Card>
        </Link>
      </div>

      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-p-black">
        <Bell className="h-5 w-5 text-amber-500" />
        تنبيهات سريعة
      </h2>
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <Card className="text-center text-neutral-500">لا توجد تنبيهات.</Card>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className="flex items-center gap-3 py-4">
              {alert.type === "payment" && <CreditCard className="h-5 w-5 text-p-green" />}
              {(alert.type === "note" || alert.type === "homework") && <Bell className="h-5 w-5 text-p-green" />}
              {alert.type === "grade" && <GraduationCap className="h-5 w-5 text-amber-500" />}
              <p className="text-sm text-p-black/80">{alert.text}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
