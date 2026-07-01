"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/atoms/Card";
import { api } from "@/lib/api";
import { formatAcademicPeriodParts } from "@/lib/academicPeriod";
import { mapAcademicContext } from "@/types/academic";
import { CalendarDays } from "lucide-react";

export function AcademicPeriodBanner() {
  const [parts, setParts] = useState<{
    yearLabel: string | null;
    termLabel: string | null;
    combined: string | null;
  } | null>(null);

  useEffect(() => {
    api
      .getAcademicContext()
      .then((raw) => setParts(formatAcademicPeriodParts(mapAcademicContext(raw as Record<string, unknown>))))
      .catch(() => setParts(null));
  }, []);

  if (!parts?.combined) return null;

  return (
    <Card className="mb-6 border-brand-blue/15 bg-brand-blue/5 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10">
          <CalendarDays className="h-5 w-5 text-brand-blue" />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-base font-bold text-p-black sm:text-lg">{parts.combined}</p>
          <p className="text-sm text-p-black/60">
            السنة الدراسية: <span className="font-semibold text-p-black">{parts.yearLabel ?? "—"}</span>
            {" · "}
            الفصل: <span className="font-semibold text-p-black">{parts.termLabel ?? "—"}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
