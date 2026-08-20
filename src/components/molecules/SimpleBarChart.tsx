"use client";

type BarItem = { label: string; value: number };

export function SimpleBarChart({
  data,
  color = "bg-p-green",
  maxValue,
  unit = "%",
}: {
  data: BarItem[];
  color?: string;
  maxValue?: number;
  /** Shown after the value (use "" for raw counts). */
  unit?: string;
}) {
  const computedMax =
    maxValue ??
    (unit === "%"
      ? 100
      : Math.max(1, ...data.map((item) => item.value)));

  return (
    <div className="flex h-48 items-end justify-between gap-3">
      {data.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-semibold text-p-black/70">
            {item.value}
            {unit}
          </span>
          <div className="flex w-full flex-1 items-end">
            <div
              className={`w-full rounded-t-lg ${color} transition-all`}
              style={{
                height: `${Math.min(100, (item.value / computedMax) * 100)}%`,
                minHeight: "8px",
              }}
            />
          </div>
          <span className="text-center text-xs leading-tight text-p-black/72">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
