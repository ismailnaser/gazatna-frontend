import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "accent" | "outline" | "ghost" | "danger";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  href?: string;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-blue !text-white shadow-[-3px_4px_0_0_rgba(26,26,26,0.18)] hover:bg-brand-blue/90 focus-visible:ring-brand-blue disabled:bg-brand-blue/50",
  accent:
    "bg-brand-orange !text-white shadow-[-3px_4px_0_0_rgba(26,26,26,0.18)] hover:bg-brand-orange/90 focus-visible:ring-brand-orange disabled:bg-brand-orange/50",
  outline:
    "border-[3px] border-brand-blue bg-white !text-brand-blue shadow-[-3px_4px_0_0_rgba(66,76,243,0.18)] hover:bg-brand-blue hover:!text-white focus-visible:ring-brand-blue",
  ghost:
    "bg-transparent !text-brand-blue hover:bg-brand-blue/10 focus-visible:ring-brand-blue",
  danger:
    "bg-transparent !text-brand-orange hover:bg-brand-orange/10 focus-visible:ring-brand-orange",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 hover:-translate-y-0.5";

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
