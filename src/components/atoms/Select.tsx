import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
};

export function Select({
  label,
  options,
  className,
  id,
  error,
  disabled,
  ...props
}: SelectProps) {
  const selectId = id ?? label;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-p-black/80">
          {label}
        </label>
      )}
      <select
        id={selectId}
        disabled={disabled}
        className={cn(
          "rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-p-black",
          "focus:border-p-green focus:outline-none focus:ring-2 focus:ring-p-green/20",
          "cursor-pointer disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-p-black/45",
          error && "border-p-red focus:border-p-red focus:ring-p-red/20",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-p-red">{error}</p> : null}
    </div>
  );
}
