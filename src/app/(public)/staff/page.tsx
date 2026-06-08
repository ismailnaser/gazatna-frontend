import { Card } from "@/components/atoms/Card";
import { PublicPage } from "@/components/molecules/PublicPage";
import { staff } from "@/data/public";
import { User } from "lucide-react";

export default function StaffPage() {
  return (
    <PublicPage title="طاقم التدريس" description="معلمون متميزون يضعون الطالب في قلب العملية التعليمية.">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {staff.map((t) => (
          <Card key={t.id} className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-p-green/10">
              <User className="h-8 w-8 text-p-green" />
            </div>
            <h3 className="font-bold text-p-black">{t.name}</h3>
            <p className="mt-1 text-sm text-p-green">{t.subject}</p>
            <p className="mt-2 text-xs text-p-black/50">خبرة: {t.years}</p>
          </Card>
        ))}
      </div>
    </PublicPage>
  );
}
