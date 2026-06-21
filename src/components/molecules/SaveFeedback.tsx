"use client";

import { useEffect, useRef } from "react";
import { Alert } from "@/components/atoms/Alert";
import { cn } from "@/lib/utils";

type SaveFeedbackProps = {
  success?: string | null;
  error?: string | null;
  className?: string;
  scrollIntoView?: boolean;
};

export function SaveFeedback({
  success,
  error,
  className,
  scrollIntoView = false,
}: SaveFeedbackProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollIntoView || !success || !ref.current) return;
    ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [success, scrollIntoView]);

  if (!success && !error) return null;

  return (
    <div ref={ref} className={cn("space-y-2", className)}>
      {error ? <Alert variant="error">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}
    </div>
  );
}
