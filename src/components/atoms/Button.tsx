import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  href?: string;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-violet-600 text-white shadow-sm hover:bg-violet-700 focus-visible:ring-violet-500",
  outline:
    "border border-violet-200 bg-white text-violet-700 hover:bg-violet-50 focus-visible:ring-violet-400",
  ghost: "text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

export function Button({
  variant = "primary",
  className,
  children,
  href,
  ...props
}: ButtonProps) {
  const classes = cn(base, variants[variant], className);

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
