"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/atoms/Card";
import { PublicPage } from "@/components/molecules/PublicPage";
import { api } from "@/lib/api";

type Alumni = { id: string; name: string; year: string; achievement: string };

export default function AlumniPage() {
  const [items, setItems] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAlumni()
      .then((data) => setItems(data as Alumni[]))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicPage title="الخريجون" description="قصص نجاح خريجي مدرسة غَزتنا.">
      {loading ? (
        <p className="text-center text-neutral-500">جاري التحميل...</p>
      ) : items.length === 0 ? (
        <p className="text-center text-neutral-500">لا يوجد خريجون معروضون حالياً.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((a) => (
            <Card key={a.id}>
              <p className="text-xs font-semibold text-p-green">{a.year}</p>
              <h3 className="mt-1 text-lg font-bold text-p-black">{a.name}</h3>
              <p className="mt-2 text-sm text-p-black/60">{a.achievement}</p>
            </Card>
          ))}
        </div>
      )}
    </PublicPage>
  );
}
