"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/atoms/Card";
import { ExpandableText } from "@/components/molecules/ExpandableText";
import { PublicPage } from "@/components/molecules/PublicPage";
import { api } from "@/lib/api";

type Accreditation = { id: string; name: string; desc: string };

export default function AccreditationsPage() {
  const [items, setItems] = useState<Accreditation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAccreditations()
      .then((data) => setItems(data as Accreditation[]))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicPage title="الاعتمادات" description="شهادات واعتمادات المدرسة الرسمية.">
      {loading ? (
        <p className="text-center text-neutral-500">جاري التحميل...</p>
      ) : items.length === 0 ? (
        <p className="text-center text-neutral-500">لا توجد اعتمادات معروضة حالياً.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <Card key={a.id} className="text-center">
              <h3 className="text-lg font-bold text-p-black">{a.name}</h3>
              <ExpandableText maxLines={3} className="mt-2 text-sm text-p-black/60">
                {a.desc}
              </ExpandableText>
            </Card>
          ))}
        </div>
      )}
    </PublicPage>
  );
}
