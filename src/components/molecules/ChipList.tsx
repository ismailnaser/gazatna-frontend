import { cn } from "@/lib/utils";

export function ChipList({
  items,
  className,
  empty,
}: {
  items: string[];
  className?: string;
  empty?: string;
}) {
  if (items.length === 0) {
    return empty ? <span className="text-sm text-p-black/50">{empty}</span> : null;
  }

  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} role="list">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="max-w-full">
          <span className="inline-flex max-w-full rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-p-black/70">
            <span className="truncate">{item}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
