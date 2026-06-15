import Link from "next/link";
import { Card } from "@/components/atoms/Card";
import { cn } from "@/lib/utils";
import type { TeacherProfile } from "@/types/teacher";

export function TeacherCard({ teacher }: { teacher: TeacherProfile }) {
  const initial = teacher.name.replace(/^(د\.|أ\.|م\.)\s*/, "").charAt(0);

  return (
    <Link href={`/faculty/${teacher.id}`} className="block">
      <Card className="overflow-hidden p-0 text-center transition-shadow hover:shadow-md">
        <div
          className={cn(
            "relative flex aspect-square w-full items-center justify-center overflow-hidden bg-gradient-to-br text-4xl font-bold text-white",
            !teacher.imageUrl && teacher.imageGradient
          )}
        >
          {teacher.imageUrl ? (
            <img
              src={teacher.imageUrl}
              alt={teacher.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-[#1a1a1a] transition-colors group-hover:text-[var(--brand-teal)]">
            {teacher.name}
          </h3>
          <p className="mt-2 text-sm font-medium text-[var(--brand-teal)]">{teacher.subject}</p>
          <p className="mt-2 text-xs text-[#1a1a1a]/50">{teacher.experience}</p>
        </div>
      </Card>
    </Link>
  );
}
