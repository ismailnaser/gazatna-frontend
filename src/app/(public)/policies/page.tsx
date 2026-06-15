"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/atoms/Card";
import { PublicPage } from "@/components/molecules/PublicPage";
import { api } from "@/lib/api";

type Policy = { id: string; title: string; text: string };

export default function PoliciesPage() {
  const [items, setItems] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPolicies()
      .then((data) => setItems(data as Policy[]))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicPage title="السياسات" description="السياسات واللوائح المعتمدة في المدرسة.">
      {loading ? (
        <p className="text-center text-neutral-500">جاري التحميل...</p>
      ) : items.length === 0 ? (
        <p className="text-center text-neutral-500">لا توجد سياسات معروضة حالياً.</p>
      ) : (
        <div className="space-y-4">
          {items.map((p) => (
            <Card key={p.id}>
              <h3 className="text-lg font-bold text-p-black">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-p-black/60">{p.text}</p>
            </Card>
          ))}
        </div>
      )}
    </PublicPage>
  );
}
