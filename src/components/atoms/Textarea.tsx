import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id ?? label;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-p-black/80">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "min-h-[100px] rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-p-black",
          "placeholder:text-neutral-400 focus:border-p-green focus:outline-none focus:ring-2 focus:ring-p-green/20",
          error && "border-p-red",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-p-red">{error}</p>}
    </div>
  );
}
