import { Card } from "@/components/atoms/Card";
import { PublicPage } from "@/components/molecules/PublicPage";
import { accreditations } from "@/data/public";
import { Shield } from "lucide-react";

export default function AccreditationsPage() {
  return (
    <PublicPage title="الاعتمادات والشراكات" description="شعارات ومعلومات عن المؤسسات المعتمدة.">
      <div className="grid gap-6 sm:grid-cols-3">
        {accreditations.map((a) => (
          <Card key={a.id} className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-p-green/10">
              <Shield className="h-7 w-7 text-p-green" />
            </div>
            <h3 className="font-bold text-p-black">{a.name}</h3>
            <p className="mt-2 text-sm text-p-black/50">{a.desc}</p>
          </Card>
        ))}
      </div>
    </PublicPage>
  );
}
