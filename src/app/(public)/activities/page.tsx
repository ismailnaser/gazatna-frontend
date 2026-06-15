"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/atoms/Card";
import { PublicPage } from "@/components/molecules/PublicPage";
import { api } from "@/lib/api";

type Activity = { id: string; title: string; desc: string };

export default function ActivitiesPage() {
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getActivities()
      .then((data) => setItems(data as Activity[]))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicPage title="الأنشطة والنوادي" description="معرض لأنشطة الطلاب خارج الصف الدراسي.">
      {loading ? (
        <p className="text-center text-neutral-500">جاري التحميل...</p>
      ) : items.length === 0 ? (
        <p className="text-center text-neutral-500">لا توجد أنشطة معروضة حالياً.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((a) => (
            <Card key={a.id}>
              <h3 className="text-lg font-bold text-p-black">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-p-black/60">{a.desc}</p>
            </Card>
          ))}
        </div>
      )}
    </PublicPage>
  );
}
