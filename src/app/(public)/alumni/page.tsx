import { Card } from "@/components/atoms/Card";
import { PublicPage } from "@/components/molecules/PublicPage";
import { alumni } from "@/data/public";
import { Award } from "lucide-react";

export default function AlumniPage() {
  return (
    <PublicPage title="الخريجون" description="قصص نجاح خريجينا وإنجازاتهم.">
      <div className="space-y-4">
        {alumni.map((a) => (
          <Card key={a.id} className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-50">
              <Award className="h-5 w-5 text-amber-500" />
            </span>
            <div>
              <h3 className="font-bold text-p-black">{a.name}</h3>
              <p className="text-sm text-p-black/50">دفعة {a.year}</p>
              <p className="mt-1 text-sm text-p-black/60">{a.achievement}</p>
            </div>
          </Card>
        ))}
      </div>
    </PublicPage>
  );
}
