import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const DATE_TYPES = new Set(["date", "datetime-local", "time", "month", "week"]);

export function Input({ label, error, className, id, type, ...props }: InputProps) {
  const inputId = id ?? label;
  const isDateField = type ? DATE_TYPES.has(type) : false;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-p-black/80">
          {label}
        </label>
      )}
      <div className="relative">
        {isDateField ? (
          <Calendar
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            aria-hidden
          />
        ) : null}
        <input
          id={inputId}
          type={type}
          dir={isDateField ? "ltr" : props.dir}
          lang={isDateField ? "en" : props.lang}
          className={cn(
            "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-p-black",
            "placeholder:text-neutral-400 focus:border-p-green focus:outline-none focus:ring-2 focus:ring-p-green/20",
            isDateField && "date-time-input ps-10",
            error && "border-p-red focus:border-p-red focus:ring-p-red/20",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-p-red">{error}</p>}
    </div>
  );
}
