import { Card } from "@/components/atoms/Card";
import { PublicPage } from "@/components/molecules/PublicPage";
import { activities } from "@/data/public";

export default function ActivitiesPage() {
  return (
    <PublicPage title="الأنشطة والنوادي" description="معرض لأنشطة الطلاب خارج الصف الدراسي.">
      <div className="grid gap-6 md:grid-cols-3">
        {activities.map((a) => (
          <Card key={a.id}>
            <h3 className="text-lg font-bold text-p-black">{a.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-p-black/60">{a.desc}</p>
          </Card>
        ))}
      </div>
    </PublicPage>
  );
}
