import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "accent" | "outline" | "ghost" | "danger";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  href?: string;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#064e3b] !text-white shadow-sm hover:bg-[#0d6b4f] focus-visible:ring-[#064e3b] disabled:bg-[#064e3b]/50",
  accent:
    "bg-[#881337] !text-white shadow-sm hover:bg-[#9f1239] focus-visible:ring-[#881337] disabled:bg-[#881337]/50",
  outline:
    "border-2 border-[#064e3b] bg-white !text-[#064e3b] hover:bg-[#064e3b] hover:!text-white focus-visible:ring-[#064e3b]",
  ghost:
    "bg-transparent !text-[#064e3b] hover:bg-[#064e3b]/10 focus-visible:ring-[#064e3b]",
  danger:
    "bg-transparent !text-[#881337] hover:bg-[#881337]/10 focus-visible:ring-[#881337]",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export function Button({
  variant = "primary",
  className,
  children,
  href,
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  const classes = cn(base, variants[variant], className);

  if (href && !disabled) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
