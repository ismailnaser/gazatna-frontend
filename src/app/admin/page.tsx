"use client";

import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SimpleBarChart } from "@/components/molecules/SimpleBarChart";
import { adminAnalytics } from "@/data/mock";
import { AlertTriangle, BarChart3, CreditCard } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div>
      <PageHeader title="لوحة التحليلات" description="نظرة عامة على الأداء والمالية" />

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-p-green/10">
            <BarChart3 className="h-6 w-6 text-p-green" />
          </span>
          <div>
            <p className="text-sm text-p-black/50">معدل درجات المدرسة</p>
            <p className="text-3xl font-bold text-p-black">{adminAnalytics.avgGrade}%</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-p-green/10">
            <CreditCard className="h-6 w-6 text-p-green" />
          </span>
          <div>
            <p className="text-sm text-p-black/50">نسبة الرسوم المحصلة</p>
            <p className="text-3xl font-bold text-p-black">{adminAnalytics.feesCollected}%</p>
          </div>
        </Card>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-bold text-p-black">معدل الدرجات حسب الصف</h3>
          <SimpleBarChart data={adminAnalytics.gradeChart} color="bg-p-green" />
        </Card>
        <Card>
          <h3 className="mb-4 font-bold text-p-black">تحصيل الرسوم الشهري</h3>
          <SimpleBarChart data={adminAnalytics.feesChart} color="bg-p-red" />
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 flex items-center gap-2 font-bold text-p-black">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          مهام عاجلة
        </h3>
        <ul className="space-y-2">
          {adminAnalytics.urgentTasks.map((task) => (
            <li
              key={task.id}
              className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              {task.text}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
