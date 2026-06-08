import { Card } from "@/components/atoms/Card";
import { PublicPage } from "@/components/molecules/PublicPage";
import { programs } from "@/data/public";
import { BookOpen } from "lucide-react";

export default function ProgramsPage() {
  return (
    <PublicPage
      title="البرامج الأكاديمية"
      description="شرح تفصيلي لكل مرحلة دراسية مع مناهج متكاملة."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {programs.map((p) => (
          <Card key={p.id} className="flex flex-col">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-p-green/10">
              <BookOpen className="h-5 w-5 text-p-green" />
            </div>
            <h3 className="text-lg font-bold text-p-black">{p.title}</h3>
            <p className="mt-1 text-sm font-medium text-p-green">{p.grades}</p>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-p-black/60">{p.desc}</p>
          </Card>
        ))}
      </div>
    </PublicPage>
  );
}
