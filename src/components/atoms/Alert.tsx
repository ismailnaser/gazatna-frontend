import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

type AlertVariant = "info" | "success" | "warning" | "error";

const styles: Record<AlertVariant, { bg: string; icon: typeof Info }> = {
  info: { bg: "bg-p-green/5 text-p-green border-p-green/20", icon: Info },
  success: { bg: "bg-p-green/10 text-p-green border-p-green/20", icon: CheckCircle },
  warning: { bg: "bg-amber-50 text-amber-800 border-amber-100", icon: AlertCircle },
  error: { bg: "bg-p-red/10 text-p-red border-p-red/20", icon: AlertCircle },
};

export function Alert({
  children,
  variant = "info",
  className,
}: {
  children: React.ReactNode;
  variant?: AlertVariant;
  className?: string;
}) {
  const { bg, icon: Icon } = styles[variant];
  return (
    <div className={cn("flex items-start gap-3 rounded-xl border p-4 text-sm", bg, className)}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
