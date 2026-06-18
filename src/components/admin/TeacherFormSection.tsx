import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/atoms/Card";
import { cn } from "@/lib/utils";

type TeacherFormSectionProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  tone?: "blue" | "violet" | "green" | "orange";
  children: React.ReactNode;
  className?: string;
};

const toneStyles = {
  blue: {
    header: "from-brand-blue/5 to-indigo-50",
    icon: "bg-brand-blue/10 text-brand-blue",
  },
  violet: {
    header: "from-violet-500/5 to-purple-50",
    icon: "bg-violet-500/10 text-violet-600",
  },
  green: {
    header: "from-p-green/5 to-emerald-50",
    icon: "bg-p-green/10 text-p-green",
  },
  orange: {
    header: "from-brand-orange/5 to-amber-50",
    icon: "bg-brand-orange/10 text-brand-orange",
  },
};

export function TeacherFormSection({
  icon: Icon,
  title,
  description,
  tone = "blue",
  children,
  className,
}: TeacherFormSectionProps) {
  const styles = toneStyles[tone];

  return (
    <Card className={cn("overflow-hidden p-0", className)}>
      <div className={cn("border-b border-neutral-100 bg-gradient-to-br px-5 py-4 sm:px-6", styles.header)}>
        <div className="flex items-center gap-3">
          <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", styles.icon)}>
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-p-black">{title}</h3>
            {description ? <p className="text-xs text-p-black/50">{description}</p> : null}
          </div>
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </Card>
  );
}
