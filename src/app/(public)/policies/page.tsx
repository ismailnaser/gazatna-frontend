import { Card } from "@/components/atoms/Card";
import { PublicPage } from "@/components/molecules/PublicPage";
import { policies } from "@/data/public";

export default function PoliciesPage() {
  return (
    <PublicPage title="سياسات المدرسة" description="قواعد منظمة للحضور والسلوك والتقييم.">
      <div className="space-y-4">
        {policies.map((p) => (
          <Card key={p.id}>
            <h3 className="font-bold text-p-green">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-p-black/60">{p.text}</p>
          </Card>
        ))}
      </div>
    </PublicPage>
  );
}
