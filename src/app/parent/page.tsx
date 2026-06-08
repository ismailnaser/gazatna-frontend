"use client";

import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { mockStudent, parentAlerts } from "@/data/mock";
import { Bell, CreditCard, GraduationCap, Hash, Users } from "lucide-react";

export default function ParentDashboard() {
  const student = mockStudent;

  return (
    <div>
      <PageHeader title="الرئيسية" description="ملخص حالة الطالب والتنبيهات السريعة" />

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

      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-p-black">
        <Bell className="h-5 w-5 text-amber-500" />
        تنبيهات سريعة
      </h2>
      <div className="space-y-3">
        {parentAlerts.map((alert) => (
          <Card key={alert.id} className="flex items-center gap-3 py-4">
            {alert.type === "payment" && <CreditCard className="h-5 w-5 text-p-green" />}
            {alert.type === "note" && <Bell className="h-5 w-5 text-p-green" />}
            {alert.type === "grade" && <GraduationCap className="h-5 w-5 text-amber-500" />}
            <p className="text-sm text-p-black/80">{alert.text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
