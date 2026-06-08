import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: { value: string; label: string }[];
};

export function Select({ label, options, className, id, ...props }: SelectProps) {
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
        className={cn(
          "rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-p-black",
          "focus:border-p-green focus:outline-none focus:ring-2 focus:ring-p-green/20",
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
    </div>
  );
}
