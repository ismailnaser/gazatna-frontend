import { cn } from "@/lib/utils";

export function ProfileSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm",
        className
      )}
    >
      <div className="border-b border-neutral-200 bg-neutral-50/80 px-5 py-3.5">
        <h2 className="text-sm font-bold text-p-black">{title}</h2>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function ProfileField({
  label,
  value,
  dir,
  wide,
}: {
  label: string;
  value?: React.ReactNode;
  dir?: "ltr" | "rtl";
  wide?: boolean;
}) {
  const empty = value == null || value === "";
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5",
        wide && "sm:col-span-2"
      )}
    >
      <p className="border-b border-neutral-200 pb-2 text-xs font-semibold text-p-black/55">
        {label}
      </p>
      <div
        dir={dir}
        className="mt-2.5 min-h-[1.75rem] break-words text-sm font-medium leading-7 text-p-black"
      >
        {empty ? <span className="text-p-black/40">—</span> : value}
      </div>
    </div>
  );
}

export function formatProfileDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ar-PS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
