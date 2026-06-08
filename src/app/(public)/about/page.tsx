import { Card } from "@/components/atoms/Card";
import { PublicPage } from "@/components/molecules/PublicPage";
import { schoolValues } from "@/data/public";
import { Heart, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <PublicPage
      title="من نحن"
      description="مدرسة غَزتنا مؤسسة تعليمية رقمية تهدف إلى تمكين الطلاب من خلال بيئة تعلم آمنة ومبتكرة."
    >
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Card>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-p-green/10">
            <Target className="h-5 w-5 text-p-green" />
          </div>
          <h3 className="text-lg font-bold text-p-black">رؤيتنا</h3>
          <p className="mt-2 leading-relaxed text-p-black/60">
            أن نكون المدرسة الرقمية الرائدة في فلسطين، نُخرّج جيلاً قادراً على المنافسة
            عالمياً مع الحفاظ على الهوية والقيم.
          </p>
        </Card>
        <Card>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-p-green/10">
            <Heart className="h-5 w-5 text-p-green" />
          </div>
          <h3 className="text-lg font-bold text-p-black">رسالتنا</h3>
          <p className="mt-2 leading-relaxed text-p-black/60">
            توفير تعليم عالي الجودة يجمع بين المناهج الأكاديمية والمهارات الرقمية، مع
            دعم شامل لأولياء الأمور والمجتمع.
          </p>
        </Card>
      </div>

      <h2 className="mb-4 text-xl font-bold text-p-black">قيمنا</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {schoolValues.map((v) => (
          <Card key={v.title}>
            <h3 className="font-bold text-p-green">{v.title}</h3>
            <p className="mt-2 text-sm text-p-black/60">{v.desc}</p>
          </Card>
        ))}
      </div>
    </PublicPage>
  );
}
