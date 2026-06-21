"use client";

import { useCallback, useState } from "react";
import { exportGradesCertificatePdf, type GradesCertificateInput } from "@/lib/exportGradesCertificatePdf";

export function useGradesCertificateExport(onError?: (message: string) => void) {
  const [exporting, setExporting] = useState(false);

  const requestExport = useCallback(
    async (input: GradesCertificateInput) => {
      setExporting(true);
      try {
        await exportGradesCertificatePdf(input);
      } catch {
        onError?.("تعذر تحميل الشهادة");
      } finally {
        setExporting(false);
      }
    },
    [onError]
  );

  return { exporting, requestExport };
}
