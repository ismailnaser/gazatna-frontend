import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md";
};

export function Card({ children, className, padding = "md", ...rest }: CardProps) {
  const pads = {
    none: "p-0",
    sm: "p-4",
    md: "p-5 sm:p-6",
  };

  return (
    <div
      className={cn(
        "rounded-[1.6rem_0.7rem_1.6rem_0.9rem] border-[3px] border-black/10 bg-white shadow-[-5px_6px_0_0_rgba(66,76,243,0.12)]",
        pads[padding],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
