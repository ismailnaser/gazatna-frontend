"use client";

type BarItem = { label: string; value: number };

export function SimpleBarChart({
  data,
  color = "bg-p-green",
  maxValue = 100,
}: {
  data: BarItem[];
  color?: string;
  maxValue?: number;
}) {
  return (
    <div className="flex h-48 items-end justify-between gap-3">
      {data.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-semibold text-p-black/70">{item.value}%</span>
          <div className="flex w-full flex-1 items-end">
            <div
              className={`w-full rounded-t-lg ${color} transition-all`}
              style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: "8px" }}
            />
          </div>
          <span className="text-xs text-p-black/50">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
