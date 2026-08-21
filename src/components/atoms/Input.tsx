import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  trailing?: React.ReactNode;
};

const DATE_TYPES = new Set(["date", "datetime-local", "time", "month", "week"]);

export function Input({ label, error, className, id, type, trailing, dir, inputMode, ...props }: InputProps) {
  const inputId = id ?? label;
  const isDateField = type ? DATE_TYPES.has(type) : false;
  const isNumericField =
    type === "number" || type === "tel" || inputMode === "numeric" || inputMode === "decimal";
  const resolvedDir = isDateField || isNumericField ? "ltr" : dir;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-p-black/80">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={type}
          dir={resolvedDir}
          inputMode={inputMode}
          lang={isDateField ? "en" : props.lang}
          className={cn(
            "w-full rounded-2xl border-2 border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-p-black",
            "placeholder:text-neutral-600 focus:border-p-green focus:outline-none focus:ring-2 focus:ring-p-green/20",
            type === "number" &&
              "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            isDateField && "date-time-input min-w-[9.5rem]",
            trailing && (resolvedDir === "ltr" ? "ps-12" : "pe-12"),
            resolvedDir === "ltr" && "text-right",
            error && "border-p-red focus:border-p-red focus:ring-p-red/20",
            className
          )}
          {...props}
        />
        {trailing ? (
          <div className="absolute end-2 top-1/2 -translate-y-1/2">{trailing}</div>
        ) : null}
      </div>
      {error && <p className="text-xs text-p-red">{error}</p>}
    </div>
  );
}
