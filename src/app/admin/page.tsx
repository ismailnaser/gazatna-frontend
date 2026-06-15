"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SimpleBarChart } from "@/components/molecules/SimpleBarChart";
import { api } from "@/lib/api";
import type { AdminAnalytics } from "@/types/news";
import { emptyAdminAnalytics } from "@/types/news";
import { AlertTriangle, BarChart3, CreditCard } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState<AdminAnalytics>(emptyAdminAnalytics);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminAnalytics()
      .then((res) => setData(res as AdminAnalytics))
      .catch(() => setData(emptyAdminAnalytics))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-neutral-500">جاري التحميل...</p>;
  }

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
            <p className="text-3xl font-bold text-p-black">{data.avgGrade}%</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-p-green/10">
            <CreditCard className="h-6 w-6 text-p-green" />
          </span>
          <div>
            <p className="text-sm text-p-black/50">نسبة الرسوم المحصلة</p>
            <p className="text-3xl font-bold text-p-black">{data.feesCollected}%</p>
          </div>
        </Card>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-bold text-p-black">معدل الدرجات حسب الصف</h3>
          {data.gradeChart.length > 0 ? (
            <SimpleBarChart data={data.gradeChart} color="bg-p-green" />
          ) : (
            <p className="text-sm text-neutral-500">لا توجد بيانات بعد.</p>
          )}
        </Card>
        <Card>
          <h3 className="mb-4 font-bold text-p-black">تحصيل الرسوم الشهري</h3>
          {data.feesChart.length > 0 ? (
            <SimpleBarChart data={data.feesChart} color="bg-p-red" />
          ) : (
            <p className="text-sm text-neutral-500">لا توجد بيانات بعد.</p>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 flex items-center gap-2 font-bold text-p-black">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          مهام عاجلة
        </h3>
        {data.urgentTasks.length > 0 ? (
          <ul className="space-y-2">
            {data.urgentTasks.map((task) => (
              <li
                key={task.id}
                className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800"
              >
                {task.text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500">لا توجد مهام عاجلة.</p>
        )}
      </Card>
    </div>
  );
}
